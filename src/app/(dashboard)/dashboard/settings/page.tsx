"use client";

import { useState } from "react";
import { Building2, Palette, Shield, Bell, Upload, Save, Clock, Globe } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import ShiftSettings from "@/components/settings/ShiftSettings";
import toast from "react-hot-toast";

const TIMEZONES = [
  { label: "WIB — UTC+7 (Jakarta, Sumatera, Kalimantan Barat)", value: "Asia/Jakarta" },
  { label: "WITA — UTC+8 / GMT+8 (Makassar, Bali, NTT)", value: "Asia/Makassar" },
  { label: "WIT — UTC+9 (Jayapura, Ambon, Papua)", value: "Asia/Jayapura" },
  { label: "SGT — UTC+8 (Singapore)", value: "Asia/Singapore" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<"company" | "theme" | "shifts" | "roles" | "notifications">("company");

  // Company
  const [company, setCompany] = useState({
    name: "Daengtisia Corporation",
    legalName: "PT Daengtisia Teknologi Indonesia",
    email: "info@daengtisia.com",
    phone: "+62 21 1234 5678",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    city: "Jakarta",
    province: "DKI Jakarta",
    website: "https://daengtisia.com",
    industry: "Teknologi Informasi",
    vision: "Menjadi perusahaan teknologi HR terdepan di Indonesia",
    mission: "Menyederhanakan pengelolaan SDM melalui teknologi inovatif",
  });

  const [theme, setTheme] = useState({ primaryColor: "#1E3A8A", secondaryColor: "#F4B400", logo: "" });

  const handleSave = () => toast.success("Pengaturan berhasil disimpan!");

  const tzLabel = (tz: string) => TIMEZONES.find((t) => t.value === tz)?.label || tz;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pengaturan"
        subtitle="Kelola pengaturan sistem dan perusahaan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Pengaturan" }]}
        actions={
          tab !== "shifts" ? (
            <Button onClick={handleSave} leftIcon={<Save size={14} />} size="sm">Simpan Perubahan</Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 space-y-1">
            {[
              { key: "company", label: "Profil Perusahaan", icon: <Building2 size={16} /> },
              { key: "theme", label: "Tema & Branding", icon: <Palette size={16} /> },
              { key: "shifts", label: "Jadwal Kerja", icon: <Clock size={16} /> },
              { key: "roles", label: "Peran & Akses", icon: <Shield size={16} /> },
              { key: "notifications", label: "Notifikasi", icon: <Bell size={16} /> },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key as typeof tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === item.key
                    ? "bg-linear-to-r from-[#1E3A8A] to-[#2563EB] text-white"
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

          {/* Company */}
          {tab === "company" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
              <h3 className="font-semibold text-gray-900 dark:text-white font-display mb-4">Informasi Perusahaan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Nama Perusahaan" },
                  { key: "legalName", label: "Nama Legal" },
                  { key: "email", label: "Email" },
                  { key: "phone", label: "Telepon" },
                  { key: "website", label: "Website" },
                  { key: "industry", label: "Industri" },
                  { key: "city", label: "Kota" },
                  { key: "province", label: "Provinsi" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      value={company[field.key as keyof typeof company]}
                      onChange={(e) => setCompany({ ...company, [field.key]: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Alamat</label>
                  <input type="text" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Visi</label>
                  <textarea value={company.vision} onChange={(e) => setCompany({ ...company, vision: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Misi</label>
                  <textarea value={company.mission} onChange={(e) => setCompany({ ...company, mission: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Theme */}
          {tab === "theme" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
              <h3 className="font-semibold text-gray-900 dark:text-white font-display">Tema & Branding</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Logo Perusahaan</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Klik untuk upload logo</div>
                  <div className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (max 2MB)</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Warna Primer</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200" />
                    <input type="text" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:outline-none dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Warna Sekunder</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200" />
                    <input type="text" value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:outline-none dark:text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
                <div className="text-white font-bold text-lg">Preview Tema</div>
                <div className="text-white/80 text-sm mt-1">Daengtisia HR Suite - Enterprise Platform</div>
              </div>
            </div>
          )}

          {/* Shifts / Jam Kerja */}
          {tab === "shifts" && (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white font-display">Pengaturan Jam Kerja</h3>
                <p className="text-xs text-gray-400 mt-0.5">Pilih baris untuk edit, klik + Tambah untuk shift baru</p>
              </div>
              <ShiftSettings />
            </div>
          )}

          {/* Roles */}
          {tab === "roles" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white font-display mb-6">Peran & Hak Akses</h3>
              <div className="space-y-4">
                {[
                  { role: "Super Admin", desc: "Akses penuh ke semua fitur sistem", permissions: ["Semua Fitur", "Audit Log", "Kelola User", "Pengaturan Sistem"], color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
                  { role: "HRD", desc: "Kelola karyawan, payroll, dan rekrutmen", permissions: ["Karyawan", "Payroll", "Rekrutmen", "Absensi", "Cuti"], color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
                  { role: "Manager", desc: "Approve cuti dan review performa tim", permissions: ["Approve Cuti", "Review Tim", "Lihat Laporan"], color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
                  { role: "Karyawan", desc: "Akses portal karyawan dasar", permissions: ["Profil", "Absensi", "Pengajuan Cuti", "Slip Gaji", "KPI"], color: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" },
                ].map((r) => (
                  <div key={r.role} className={`p-4 rounded-2xl border ${r.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{r.role}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</div>
                      </div>
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.permissions.map((p) => (
                        <span key={p} className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white font-display mb-6">Pengaturan Notifikasi</h3>
              <div className="space-y-4">
                {[
                  { label: "Notifikasi Email", desc: "Kirim notifikasi via email", enabled: true },
                  { label: "Pengajuan Cuti", desc: "Notifikasi saat ada pengajuan cuti baru", enabled: true },
                  { label: "Reminder Payroll", desc: "Ingatkan proses payroll setiap tanggal 25", enabled: true },
                  { label: "Kontrak Kadaluarsa", desc: "Peringatan kontrak yang akan berakhir", enabled: true },
                  { label: "Ulang Tahun Karyawan", desc: "Ingatkan ulang tahun karyawan", enabled: false },
                  { label: "Rekrutmen Update", desc: "Update status pelamar", enabled: true },
                  { label: "Performance Review", desc: "Reminder penilaian kinerja", enabled: false },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{notif.label}</div>
                      <div className="text-xs text-gray-400">{notif.desc}</div>
                    </div>
                    <button className={`relative w-11 h-6 rounded-full transition-colors ${notif.enabled ? "bg-[#1E3A8A]" : "bg-gray-200 dark:bg-gray-700"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notif.enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
