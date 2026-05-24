"use client";

import { useState } from "react";
import { BarChart3, Download, FileText, TrendingUp, Users, DollarSign, Calendar, Clock } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const attendanceData = [
  { month: "Jan", hadir: 92, terlambat: 5, absen: 3 },
  { month: "Feb", hadir: 88, terlambat: 7, absen: 5 },
  { month: "Mar", hadir: 95, terlambat: 3, absen: 2 },
  { month: "Apr", hadir: 90, terlambat: 6, absen: 4 },
  { month: "Mei", hadir: 94, terlambat: 4, absen: 2 },
  { month: "Jun", hadir: 91, terlambat: 5, absen: 4 },
];

const payrollData = [
  { month: "Jan", total: 285000000 },
  { month: "Feb", total: 291000000 },
  { month: "Mar", total: 278000000 },
  { month: "Apr", total: 310000000 },
  { month: "Mei", total: 305000000 },
  { month: "Jun", total: 320000000 },
];

const deptData = [
  { name: "Technology", value: 12, color: "#2563EB" },
  { name: "Operations", value: 15, color: "#F59E0B" },
  { name: "Marketing", value: 9, color: "#8B5CF6" },
  { name: "Finance", value: 8, color: "#10B981" },
  { name: "HRD", value: 6, color: "#EF4444" },
];

const leaveData = [
  { month: "Jan", annual: 12, sick: 8, emergency: 3 },
  { month: "Feb", annual: 9, sick: 11, emergency: 2 },
  { month: "Mar", annual: 15, sick: 6, emergency: 4 },
  { month: "Apr", annual: 10, sick: 9, emergency: 1 },
  { month: "Mei", annual: 13, sick: 7, emergency: 3 },
  { month: "Jun", annual: 11, sick: 10, emergency: 2 },
];

const reportTypes = [
  { id: "attendance", label: "Laporan Absensi", icon: <Clock size={20} />, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20" },
  { id: "payroll", label: "Laporan Payroll", icon: <DollarSign size={20} />, color: "bg-green-50 text-green-600 dark:bg-green-900/20" },
  { id: "leave", label: "Laporan Cuti", icon: <Calendar size={20} />, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20" },
  { id: "employee", label: "Laporan Karyawan", icon: <Users size={20} />, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20" },
  { id: "performance", label: "Laporan Performance", icon: <TrendingUp size={20} />, color: "bg-pink-50 text-pink-600 dark:bg-pink-900/20" },
  { id: "recruitment", label: "Laporan Rekrutmen", icon: <FileText size={20} />, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("6months");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Laporan & Analitik"
        subtitle="Ekspor dan analisis data HR perusahaan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Laporan" }]}
        actions={
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">1 Bulan</option>
              <option value="3months">3 Bulan</option>
              <option value="6months">6 Bulan</option>
              <option value="1year">1 Tahun</option>
            </select>
            <Button size="sm" leftIcon={<Download size={14} />}>Export PDF</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { key: "overview", label: "Ringkasan" },
          { key: "generate", label: "Buat Laporan" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Rata-rata Kehadiran", value: "91.7%", trend: "+2.3%", color: "text-blue-600" },
              { label: "Total Payroll (Mei)", value: formatCurrency(305000000), trend: "+4.8%", color: "text-green-600" },
              { label: "Pengajuan Cuti", value: "44", trend: "-8%", color: "text-purple-600" },
              { label: "Karyawan Aktif", value: "50", trend: "+2", color: "text-amber-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">{stat.trend} vs bulan lalu</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tren Kehadiran (%)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="hadir" stroke="#2563EB" fill="url(#colorHadir)" name="Hadir" />
                  <Area type="monotone" dataKey="terlambat" stroke="#F59E0B" fill="transparent" strokeDasharray="4 4" name="Terlambat" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payroll Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tren Payroll (Rp)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v)), "Payroll"]} />
                  <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leave Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribusi Cuti</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leaveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="annual" fill="#8B5CF6" name="Tahunan" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="sick" fill="#EF4444" name="Sakit" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="emergency" fill="#F59E0B" name="Darurat" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dept distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribusi Karyawan per Departemen</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                      {deptData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {deptData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-gray-600 dark:text-gray-400 text-xs">{d.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-xs">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "generate" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pilih jenis laporan yang ingin dibuat dan ekspor.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((rt) => (
              <div key={rt.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all group cursor-pointer">
                <div className={`w-11 h-11 rounded-xl ${rt.color} flex items-center justify-center mb-4`}>
                  {rt.icon}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{rt.label}</div>
                <div className="text-xs text-gray-400 mb-4">Ekspor data dalam format Excel atau PDF</div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs py-1.5 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                    Excel
                  </button>
                  <button className="flex-1 text-xs py-1.5 px-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors font-medium">
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
