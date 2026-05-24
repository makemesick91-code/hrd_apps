import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  signToken,
  signRefreshToken,
} from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return apiError("Validasi gagal", 400, validation.error.issues);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            photo: true,
            departmentId: true,
            positionId: true,
          },
        },
      },
    });

    if (!user) {
      return apiError("Email atau password salah", 401);
    }

    if (!user.isActive) {
      return apiError("Akun Anda tidak aktif. Hubungi administrator.", 401);
    }

    // Check lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return apiError("Akun terkunci. Coba lagi nanti.", 423);
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      const attempts = user.loginAttempts + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: lockUntil,
        },
      });

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          success: false,
        },
      });

      return apiError("Email atau password salah", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee?.id,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee?.id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
        refreshToken,
      },
    });

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        success: true,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return apiResponse(
      { user: userWithoutPassword, token, refreshToken },
      "Login berhasil"
    );
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
