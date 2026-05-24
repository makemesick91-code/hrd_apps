import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });

    return apiResponse(departments);
  } catch (error) {
    console.error("Get departments error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
