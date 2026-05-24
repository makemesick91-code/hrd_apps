"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Camera, Save, Loader2, Bell, Shield } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "Ahmad",
    lastName: "Fauzi",
    phone: "081234567890",
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    bio: "Finance Manager dengan pengalaman 6 tahun di bidang keuangan perusahaan.",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("Profil berhasil diperbarui!");
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Password baru tidak cocok!");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("Password berhasil diubah!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Profil Saya"
        subtitle="Kelola informasi akun dan preferensi Anda"
        breadcrumb={[{ label: "Dashboard" }, { label: "Profil" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-2xl mx-auto">
                {getInitials(user?.employee?.fullName || user?.email || "U")}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#F4B400] rounded-xl flex items-center justify-center shadow-md hover:bg-amber-400 transition-colors">
                <Camera size={13} className="text-white" />
              </button>
            </div>
            <div className="mt-3">
              <div className="font-semibold text-gray-900 dark:text-white">
                {user?.employee?.fullName || "Pengguna"}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
              <span className="inline-block mt-2 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Nav */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 space-y-0.5">
            {[
              { key: "personal", label: "Informasi Pribadi", icon: <User size={16} /> },
              { key: "security", label: "Keamanan", icon: <Lock size={16} /> },
              { key: "notifications", label: "Notifikasi", icon: <Bell size={16} /> },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.key
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "personal" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Informasi Pribadi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nama Depan</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nama Belakang</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className={labelClass}>No. Telepon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Alamat</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bio / Deskripsi</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <Button
                  leftIcon={isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Ubah Password</h3>
                <p className="text-sm text-gray-400 mb-5">Gunakan password yang kuat dan unik untuk keamanan akun Anda.</p>
                <div className="space-y-4 max-w-md">
                  {[
                    { key: "current", label: "Password Saat Ini" },
                    { key: "new", label: "Password Baru" },
                    { key: "confirm", label: "Konfirmasi Password Baru" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className={labelClass}>{field.label}</label>
                      <input
                        type="password"
                        value={passwords[field.key as keyof typeof passwords]}
                        onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-5">
                  <Button onClick={handlePasswordChange} disabled={isSaving}>
                    Ubah Password
                  </Button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Riwayat Login</h3>
                <p className="text-sm text-gray-400 mb-4">Aktivitas login terakhir pada akun Anda.</p>
                <div className="space-y-3">
                  {[
                    { device: "Chrome - Windows 10", ip: "192.168.1.105", time: "Hari ini, 08:32", current: true },
                    { device: "Safari - MacOS", ip: "192.168.1.88", time: "Kemarin, 17:10", current: false },
                    { device: "Firefox - Windows 11", ip: "192.168.1.12", time: "2 hari lalu", current: false },
                  ].map((login, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${login.current ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                        <Shield size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {login.device}
                          {login.current && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">Sesi ini</span>}
                        </div>
                        <div className="text-xs text-gray-400">{login.ip} · {login.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Preferensi Notifikasi</h3>
              <p className="text-sm text-gray-400 mb-5">Atur notifikasi yang ingin Anda terima.</p>
              <div className="space-y-4">
                {[
                  { label: "Notifikasi Email", desc: "Terima ringkasan aktivitas melalui email", enabled: true },
                  { label: "Persetujuan Cuti", desc: "Notifikasi saat cuti Anda diproses", enabled: true },
                  { label: "Slip Gaji Tersedia", desc: "Notifikasi saat slip gaji sudah bisa diunduh", enabled: true },
                  { label: "Pengingat Absensi", desc: "Ingatkan check-in/check-out harian", enabled: false },
                  { label: "Pengumuman Perusahaan", desc: "Notifikasi pengumuman dari perusahaan", enabled: true },
                  { label: "Performance Review", desc: "Notifikasi saat periode review dimulai", enabled: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{notif.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{notif.desc}</div>
                    </div>
                    <button
                      className={`relative w-11 h-6 rounded-full transition-colors ${notif.enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notif.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-5">
                <Button onClick={() => toast.success("Preferensi notifikasi disimpan!")}>
                  Simpan Preferensi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
