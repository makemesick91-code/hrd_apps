import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const { descriptor } = await request.json() as { descriptor: number[] };
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return apiError("Descriptor wajah tidak valid", 400);
    }

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return apiError("Karyawan tidak ditemukan", 404);

    await prisma.employee.update({
      where: { id },
      data: { faceDescriptor: JSON.stringify(descriptor) },
    });

    return apiResponse(null, "Wajah berhasil didaftarkan");
  } catch (error) {
    console.error("Save face error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return apiError("Karyawan tidak ditemukan", 404);

    await prisma.employee.update({
      where: { id },
      data: { faceDescriptor: null },
    });

    return apiResponse(null, "Data wajah berhasil dihapus");
  } catch (error) {
    console.error("Delete face error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { faceDescriptor: true },
    });
    if (!employee) return apiError("Karyawan tidak ditemukan", 404);

    return apiResponse({ enrolled: !!employee.faceDescriptor });
  } catch (error) {
    console.error("Get face error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
