"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("admin@daengtisia.com");
  const [password, setPassword] = useState("admin123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token, refreshToken } = res.data.data;

      login(user, token, refreshToken);

      // Set cookie for middleware
      document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      toast.success("Login berhasil! Selamat datang.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login gagal. Periksa email dan password Anda.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#F4B400]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl"></div>
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#F4B400] rounded-2xl flex items-center justify-center shadow-gold-lg">
              <span className="text-[#1E3A8A] font-black text-2xl">D</span>
            </div>
            <div>
              <div className="text-white font-bold text-2xl font-display">Daengtisia</div>
              <div className="text-[#F4B400] text-sm font-medium tracking-widest uppercase">HR Suite</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#F4B400] text-sm font-semibold mb-4">
                <Sparkles size={16} />
                Enterprise HR Platform 2026
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight font-display">
                Kelola SDM
                <br />
                <span className="text-[#F4B400]">Lebih Cerdas</span>
                <br />
                & Efisien
              </h1>
              <p className="text-blue-200 text-lg mt-4 leading-relaxed">
                Platform HR enterprise terlengkap untuk mengelola karyawan,
                absensi, payroll, dan rekrutmen dalam satu sistem terintegrasi.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "10K+", label: "Karyawan" },
                { value: "500+", label: "Perusahaan" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#F4B400] font-display">{stat.value}</div>
                  <div className="text-blue-200 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-blue-300 text-sm">
            © 2026 Daengtisia Corporation. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center">
              <span className="text-[#F4B400] font-black text-lg">D</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">Daengtisia HR Suite</div>
              <div className="text-xs text-gray-400">Enterprise Platform</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-premium p-8 border border-gray-100 dark:border-gray-800">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
                Selamat Datang
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Masuk ke portal HR Daengtisia
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent dark:text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#1E3A8A] dark:text-blue-400 font-medium hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent dark:text-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-xl hover:opacity-95 hover:shadow-navy transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-[#F4B400]/10 rounded-xl border border-[#F4B400]/20">
              <div className="text-xs font-semibold text-[#B45309] dark:text-[#F4B400] mb-2">
                Demo Credentials:
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Email: <span className="font-mono font-medium">admin@daengtisia.com</span></div>
                <div>Password: <span className="font-mono font-medium">admin123456</span></div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link href="/register" className="text-[#1E3A8A] dark:text-blue-400 font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
