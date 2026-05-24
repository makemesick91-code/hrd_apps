"use client";

import { useState } from "react";
import { DollarSign, Download, CheckCircle2, Clock, Filter, Eye, FileText, TrendingUp } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const trendData = [
  { month: "Jan", total: 850 },
  { month: "Feb", total: 870 },
  { month: "Mar", total: 920 },
  { month: "Apr", total: 890 },
  { month: "Mei", total: 950 },
];

const payrollList = Array.from({ length: 12 }, (_, i) => ({
  id: `pay-${i}`,
  employeeName: ["Ahmad Fauzi", "Siti Rahayu", "Budi Santoso", "Dewi Lestari", "Eko Prasetyo", "Fani Kurnia", "Gita Nirmala", "Hendra Wijaya", "Indah Permata", "Joko Widodo", "Kartini Putri", "Lukman Hakim"][i],
  employeeId: `EMP26${String(10001 + i).slice(-5)}`,
  department: ["IT", "Marketing", "HRD", "Keuangan", "Operasional"][i % 5],
  basicSalary: 5000000 + i * 1000000,
  allowances: 500000 + i * 100000,
  bonus: i % 3 === 0 ? 1000000 + i * 200000 : 0,
  deductions: 300000 + i * 50000,
  bpjs: 100000 + i * 10000,
  pph21: 200000 + i * 30000,
  netSalary: 5000000 + i * 1000000 + 500000 + (i % 3 === 0 ? 1000000 : 0) - 300000 - 100000 - 200000,
  status: ["PAID", "APPROVED", "PENDING_APPROVAL", "DRAFT"][i % 4],
  period: "Mei 2026",
}));

export default function PayrollPage() {
  const [tab, setTab] = useState<"list" | "analytics">("list");
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [selectedYear, setSelectedYear] = useState(2026);

  const totalPayroll = payrollList.reduce((sum, p) => sum + p.netSalary, 0);
  const totalBasic = payrollList.reduce((sum, p) => sum + p.basicSalary, 0);
  const totalBonus = payrollList.reduce((sum, p) => sum + p.bonus, 0);
  const totalDeductions = payrollList.reduce((sum, p) => sum + p.deductions + p.bpjs + p.pph21, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payroll"
        subtitle={`Penggajian ${getMonthName(selectedMonth)} ${selectedYear}`}
        breadcrumb={[{ label: "Dashboard" }, { label: "Payroll" }]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={`${selectedMonth}-${selectedYear}`}
              onChange={(e) => {
                const [m, y] = e.target.value.split("-");
                setSelectedMonth(parseInt(m));
                setSelectedYear(parseInt(y));
              }}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                return <option key={m} value={`${m}-2026`}>{getMonthName(m)} 2026</option>;
              })}
            </select>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>Export</Button>
            <Button size="sm" leftIcon={<CheckCircle2 size={14} />} onClick={() => toast.success("Payroll disetujui!")}>
              Setujui Semua
            </Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Payroll", value: formatCurrency(totalPayroll), icon: <DollarSign size={20} />, variant: "navy" as const, sub: `${payrollList.length} karyawan` },
          { label: "Gaji Pokok", value: formatCurrency(totalBasic), icon: <DollarSign size={20} />, variant: "default" as const, sub: "Total gaji pokok" },
          { label: "Total Bonus", value: formatCurrency(totalBonus), icon: <TrendingUp size={20} />, variant: "gold" as const, sub: "Bonus & tunjangan" },
          { label: "Total Potongan", value: formatCurrency(totalDeductions), icon: <DollarSign size={20} />, variant: "danger" as const, sub: "BPJS + PPh21" },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-5 ${
              card.variant === "navy" ? "bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white shadow-navy" :
              card.variant === "gold" ? "bg-gradient-to-br from-[#F4B400] to-[#FBBF24] text-[#1E3A8A] shadow-gold" :
              card.variant === "danger" ? "bg-gradient-to-br from-red-500 to-rose-400 text-white" :
              "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            }`}
          >
            <div className="text-xs font-medium opacity-80 mb-3">{card.label}</div>
            <div className="text-2xl font-bold font-display">{card.value}</div>
            <div className="text-xs opacity-60 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { status: "PAID", label: "Dibayar", count: payrollList.filter(p => p.status === "PAID").length, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
          { status: "APPROVED", label: "Disetujui", count: payrollList.filter(p => p.status === "APPROVED").length, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
          { status: "PENDING", label: "Pending", count: payrollList.filter(p => p.status === "PENDING_APPROVAL").length, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
          { status: "DRAFT", label: "Draft", count: payrollList.filter(p => p.status === "DRAFT").length, color: "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
        ].map((s) => (
          <div key={s.status} className={`rounded-xl p-3 ${s.color} flex items-center gap-3`}>
            <div className="text-2xl font-bold font-display">{s.count}</div>
            <div className="text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { key: "list", label: "Daftar Payroll" },
          { key: "analytics", label: "Analitik" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white" : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {["Karyawan", "Divisi", "Gaji Pokok", "Tunjangan", "Bonus", "Potongan", "Gaji Bersih", "Status", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {payrollList.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.employeeName}</div>
                        <div className="text-xs text-gray-400">{p.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.department}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(p.basicSalary)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatCurrency(p.allowances)}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">{p.bonus > 0 ? formatCurrency(p.bonus) : "-"}</td>
                    <td className="px-4 py-3 text-sm text-red-500">{formatCurrency(p.deductions + p.bpjs + p.pph21)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(p.netSalary)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Lihat Slip">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors" title="Download Slip">
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6 font-display">Tren Payroll (juta Rp)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${Number(v)}M`, "Total Payroll"]} />
              <Line type="monotone" dataKey="total" stroke="#1E3A8A" strokeWidth={3} dot={{ fill: "#F4B400", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
