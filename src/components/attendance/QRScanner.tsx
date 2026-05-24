"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, AlertCircle, RefreshCw } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Dynamic import jsQR to avoid SSR issues
    const jsQR = (await import("jsqr")).default;
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data) {
      stopCamera();
      onScan(code.data);
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [onScan, stopCamera]);

  const startCamera = useCallback(async () => {
    setError(null);
    setScanning(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Akses kamera ditolak. Izinkan akses kamera di browser Anda.");
      } else if (msg.includes("NotFound")) {
        setError("Kamera tidak ditemukan di perangkat ini.");
      } else {
        setError("Tidak bisa membuka kamera. Pastikan browser mendukung WebRTC.");
      }
    }
  }, [scanFrame]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-[#1E3A8A]" />
            <span className="font-semibold text-gray-900 dark:text-white">Scan QR Absensi</span>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-black aspect-square">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning overlay */}
          {scanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-56 h-56">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#F4B400] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#F4B400] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#F4B400] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#F4B400] rounded-br-lg" />
                {/* Scan line */}
                <div className="absolute inset-x-2 h-0.5 bg-[#F4B400]/70 animate-[scan_2s_ease-in-out_infinite]" style={{ top: "50%" }} />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-gray-900/90">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-white text-center text-sm">{error}</p>
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-medium"
              >
                <RefreshCw size={15} />
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Arahkan kamera ke QR Code absensi yang tersedia di kantor
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-80px); opacity: 0.3; }
          50% { transform: translateY(80px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
