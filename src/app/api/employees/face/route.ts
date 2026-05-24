import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

// Save face descriptor for the logged-in employee
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!user.employee) return apiError("Data karyawan tidak ditemukan", 404);

    const { descriptor } = await request.json() as { descriptor: number[] };
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return apiError("Descriptor wajah tidak valid", 400);
    }

    await prisma.employee.update({
      where: { id: user.employee.id },
      data: { faceDescriptor: JSON.stringify(descriptor) },
    });

    return apiResponse(null, "Wajah berhasil didaftarkan");
  } catch (error) {
    console.error("Save face error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

// Get face descriptor for the logged-in employee (for verification)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!user.employee) return apiError("Data karyawan tidak ditemukan", 404);

    const employee = await prisma.employee.findUnique({
      where: { id: user.employee.id },
      select: { faceDescriptor: true },
    });

    if (!employee?.faceDescriptor) {
      return apiError("Wajah belum didaftarkan", 404);
    }

    return apiResponse({ descriptor: JSON.parse(employee.faceDescriptor) });
  } catch (error) {
    console.error("Get face error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
