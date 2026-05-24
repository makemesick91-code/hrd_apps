import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { verifyQRToken } from "./qr-token/route";

// Convert UTC Date to local time string "HH:mm" in given IANA timezone
function toLocalTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Get today's date string "YYYY-MM-DD" in given timezone
function todayInTimezone(timezone: string): Date {
  const now = new Date();
  // Get the date string in the target timezone
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone }); // "YYYY-MM-DD"
  return new Date(dateStr + "T00:00:00.000Z");
}

// Calculate late minutes: how many minutes after shiftStart (in local tz) did check-in happen
function calcLateMinutes(checkIn: Date, shiftStart: string, timezone: string, toleranceMinutes = 15): number {
  const localTime = toLocalTime(checkIn, timezone); // "HH:mm"
  const [ciH, ciM] = localTime.split(":").map(Number);
  const [stH, stM] = shiftStart.split(":").map(Number);
  const checkInMins = ciH * 60 + ciM;
  const startMins = stH * 60 + stM;
  const late = checkInMins - startMins - toleranceMinutes;
  return Math.max(0, late);
}

// Calculate early leave minutes: how many minutes before shiftEnd did check-out happen
function calcEarlyLeaveMinutes(checkOut: Date, shiftEnd: string, timezone: string): number {
  const localTime = toLocalTime(checkOut, timezone);
  const [coH, coM] = localTime.split(":").map(Number);
  const [endH, endM] = shiftEnd.split(":").map(Number);
  const checkOutMins = coH * 60 + coM;
  const endMins = endH * 60 + endM;
  const early = endMins - checkOutMins;
  return Math.max(0, early);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    const where = {
      ...(employeeId && { employeeId }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
      // EMPLOYEE role only sees own data
      ...(user.role === "EMPLOYEE" && user.employee && {
        employeeId: user.employee.id,
      }),
    };

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              photo: true,
              employeeId: true,
              department: { select: { name: true } },
            },
          },
          shift: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return apiResponse({ data: attendance, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get attendance error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { type, latitude, longitude, method = "MANUAL", notes, qrToken } = body;

    if (!user.employee) return apiError("Data karyawan tidak ditemukan", 404);

    // Validate QR token when method is QR_CODE
    if (method === "QR_CODE") {
      if (!qrToken) return apiError("QR token tidak ditemukan", 400);
      const qrPayload = verifyQRToken(qrToken);
      if (!qrPayload) return apiError("QR code tidak valid atau sudah kadaluarsa", 400);
    }

    // Get active shift (default to first active shift)
    const shift = await prisma.shift.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const timezone = shift?.timezone || "Asia/Makassar";
    const today = todayInTimezone(timezone);

    let attendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: user.employee.id, date: today } },
    });

    if (type === "check-in") {
      if (attendance) return apiError("Sudah check in hari ini", 400);

      const now = new Date();

      // Calculate lateness in GMT+8
      let lateMinutes = 0;
      let status: "PRESENT" | "LATE" = "PRESENT";

      if (shift) {
        lateMinutes = calcLateMinutes(now, shift.startTime, timezone, shift.toleranceMinutes);
        if (lateMinutes > 0) status = "LATE";
      }

      const localCheckInTime = toLocalTime(now, timezone);

      attendance = await prisma.attendance.create({
        data: {
          employeeId: user.employee.id,
          shiftId: shift?.id,
          date: today,
          checkIn: now,
          checkInLat: latitude,
          checkInLng: longitude,
          method,
          status,
          lateMinutes,
          notes,
        },
      });

      const message = lateMinutes > 0
        ? `Check in berhasil pukul ${localCheckInTime} WIB — Terlambat ${lateMinutes} menit`
        : `Check in berhasil pukul ${localCheckInTime} WIB`;

      return apiResponse(attendance, message);
    }

    if (type === "check-out") {
      if (!attendance) return apiError("Belum check in hari ini", 400);
      if (attendance.checkOut) return apiError("Sudah check out hari ini", 400);

      const now = new Date();
      const workHours = attendance.checkIn
        ? (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60)
        : 0;

      // Calculate early leave
      let earlyLeaveMinutes = 0;
      if (shift) {
        earlyLeaveMinutes = calcEarlyLeaveMinutes(now, shift.endTime, timezone);
      }

      const localCheckOutTime = toLocalTime(now, timezone);

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: now,
          checkOutLat: latitude,
          checkOutLng: longitude,
          workHours: Math.round(workHours * 100) / 100,
          overtimeHours: Math.max(0, Math.round((workHours - 8) * 100) / 100),
          earlyLeaveMinutes,
        },
      });

      const message = earlyLeaveMinutes > 0
        ? `Check out pukul ${localCheckOutTime} WIB — Pulang lebih awal ${earlyLeaveMinutes} menit`
        : `Check out berhasil pukul ${localCheckOutTime} WIB`;

      return apiResponse(attendance, message);
    }

    // Manual entry by HRD/Admin for any employee on any date
    if (type === "manual") {
      if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

      const { targetEmployeeId, date, checkInTime, checkOutTime, status = "PRESENT", manualNotes } = body;
      if (!targetEmployeeId || !date) return apiError("Karyawan dan tanggal wajib diisi", 400);

      const tz = "Asia/Makassar";
      const dateObj = new Date(date + "T00:00:00.000Z");

      // Build checkIn / checkOut as full UTC DateTimes
      const parseLocalTime = (dateStr: string, timeStr: string) => {
        if (!timeStr) return null;
        // dateStr = "YYYY-MM-DD", timeStr = "HH:mm"
        // Interpret time as local (GMT+8 = offset -480 min from UTC)
        const [h, m] = timeStr.split(":").map(Number);
        const d = new Date(dateStr + "T00:00:00.000Z");
        d.setUTCHours(h - 8, m, 0, 0); // subtract 8h to convert WIB → UTC
        return d;
      };

      const checkInDt = checkInTime ? parseLocalTime(date, checkInTime) : null;
      const checkOutDt = checkOutTime ? parseLocalTime(date, checkOutTime) : null;

      // Fetch existing record first so we can preserve its shift when editing
      const existing = await prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: targetEmployeeId, date: dateObj } },
        include: { shift: true },
      });

      // Use the shift already on the record (edit) or fall back to first active shift (new)
      const shift = existing?.shift
        ?? await prisma.shift.findFirst({ where: { isActive: true } });

      let lateMinutes = 0;
      let computedStatus = status;

      if (checkInDt && shift) {
        lateMinutes = calcLateMinutes(checkInDt, shift.startTime, tz, shift.toleranceMinutes);
        if (lateMinutes > 0 && computedStatus === "PRESENT") computedStatus = "LATE";
      }

      let workHours: number | null = null;
      let overtimeHours: number | null = null;
      let earlyLeaveMinutes: number | null = null;

      if (checkInDt && checkOutDt) {
        workHours = Math.round((checkOutDt.getTime() - checkInDt.getTime()) / (1000 * 60 * 60) * 100) / 100;
        overtimeHours = Math.max(0, Math.round((workHours - 8) * 100) / 100);
        if (shift) earlyLeaveMinutes = calcEarlyLeaveMinutes(checkOutDt, shift.endTime, tz);
      }

      const data = {
        checkIn: checkInDt,
        checkOut: checkOutDt,
        method: "MANUAL" as const,
        status: computedStatus as "PRESENT" | "LATE" | "ABSENT" | "WFH" | "PERMISSION" | "SICK",
        lateMinutes,
        workHours,
        overtimeHours,
        earlyLeaveMinutes,
        notes: manualNotes || notes,
        // When editing keep the existing shiftId; for new records use the active shift
        shiftId: existing ? (existing.shiftId ?? null) : (shift?.id ?? null),
      };

      const record = existing
        ? await prisma.attendance.update({ where: { id: existing.id }, data })
        : await prisma.attendance.create({ data: { employeeId: targetEmployeeId, date: dateObj, ...data } });

      return apiResponse(record, existing ? "Absensi berhasil diperbarui" : "Absensi manual berhasil ditambahkan");
    }

    return apiError("Tipe tidak valid", 400);
  } catch (error) {
    console.error("Attendance action error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
