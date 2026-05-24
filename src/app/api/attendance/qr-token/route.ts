import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { apiResponse, apiError } from "@/lib/utils";

const QR_SECRET = process.env.JWT_SECRET + "-qr-attendance";
// QR token valid for 5 minutes, window = minute / 5 (changes every 5 min)
const WINDOW_MINUTES = 5;

function currentWindow() {
  return Math.floor(Date.now() / (WINDOW_MINUTES * 60 * 1000));
}

export function generateQRToken(officeId = "main") {
  const window = currentWindow();
  return jwt.sign({ officeId, window, type: "attendance-qr" }, QR_SECRET, { expiresIn: "10m" });
}

export function verifyQRToken(token: string): { officeId: string; window: number } | null {
  try {
    const payload = jwt.verify(token, QR_SECRET) as { officeId: string; window: number; type: string };
    if (payload.type !== "attendance-qr") return null;
    // Accept current window and previous window (up to 10 min grace)
    if (Math.abs(payload.window - currentWindow()) > 1) return null;
    return payload;
  } catch {
    return null;
  }
}

// GET — returns a fresh QR token for the office kiosk display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId") || "main";
    const token = generateQRToken(officeId);
    const expiresAt = new Date(Date.now() + WINDOW_MINUTES * 60 * 1000);
    return apiResponse({ token, expiresAt, windowMinutes: WINDOW_MINUTES });
  } catch (error) {
    console.error("QR token error:", error);
    return apiError("Gagal membuat QR token", 500);
  }
}
