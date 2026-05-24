"use client";

import { useEffect, useState } from "react";
import {
  Users, Clock, DollarSign, Calendar, TrendingUp, Briefcase,
  UserCheck, UserX, AlertCircle, CheckCircle2, ArrowRight, Bell,
  Star, Award, Target,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import StatsCard from "@/components/shared/StatsCard";
import PageHeader from "@/components/shared/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/Badge";
import api from "@/lib/api";
import Link from "next/link";

// Mock data for demo
const attendanceData = [
  { date: "Sen", present: 142, absent: 8, late: 12, wfh: 15 },
  { date: "Sel", present: 148, absent: 5, late: 8, wfh: 18 },
  { date: "Rab", present: 151, absent: 6, late: 10, wfh: 20 },
  { date: "Kam", present: 145, absent: 9, late: 14, wfh: 12 },
  { date: "Jum", present: 138, absent: 12, late: 11, wfh: 22 },
];

const payrollData = [
  { month: "Jan", total: 850000000, basic: 700000000, bonus: 100000000, deductions: 50000000 },
  { month: "Feb", total: 870000000, basic: 720000000, bonus: 90000000, deductions: 60000000 },
  { month: "Mar", total: 920000000, basic: 750000000, bonus: 120000000, deductions: 50000000 },
  { month: "Apr", total: 890000000, basic: 730000000, bonus: 110000000, deductions: 50000000 },
  { month: "Mei", total: 950000000, basic: 770000000, bonus: 130000000, deductions: 50000000 },
];

const departmentData = [
  { name: "Teknologi", value: 45, color: "#1E3A8A" },
  { name: "Marketing", value: 25, color: "#F4B400" },
  { name: "Operasional", value: 35, color: "#2563EB" },
  { name: "Keuangan", value: 20, color: "#10B981" },
  { name: "HRD", value: 15, color: "#8B5CF6" },
];

const recentActivities = [
  { id: 1, type: "join", name: "Siti Rahayu", action: "bergabung sebagai UI/UX Designer", time: "2 jam lalu", avatar: "SR" },
  { id: 2, type: "leave", name: "Budi Santoso", action: "mengajukan cuti tahunan 3 hari", time: "3 jam lalu", avatar: "BS" },
  { id: 3, type: "payroll", name: "HRD Team", action: "memproses payroll bulan Mei 2026", time: "5 jam lalu", avatar: "HR" },
  { id: 4, type: "recruit", name: "Ahmad Fauzi", action: "lulus interview tahap 2", time: "1 hari lalu", avatar: "AF" },
  { id: 5, type: "performance", name: "Dewi Lestari", action: "mendapat penilaian Excellent Q1", time: "2 hari lalu", avatar: "DL" },
];

const pendingLeaves = [
  { id: 1, name: "Rini Wulandari", type: "Cuti Tahunan", days: 2, from: "2026-05-27", dept: "Marketing" },
  { id: 2, name: "Joko Widodo", type: "Cuti Sakit", days: 1, from: "2026-05-26", dept: "IT" },
  { id: 3, name: "Maya Sari", type: "Izin", days: 1, from: "2026-05-25", dept: "Keuangan" },
];

const topPerformers = [
  { id: 1, name: "Diana Putri", dept: "IT", score: 98, trend: "+5%" },
  { id: 2, name: "Eko Prasetyo", dept: "Sales", score: 95, trend: "+3%" },
  { id: 3, name: "Fani Kurnia", dept: "Marketing", score: 93, trend: "+7%" },
];

const formatChartCurrency = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Jt`;
  return String(value);
};

interface TooltipEntry { name: string; value: number; color: string; }
interface TooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string; }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 168,
    activeEmployees: 155,
    newHires: 8,
    turnoverRate: "3.5",
    presentToday: 142,
    absentToday: 8,
    lateToday: 12,
    onLeaveToday: 5,
    attendanceRate: "91.6",
    pendingLeaves: 3,
    pendingPayrolls: 2,
    openRecruitments: 7,
    totalApplicants: 124,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan aktivitas HR perusahaan hari ini"
        actions={
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
            <Clock size={16} className="text-[#F4B400]" />
            {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Karyawan"
          value={stats.totalEmployees}
          icon={<Users size={22} />}
          variant="navy"
          trend={5}
          trendLabel="dari bulan lalu"
        />
        <StatsCard
          title="Hadir Hari Ini"
          value={stats.presentToday}
          icon={<UserCheck size={22} />}
          variant="success"
          subtitle={`${stats.attendanceRate}% dari total`}
        />
        <StatsCard
          title="Cuti Pending"
          value={stats.pendingLeaves}
          icon={<Calendar size={22} />}
          variant="gold"
          subtitle="Perlu persetujuan"
        />
        <StatsCard
          title="Rekrutmen Aktif"
          value={stats.openRecruitments}
          icon={<Briefcase size={22} />}
          variant="default"
          subtitle={`${stats.totalApplicants} pelamar`}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Karyawan Aktif", value: stats.activeEmployees, icon: <UserCheck size={18} />, color: "text-emerald-500" },
          { label: "Tidak Hadir", value: stats.absentToday, icon: <UserX size={18} />, color: "text-red-500" },
          { label: "Terlambat", value: stats.lateToday, icon: <AlertCircle size={18} />, color: "text-amber-500" },
          { label: "Karyawan Baru", value: stats.newHires, icon: <TrendingUp size={18} />, color: "text-blue-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4"
          >
            <div className={`${item.color} bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl`}>
              {item.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white font-display">{item.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white font-display">Rekap Absensi Minggu Ini</h3>
              <p className="text-xs text-gray-400 mt-1">Data absensi 5 hari terakhir</p>
            </div>
            <Link href="/dashboard/attendance" className="text-xs text-[#1E3A8A] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="late" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4B400" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F4B400" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="present" stroke="#1E3A8A" strokeWidth={2} fill="url(#present)" name="Hadir" />
              <Area type="monotone" dataKey="late" stroke="#F4B400" strokeWidth={2} fill="url(#late)" name="Terlambat" />
              <Area type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} fill="none" name="Absen" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Pie */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-card">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white font-display">Komposisi Divisi</h3>
            <p className="text-xs text-gray-400 mt-1">Distribusi karyawan per divisi</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {departmentData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} orang`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {departmentData.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{dept.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{dept.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payroll Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white font-display">Tren Payroll 5 Bulan Terakhir</h3>
            <p className="text-xs text-gray-400 mt-1">Total pengeluaran payroll per bulan</p>
          </div>
          <Link href="/dashboard/payroll" className="text-xs text-[#1E3A8A] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
            Detail payroll <ArrowRight size={12} />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={payrollData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatChartCurrency} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
            <Legend />
            <Bar dataKey="basic" name="Gaji Pokok" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bonus" name="Bonus" fill="#F4B400" radius={[4, 4, 0, 0]} />
            <Bar dataKey="deductions" name="Potongan" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leaves */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white font-display">Cuti Pending</h3>
            <span className="bg-[#F4B400]/15 text-[#B45309] dark:text-[#F4B400] text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingLeaves.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {leave.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{leave.name}</div>
                    <div className="text-xs text-gray-400">{leave.type} · {leave.days} hari</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                    <CheckCircle2 size={14} />
                  </button>
                  <button className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-200 transition-colors">
                    <UserX size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/leave" className="text-xs text-[#1E3A8A] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
              Lihat semua pengajuan <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white font-display">Top Performers</h3>
            <Award size={18} className="text-[#F4B400]" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {topPerformers.map((emp, i) => (
              <div key={emp.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="text-lg font-bold text-gray-300 dark:text-gray-700 w-6 text-center">{i + 1}</div>
                <div className="w-8 h-8 bg-gradient-to-br from-[#F4B400] to-[#FBBF24] rounded-full flex items-center justify-center text-[#1E3A8A] font-bold text-xs">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{emp.name}</div>
                  <div className="text-xs text-gray-400">{emp.dept}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{emp.score}</div>
                  <div className="text-xs text-emerald-500">{emp.trend}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/dashboard/performance" className="text-xs text-[#1E3A8A] dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
              Lihat semua performance <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white font-display">Aktivitas Terbaru</h3>
            <Bell size={18} className="text-gray-400" />
          </div>
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">{activity.name}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tambah Karyawan", icon: <Users size={20} />, href: "/dashboard/employees/new", color: "navy" },
          { label: "Proses Payroll", icon: <DollarSign size={20} />, href: "/dashboard/payroll", color: "gold" },
          { label: "Buka Lowongan", icon: <Briefcase size={20} />, href: "/dashboard/recruitment/new", color: "navy" },
          { label: "Laporan HR", icon: <TrendingUp size={20} />, href: "/dashboard/reports", color: "gold" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-3 p-4 rounded-2xl font-medium text-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
              action.color === "navy"
                ? "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-navy"
                : "bg-gradient-to-r from-[#F4B400] to-[#FBBF24] text-[#1E3A8A] shadow-gold"
            }`}
          >
            {action.icon}
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
