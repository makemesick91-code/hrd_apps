import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!branch) return apiError("Cabang tidak ditemukan", 404);

    return apiResponse(branch);
  } catch (error) {
    console.error("Get branch error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const body = await request.json();
    const { name, code, address, city, phone, isMain, latitude, longitude, radius } = body;

    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) return apiError("Cabang tidak ditemukan", 404);

    if (code && code !== branch.code) {
      const dup = await prisma.branch.findFirst({ where: { code, NOT: { id } } });
      if (dup) return apiError("Kode cabang sudah digunakan", 400);
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        address: address !== undefined ? (address || null) : undefined,
        city: city !== undefined ? (city || null) : undefined,
        phone: phone !== undefined ? (phone || null) : undefined,
        ...(isMain !== undefined && { isMain }),
        latitude: latitude !== undefined ? (latitude != null ? Number(latitude) : null) : undefined,
        longitude: longitude !== undefined ? (longitude != null ? Number(longitude) : null) : undefined,
        radius: radius != null ? Number(radius) : undefined,
      },
    });

    return apiResponse(updated, "Cabang berhasil diperbarui");
  } catch (error) {
    console.error("Update branch error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN"].includes(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });
    if (!branch) return apiError("Cabang tidak ditemukan", 404);
    if (branch._count.employees > 0) return apiError("Tidak dapat menghapus cabang yang masih memiliki karyawan", 400);

    await prisma.branch.delete({ where: { id } });
    return apiResponse(null, "Cabang berhasil dihapus");
  } catch (error) {
    console.error("Delete branch error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
