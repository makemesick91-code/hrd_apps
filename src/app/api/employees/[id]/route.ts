import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, lastLogin: true } },
        department: true,
        position: true,
        branch: true,
        manager: { select: { id: true, fullName: true, photo: true } },
        workHistories: { orderBy: { startDate: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        leaveBalances: { where: { year: new Date().getFullYear() } },
      },
    });

    if (!employee) return apiError("Karyawan tidak ditemukan", 404);
    return apiResponse(employee);
  } catch (error) {
    console.error("Get employee error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) {
      return apiError("Tidak memiliki akses", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const { userId, employeeId, createdAt, updatedAt, user: _, ...updateData } = body;

    const oldEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!oldEmployee) return apiError("Karyawan tidak ditemukan", 404);

    if (updateData.joinDate) updateData.joinDate = new Date(updateData.joinDate);
    if (updateData.birthDate) updateData.birthDate = new Date(updateData.birthDate);
    if (updateData.contractStart) updateData.contractStart = new Date(updateData.contractStart);
    if (updateData.contractEnd) updateData.contractEnd = new Date(updateData.contractEnd);

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: { department: true, position: true, branch: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "Employee",
        entityId: id,
        oldData: oldEmployee as never,
        newData: updateData,
      },
    });

    return apiResponse(employee, "Data karyawan berhasil diperbarui");
  } catch (error) {
    console.error("Update employee error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (user.role !== "SUPER_ADMIN") return apiError("Tidak memiliki akses", 403);

    const { id } = await params;
    await prisma.employee.update({
      where: { id },
      data: { employmentStatus: "TERMINATED" },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entity: "Employee",
        entityId: id,
      },
    });

    return apiResponse(null, "Karyawan berhasil dihapus");
  } catch (error) {
    console.error("Delete employee error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
