import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const { password: _, refreshToken: __, ...safeUser } = user;
    return apiResponse(safeUser, "Success");
  } catch {
    return apiError("Terjadi kesalahan server", 500);
  }
}
