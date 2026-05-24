import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const leaveSchema = z.object({
  leaveType: z.enum(["ANNUAL", "SICK", "EMERGENCY", "MATERNITY", "PATERNITY", "UNPAID", "PERMISSION"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
  attachment: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || undefined;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status: status as never }),
      ...(user.role === "EMPLOYEE" && user.employee && {
        employeeId: user.employee.id,
      }),
    };

    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              photo: true,
              employeeId: true,
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return apiResponse({ data: leaves, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!user.employee) return apiError("Data karyawan tidak ditemukan", 404);

    const body = await request.json();
    const validation = leaveSchema.safeParse(body);
    if (!validation.success) {
      return apiError("Validasi gagal", 400, validation.error.issues);
    }

    const { leaveType, startDate, endDate, reason, attachment } = validation.data;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check balance for annual leave
    if (leaveType === "ANNUAL") {
      const balance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveType_year: {
            employeeId: user.employee.id,
            leaveType: "ANNUAL",
            year: new Date().getFullYear(),
          },
        },
      });

      if (!balance || balance.remaining < totalDays) {
        return apiError("Saldo cuti tidak mencukupi", 400);
      }
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: user.employee.id,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        attachment,
        status: "PENDING",
      },
      include: { employee: { select: { fullName: true } } },
    });

    return apiResponse(leave, "Pengajuan cuti berhasil dibuat", 201);
  } catch (error) {
    return apiError("Terjadi kesalahan server", 500);
  }
}
