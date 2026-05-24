import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

const TZ = "Asia/Makassar"; // GMT+8

function parseLocalTime(dateStr: string, timeStr: string | null): Date | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCHours(h - 8, m, 0, 0); // WIB/GMT+8 → UTC
  return d;
}

function calcLateMinutes(checkIn: Date, startTime: string, toleranceMinutes: number): number {
  const local = checkIn.toLocaleTimeString("en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  const [ciH, ciM] = local.split(":").map(Number);
  const [stH, stM] = startTime.split(":").map(Number);
  return Math.max(0, ciH * 60 + ciM - (stH * 60 + stM) - toleranceMinutes);
}

function calcWorkHours(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await request.json();
    const { employeeId, records } = body as {
      employeeId: string;
      records: Array<{
        date: string;        // "YYYY-MM-DD"
        status: string;
        checkInTime: string | null;
        checkOutTime: string | null;
        shiftId?: string | null;
        notes?: string;
      }>;
    };

    if (!employeeId) return apiError("employeeId wajib diisi", 400);
    if (!Array.isArray(records) || records.length === 0) return apiError("records tidak boleh kosong", 400);
    if (records.length > 31) return apiError("Maksimal 31 hari per request", 400);

    // Verify employee exists
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return apiError("Karyawan tidak ditemukan", 404);

    // Load all shifts referenced by the records (plus fallback default)
    const shiftIds = [...new Set(records.map(r => r.shiftId).filter((id): id is string => !!id))];
    const [shiftsArr, defaultShift] = await Promise.all([
      shiftIds.length > 0 ? prisma.shift.findMany({ where: { id: { in: shiftIds } } }) : Promise.resolve([]),
      prisma.shift.findFirst({ where: { isActive: true } }),
    ]);
    const shiftsMap = new Map(shiftsArr.map(s => [s.id, s]));

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const rec of records) {
      try {
        const dateObj = new Date(rec.date + "T00:00:00.000Z");
        const formCheckIn  = parseLocalTime(rec.date, rec.checkInTime);
        const formCheckOut = parseLocalTime(rec.date, rec.checkOutTime);

        const existing = await prisma.attendance.findUnique({
          where: { employeeId_date: { employeeId, date: dateObj } },
        });

        // Preserve real scan times when updating — only use form times for new records
        const checkInDt  = existing?.checkIn  ?? formCheckIn;
        const checkOutDt = existing?.checkOut ?? formCheckOut;

        // Use the shift assigned to this specific record, fall back to default
        const recShift = (rec.shiftId ? shiftsMap.get(rec.shiftId) : null) ?? defaultShift ?? null;

        let lateMinutes = 0;
        let workHours: number | null = null;
        let overtimeHours: number | null = null;
        let finalStatus = rec.status;

        if (checkInDt && recShift) {
          lateMinutes = calcLateMinutes(checkInDt, recShift.startTime, recShift.toleranceMinutes);
          if (lateMinutes > 0 && finalStatus === "PRESENT") finalStatus = "LATE";
        }
        if (checkInDt && checkOutDt) {
          workHours = calcWorkHours(checkInDt, checkOutDt);
          overtimeHours = Math.max(0, Math.round((workHours - 8) * 100) / 100);
        }

        const data = {
          checkIn: checkInDt,
          checkOut: checkOutDt,
          method: "MANUAL" as const,
          status: finalStatus as "PRESENT" | "LATE" | "ABSENT" | "WFH" | "PERMISSION" | "SICK",
          lateMinutes,
          workHours,
          overtimeHours,
          shiftId: recShift?.id ?? null,
          notes: rec.notes || null,
        };

        if (existing) {
          await prisma.attendance.update({ where: { id: existing.id }, data });
          updated++;
        } else {
          await prisma.attendance.create({ data: { employeeId, date: dateObj, ...data } });
          created++;
        }
      } catch {
        errors.push(rec.date);
      }
    }

    return apiResponse(
      { created, updated, errors },
      `Berhasil: ${created} dibuat, ${updated} diperbarui${errors.length ? `, ${errors.length} gagal` : ""}`
    );
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
