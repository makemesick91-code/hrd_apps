"use client";

import { useState } from "react";
import { FileText, Download, Search, Filter, Eye, Printer } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";

const slips = Array.from({ length: 15 }, (_, i) => ({
  id: `slip-${i}`,
  employeeName: ["Ahmad Fauzi", "Siti Rahayu", "Budi Santoso", "Eko Prasetyo", "Dewi Lestari"][i % 5],
  employeeId: `EMP-00${(i % 5) + 1}`,
  department: ["Finance", "HRD", "Operations", "Technology", "Marketing"][i % 5],
  month: ["Mei 2026", "Apr 2026", "Mar 2026"][Math.floor(i / 5)],
  grossSalary: [17500000, 12000000, 9500000, 18000000, 11000000][i % 5],
  netSalary: [15250000, 10450000, 8275000, 15660000, 9580000][i % 5],
  status: i % 4 === 0 ? "DRAFT" : "PAID",
}));

const monthOptions = ["Semua Bulan", "Mei 2026", "Apr 2026", "Mar 2026"];

export default function PayrollSlipsPage() {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("Semua Bulan");

  const filtered = slips.filter((s) => {
    const matchSearch = !search || s.employeeName.toLowerCase().includes(search.toLowerCase()) || s.employeeId.includes(search);
    const matchMonth = monthFilter === "Semua Bulan" || s.month === monthFilter;
    return matchSearch && matchMonth;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Slip Gaji"
        subtitle="Manajemen dan distribusi slip gaji karyawan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Payroll" }, { label: "Slip Gaji" }]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari karyawan..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {monthOptions.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Karyawan</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Departemen</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Periode</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Gaji Bruto</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Gaji Bersih</th>
                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((slip) => (
                <tr key={slip.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{slip.employeeName}</div>
                    <div className="text-xs text-gray-400 font-mono">{slip.employeeId}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{slip.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{slip.month}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium text-right">
                    {formatCurrency(slip.grossSalary)}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-emerald-600 text-right">
                    {formatCurrency(slip.netSalary)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slip.status === "PAID"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {slip.status === "PAID" ? "Dibayar" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Download size={14} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-400">
          {filtered.length} slip gaji
        </div>
      </div>
    </div>
  );
}
