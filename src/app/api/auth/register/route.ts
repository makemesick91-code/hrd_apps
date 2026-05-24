import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, signRefreshToken } from "@/lib/auth";
import { apiResponse, apiError, generateEmployeeId } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
  lastName: z.string().min(1, "Nama belakang wajib diisi"),
  role: z.enum(["SUPER_ADMIN", "HRD", "MANAGER", "EMPLOYEE"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return apiError("Validasi gagal", 400, validation.error.issues);
    }

    const { email, password, firstName, lastName, role = "EMPLOYEE" } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("Email sudah terdaftar", 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          isVerified: true,
        },
      });

      const empId = generateEmployeeId();
      await tx.employee.create({
        data: {
          userId: newUser.id,
          employeeId: empId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          gender: "MALE",
          joinDate: new Date(),
        },
      });

      return newUser;
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

    return apiResponse({ token, refreshToken }, "Registrasi berhasil", 201);
  } catch (error) {
    console.error("Register error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
