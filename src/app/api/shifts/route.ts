import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;
const optTime = (v: unknown) => (typeof v === "string" && timeRe.test(v) ? v : null);

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    const shifts = await prisma.shift.findMany({ orderBy: { createdAt: "asc" } });
    return apiResponse(shifts);
  } catch (error) {
    console.error("Get shifts error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await request.json();
    const { name, code, startTime, endTime } = body;

    if (!name || !code || !startTime || !endTime) return apiError("Nama, kode, jam masuk, dan jam keluar wajib diisi", 400);
    if (!timeRe.test(startTime) || !timeRe.test(endTime)) return apiError("Format waktu tidak valid", 400);

    const shift = await prisma.shift.create({ data: buildData(body) });
    return apiResponse(shift, "Shift berhasil dibuat");
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") return apiError("Kode shift sudah digunakan", 400);
    console.error("Create shift error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await request.json();
    if (!body.id) return apiError("ID shift diperlukan", 400);
    if (!timeRe.test(body.startTime) || !timeRe.test(body.endTime)) return apiError("Format waktu tidak valid", 400);

    const shift = await prisma.shift.update({ where: { id: body.id }, data: buildData(body) });
    return apiResponse(shift, "Shift berhasil diperbarui");
  } catch (error) {
    console.error("Update shift error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const { id } = await request.json();
    if (!id) return apiError("ID shift diperlukan", 400);

    await prisma.shift.delete({ where: { id } });
    return apiResponse(null, "Shift berhasil dihapus");
  } catch (error) {
    console.error("Delete shift error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

function buildData(b: Record<string, unknown>) {
  return {
    name:                b.name as string,
    code:                b.code as string,
    startTime:           b.startTime as string,
    endTime:             b.endTime as string,
    breakStart:          optTime(b.breakStart),
    breakEnd:            optTime(b.breakEnd),
    scanInStart:         optTime(b.scanInStart),
    scanInEnd:           optTime(b.scanInEnd),
    scanOutStart:        optTime(b.scanOutStart),
    scanOutEnd:          optTime(b.scanOutEnd),
    workDays:            Array.isArray(b.workDays) ? b.workDays as number[] : [1,2,3,4,5],
    toleranceMinutes:    Number(b.toleranceMinutes)    || 15,
    earlyLeaveTolerance: Number(b.earlyLeaveTolerance) || 0,
    workDaysCount:       Number(b.workDaysCount)       || 1,
    workMinutesCount:    Number(b.workMinutesCount)    || 0,
    color:               typeof b.color === "string"   ? b.color : "#1E3A8A",
    requireCheckIn:      b.requireCheckIn  !== false,
    requireCheckOut:     b.requireCheckOut !== false,
    timezone:            typeof b.timezone === "string" ? b.timezone : "Asia/Makassar",
    isActive:            b.isActive !== false,
  };
}
