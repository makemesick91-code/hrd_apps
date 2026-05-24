import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId") || undefined;

    const positions = await prisma.position.findMany({
      where: { ...(departmentId && { departmentId }) },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, departmentId: true },
    });

    return apiResponse(positions);
  } catch (error) {
    console.error("Get positions error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
