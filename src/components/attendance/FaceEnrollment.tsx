"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  targetEmployeeId?: string; // if set, admin enrolls for this employee
}

type Step = "loading" | "ready" | "capturing" | "processing" | "done" | "error";

export default function FaceEnrollment({ onClose, onSuccess, targetEmployeeId }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [message, setMessage] = useState("Memuat model pengenalan wajah...");

  const startCamera = async () => {
    setStep("loading");
    setMessage("Memuat model pengenalan wajah...");
    try {
      const faceapi = await import("face-api.js");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      setMessage("Membuka kamera...");
      streamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStep("ready");
      setMessage("Posisikan wajah Anda di dalam kotak, lalu klik Daftar Wajah");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setMessage("Akses kamera ditolak. Izinkan kamera di browser Anda.");
      } else {
        setMessage("Gagal memuat. Pastikan kamera tersedia.");
      }
      setStep("error");
    }
  };

  useEffect(() => {
    startCamera();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setStep("capturing");
    setMessage("Mendeteksi wajah...");

    try {
      const faceapi = await import("face-api.js");
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });
      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStep("ready");
        setMessage("Wajah tidak terdeteksi. Pastikan pencahayaan cukup dan wajah terlihat jelas.");
        toast.error("Wajah tidak terdeteksi, coba lagi");
        return;
      }

      setStep("processing");
      setMessage("Menyimpan data wajah...");

      const descriptor = Array.from(detection.descriptor);
      const url = targetEmployeeId
        ? `/api/employees/${targetEmployeeId}/face`
        : "/api/employees/face";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("done");
        setMessage("Wajah berhasil didaftarkan!");
        streamRef.current?.getTracks().forEach(t => t.stop());
        toast.success("Wajah berhasil didaftarkan");
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      } else {
        setStep("ready");
        setMessage(data.message || "Gagal menyimpan. Coba lagi.");
        toast.error(data.message || "Gagal menyimpan wajah");
      }
    } catch {
      setStep("error");
      setMessage("Terjadi kesalahan. Coba lagi.");
      toast.error("Gagal mendaftarkan wajah");
    }
  };

  const handleRetry = () => { startCamera(); };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Daftar Wajah</h2>
            <p className="text-xs text-gray-400 mt-0.5">Untuk verifikasi absensi</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Camera area */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${step === "done" ? "opacity-50" : ""}`}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Face guide overlay */}
          {(step === "ready" || step === "capturing") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-56 border-4 border-white/70 rounded-full opacity-70" />
            </div>
          )}

          {/* Loading/processing overlay */}
          {(step === "loading" || step === "processing" || step === "capturing") && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-white" />
              <p className="text-white text-sm font-medium text-center px-4">{message}</p>
            </div>
          )}

          {/* Success overlay */}
          {step === "done" && (
            <div className="absolute inset-0 bg-emerald-500/30 flex flex-col items-center justify-center gap-3">
              <CheckCircle2 size={48} className="text-emerald-400" />
              <p className="text-white text-sm font-semibold">Wajah berhasil didaftarkan!</p>
            </div>
          )}

          {/* Error overlay */}
          {step === "error" && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 p-6">
              <p className="text-white text-sm text-center">{message}</p>
              <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm transition-colors">
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Status & actions */}
        <div className="px-6 py-4 space-y-3">
          {step === "ready" && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{message}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleCapture}
              disabled={step !== "ready"}
              className="flex-1 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={16} />
              Daftar Wajah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
