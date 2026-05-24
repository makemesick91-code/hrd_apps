"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, Clock } from "lucide-react";
import QRCode from "qrcode";

const REFRESH_SECONDS = 300; // 5 minutes

export default function QRDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(REFRESH_SECONDS);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/qr-token");
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
        setTimeLeft(REFRESH_SECONDS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Draw QR code whenever token changes
  useEffect(() => {
    if (!token || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, token, {
      width: 240,
      margin: 2,
      color: { dark: "#1E3A8A", light: "#FFFFFF" },
    });
  }, [token]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, REFRESH_SECONDS * 1000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">QR Code Absensi Kantor</div>

      <div className="relative">
        {loading ? (
          <div className="w-60 h-60 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
            <RefreshCw size={28} className="animate-spin text-[#1E3A8A]" />
          </div>
        ) : (
          <canvas ref={canvasRef} className="rounded-xl" />
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock size={13} />
        <span>Refresh dalam <span className="font-semibold text-gray-600 dark:text-gray-300 tabular-nums">{mins}:{String(secs).padStart(2, "0")}</span></span>
      </div>

      <button
        onClick={fetchToken}
        className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-1"
      >
        <RefreshCw size={11} />
        Refresh sekarang
      </button>
    </div>
  );
}
