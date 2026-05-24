"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setSent(true);
    toast.success("Email reset password telah dikirim!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-navy">
            <span className="text-[#F4B400] font-bold text-lg">D</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white font-display">Daengtisia HR Suite</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-card">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Lupa Password?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@perusahaan.com"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-navy disabled:opacity-70"
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                  ) : (
                    "Kirim Link Reset"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Email Terkirim!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Kami telah mengirimkan link reset password ke{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
                Periksa inbox atau folder spam Anda.
              </p>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                Link reset password akan kadaluarsa dalam 1 jam.
              </div>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Kirim ulang email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              <ArrowLeft size={14} /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
