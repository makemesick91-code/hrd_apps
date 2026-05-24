"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    joinDate: "",
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      toast.error("Harap setujui syarat dan ketentuan.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          gender: "MALE",
          joinDate: form.joinDate || new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Akun berhasil dibuat! Silakan login.");
        router.push("/login");
      } else {
        toast.error(data.message || "Registrasi gagal.");
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-[#F4B400]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-[#2563EB]/30 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#F4B400] rounded-2xl flex items-center justify-center shadow-gold">
              <span className="text-[#1E3A8A] font-bold text-xl">D</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl font-display">Daengtisia</div>
              <div className="text-white/60 text-xs tracking-widest uppercase">HR Suite</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
            Bergabunglah<br />dengan Tim Kami
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Daftarkan akun Anda dan mulai kelola aktivitas HR dengan lebih efisien.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            "Manajemen absensi & cuti terintegrasi",
            "Payroll otomatis dengan perhitungan pajak",
            "Dashboard analytics real-time",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-3 text-white/80">
              <CheckCircle2 size={18} className="text-[#F4B400] flex-shrink-0" />
              <span className="text-sm">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Buat Akun Baru</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Isi formulir di bawah untuk mendaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Depan *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Ahmad"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Belakang *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Fauzi"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@perusahaan.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 karakter"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agree" className="text-sm text-gray-600 dark:text-gray-400">
                Saya menyetujui{" "}
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">Syarat & Ketentuan</span>
                {" "}dan{" "}
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">Kebijakan Privasi</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#3B82F6] text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-navy disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Mendaftar...</>
              ) : (
                <><UserPlus size={16} /> Buat Akun</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
