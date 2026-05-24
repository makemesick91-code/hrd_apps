import { NextRequest } from "next/server";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError, generateEmployeeId } from "@/lib/utils";
import { z } from "zod";

const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE"]),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  contractType: z.enum(["PERMANENT", "CONTRACT", "INTERNSHIP", "FREELANCE", "PART_TIME"]).optional(),
  joinDate: z.string(),
  basicSalary: z.number().optional(),
  role: z.enum(["SUPER_ADMIN", "HRD", "MANAGER", "EMPLOYEE"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { employeeId: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(departmentId && { departmentId }),
      ...(status && { employmentStatus: status as never }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          position: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return apiResponse({
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get employees error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);
    if (!["SUPER_ADMIN", "HRD"].includes(user.role)) {
      return apiError("Tidak memiliki akses", 403);
    }

    const body = await request.json();
    const validation = createEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return apiError("Validasi gagal", 400, validation.error.issues);
    }

    const {
      email, password, firstName, lastName, gender,
      phone, departmentId, positionId, contractType,
      joinDate, basicSalary, role = "EMPLOYEE",
    } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError("Email sudah terdaftar", 409);

    const hashedPassword = await hashPassword(password);
    const empId = generateEmployeeId();

    const employee = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, password: hashedPassword, role, isVerified: true },
      });

      return tx.employee.create({
        data: {
          userId: newUser.id,
          employeeId: empId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          gender,
          phone,
          departmentId,
          positionId,
          contractType: contractType || "PERMANENT",
          joinDate: new Date(joinDate),
          basicSalary: basicSalary || 0,
        },
        include: {
          department: true,
          position: true,
          user: { select: { id: true, email: true, role: true } },
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entity: "Employee",
        entityId: employee.id,
        newData: { employeeId: empId, fullName: `${firstName} ${lastName}` },
      },
    });

    return apiResponse(employee, "Karyawan berhasil ditambahkan", 201);
  } catch (error) {
    console.error("Create employee error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
