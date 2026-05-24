"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Building2, Calendar, DollarSign, Clock,
  TrendingUp, Edit2, Trash2, ChevronLeft, MapPin,
  CreditCard, Shield, CheckCircle2, XCircle, BarChart3,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { StatusBadge } from "@/components/shared/Badge";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const employeeData = {
  id: "emp-001",
  employeeId: "EMP-001",
  fullName: "Ahmad Fauzi",
  email: "ahmad.fauzi@daengtisia.com",
  phone: "081234567890",
  gender: "MALE",
  birthDate: "1990-03-15",
  address: "Jl. Sudirman No. 45, Jakarta Selatan, DKI Jakarta",
  nik: "3174012345678901",
  npwp: "12.345.678.9-012.345",
  photo: null,
  department: { name: "Finance", code: "FIN" },
  position: { name: "Finance Manager" },
  contractType: "PERMANENT",
  joinDate: "2020-01-15",
  employmentStatus: "ACTIVE",
  basicSalary: 15000000,
  bankName: "BCA",
  bankAccount: "1234567890",
  role: "HRD",
  leaveBalance: { remaining: 8, used: 4, total: 12 },
  attendance: { present: 21, late: 1, absent: 0, rate: 95.5 },
  performanceScore: 88,
};

const attendanceHistory = [
  { week: "W1", hadir: 5, terlambat: 0 },
  { week: "W2", hadir: 4, terlambat: 1 },
  { week: "W3", hadir: 5, terlambat: 0 },
  { week: "W4", hadir: 5, terlambat: 0 },
];

const recentLeaves = [
  { type: "Cuti Tahunan", start: "2026-04-01", end: "2026-04-03", days: 3, status: "APPROVED" as const },
  { type: "Cuti Sakit", start: "2026-03-10", end: "2026-03-10", days: 1, status: "APPROVED" as const },
  { type: "Cuti Tahunan", start: "2026-05-20", end: "2026-05-22", days: 3, status: "PENDING" as const },
];

const recentPayrolls = [
  { month: "Mei 2026", gross: 17500000, net: 15250000 },
  { month: "Apr 2026", gross: 17500000, net: 15250000 },
  { month: "Mar 2026", gross: 17500000, net: 15100000 },
];

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const emp = employeeData;

  const tabs = [
    { key: "overview", label: "Profil" },
    { key: "attendance", label: "Absensi" },
    { key: "leave", label: "Cuti" },
    { key: "payroll", label: "Payroll" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Detail Karyawan"
        subtitle={`Profil lengkap ${emp.fullName}`}
        breadcrumb={[{ label: "Dashboard" }, { label: "Karyawan" }, { label: emp.fullName }]}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" leftIcon={<ChevronLeft size={14} />} onClick={() => router.back()}>
              Kembali
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} />}>
              Edit
            </Button>
          </div>
        }
      />

      {/* Profile header card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {getInitials(emp.fullName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{emp.fullName}</h2>
              <StatusBadge status={emp.employmentStatus} />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{emp.position.name} · {emp.department.name}</div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={14} /> {emp.email}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Phone size={14} /> {emp.phone}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} /> Bergabung {formatDate(emp.joinDate)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono px-2 py-1 rounded-lg">
              {emp.employeeId}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-lg">
              {emp.contractType}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: "Saldo Cuti", value: `${emp.leaveBalance.remaining} hari`, icon: <Calendar size={16} />, color: "text-purple-600" },
            { label: "Kehadiran", value: `${emp.attendance.rate}%`, icon: <Clock size={16} />, color: "text-blue-600" },
            { label: "Performance", value: `${emp.performanceScore}/100`, icon: <TrendingUp size={16} />, color: "text-emerald-600" },
            { label: "Gaji Pokok", value: formatCurrency(emp.basicSalary), icon: <DollarSign size={16} />, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`flex items-center justify-center gap-1 text-lg font-bold ${s.color}`}>
                {s.icon} {s.value}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Personal info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> Informasi Pribadi
            </h3>
            <div className="space-y-3">
              {[
                { label: "Nama Lengkap", value: emp.fullName },
                { label: "Jenis Kelamin", value: emp.gender === "MALE" ? "Laki-laki" : "Perempuan" },
                { label: "Tanggal Lahir", value: formatDate(emp.birthDate) },
                { label: "NIK", value: emp.nik },
                { label: "NPWP", value: emp.npwp },
                { label: "Alamat", value: emp.address },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-32 flex-shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Job info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" /> Informasi Pekerjaan
            </h3>
            <div className="space-y-3">
              {[
                { label: "Departemen", value: emp.department.name },
                { label: "Jabatan", value: emp.position.name },
                { label: "Tipe Kontrak", value: emp.contractType },
                { label: "Tanggal Bergabung", value: formatDate(emp.joinDate) },
                { label: "Role Sistem", value: emp.role },
                { label: "Status", value: emp.employmentStatus },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-32 flex-shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bank info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" /> Informasi Bank
            </h3>
            <div className="space-y-3">
              {[
                { label: "Bank", value: emp.bankName },
                { label: "No. Rekening", value: emp.bankAccount },
                { label: "Gaji Pokok", value: formatCurrency(emp.basicSalary) },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-32 flex-shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leave balance */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" /> Saldo Cuti
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Jatah Cuti</span>
                <span className="font-semibold text-gray-900 dark:text-white">{emp.leaveBalance.total} hari</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sudah Digunakan</span>
                <span className="font-semibold text-red-500">{emp.leaveBalance.used} hari</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sisa Cuti</span>
                <span className="font-semibold text-emerald-600">{emp.leaveBalance.remaining} hari</span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                    style={{ width: `${(emp.leaveBalance.remaining / emp.leaveBalance.total) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">{emp.leaveBalance.remaining}/{emp.leaveBalance.total} hari tersisa</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Hadir", value: emp.attendance.present, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "Terlambat", value: emp.attendance.late, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Absen", value: emp.attendance.absent, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
              { label: "Tingkat Kehadiran", value: `${emp.attendance.rate}%`, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border border-gray-100 dark:border-gray-800 p-4 ${s.bg}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Kehadiran per Minggu (Mei 2026)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={attendanceHistory}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
                <Tooltip />
                <Area type="monotone" dataKey="hadir" stroke="#2563EB" fill="url(#attendGrad)" name="Hadir" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "leave" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
            Riwayat Cuti
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentLeaves.map((leave, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{leave.type}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDate(leave.start)} — {formatDate(leave.end)} · {leave.days} hari
                  </div>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
            Riwayat Payroll
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentPayrolls.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center flex-shrink-0">
                  <DollarSign size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{p.month}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Gross: {formatCurrency(p.gross)} · Net: {formatCurrency(p.net)}
                  </div>
                </div>
                <button className="text-xs text-blue-600 hover:underline font-medium">Unduh Slip</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
