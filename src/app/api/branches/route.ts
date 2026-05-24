import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const branches = await prisma.branch.findMany({
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      include: { _count: { select: { employees: true } } },
    });

    return apiResponse(branches);
  } catch (error) {
    console.error("Get branches error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await request.json();
    const { name, code, address, city, phone, isMain, latitude, longitude, radius } = body;

    if (!name || !code) return apiError("Nama dan kode cabang wajib diisi", 400);

    const company = await prisma.company.findFirst();
    if (!company) return apiError("Data perusahaan tidak ditemukan", 404);

    const existing = await prisma.branch.findFirst({ where: { code } });
    if (existing) return apiError("Kode cabang sudah digunakan", 400);

    const branch = await prisma.branch.create({
      data: {
        companyId: company.id,
        name,
        code,
        address: address || null,
        city: city || null,
        phone: phone || null,
        isMain: isMain ?? false,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        radius: radius != null ? Number(radius) : 100,
      },
    });

    return apiResponse(branch, "Cabang berhasil ditambahkan", 201);
  } catch (error) {
    console.error("Create branch error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
