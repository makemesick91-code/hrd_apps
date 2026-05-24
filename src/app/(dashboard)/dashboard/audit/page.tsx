"use client";

import { useState } from "react";
import { Shield, Search, Filter, Eye, Download, AlertTriangle, CheckCircle, Info, Lock } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { formatDateTime } from "@/lib/utils";

type Action = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "VIEW";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: Action;
  entity: string;
  entityId: string;
  description: string;
  ipAddress: string;
  severity: Severity;
  createdAt: string;
}

const logs: AuditLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i}`,
  userId: `user-${i % 5}`,
  userName: ["Admin System", "Siti Rahayu", "Ahmad Fauzi", "Eko Prasetyo", "Budi Santoso"][i % 5],
  userRole: ["SUPER_ADMIN", "HRD", "HRD", "MANAGER", "EMPLOYEE"][i % 5],
  action: (["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "EXPORT", "VIEW", "UPDATE", "CREATE", "DELETE",
    "LOGIN", "UPDATE", "VIEW", "EXPORT", "CREATE", "DELETE", "LOGIN", "UPDATE", "VIEW", "CREATE"] as Action[])[i],
  entity: ["Employee", "Leave", "Payroll", "User", "Department", "Attendance", "Recruitment", "Document", "Setting", "Position"][i % 10],
  entityId: `ent-${i * 3 + 1}`,
  description: [
    "Menambahkan karyawan baru: Hendra Wijaya",
    "Mengubah data absensi karyawan ID 12",
    "Menghapus dokumen lama yang kadaluarsa",
    "Login ke sistem dari browser Chrome",
    "Logout dari sistem",
    "Mengekspor data karyawan ke Excel",
    "Melihat detail profil karyawan",
    "Mengubah status pengajuan cuti menjadi Disetujui",
    "Membuat payroll bulan Mei 2026",
    "Menghapus posisi yang tidak aktif",
    "Login gagal - password salah (percobaan 1)",
    "Mengubah pengaturan notifikasi email",
    "Melihat laporan kehadiran",
    "Mengekspor slip gaji ke PDF",
    "Menambahkan departemen baru",
    "Menghapus rekrutmen yang dibatalkan",
    "Login dari IP tidak dikenal",
    "Mengubah gaji pokok karyawan",
    "Melihat data payroll",
    "Membuat akun karyawan baru",
  ][i],
  ipAddress: `192.168.1.${(i * 7 + 10) % 255}`,
  severity: (["LOW", "LOW", "HIGH", "LOW", "LOW", "MEDIUM", "LOW", "MEDIUM", "HIGH", "HIGH",
    "CRITICAL", "LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH", "CRITICAL", "HIGH", "LOW", "MEDIUM"] as Severity[])[i],
  createdAt: new Date(Date.now() - i * 1000 * 60 * 47).toISOString(),
}));

const actionColors: Record<Action, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LOGIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  LOGOUT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  EXPORT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  VIEW: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const severityConfig: Record<Severity, { icon: React.ReactNode; color: string }> = {
  LOW: { icon: <Info size={14} />, color: "text-gray-400" },
  MEDIUM: { icon: <AlertTriangle size={14} />, color: "text-amber-500" },
  HIGH: { icon: <AlertTriangle size={14} />, color: "text-orange-500" },
  CRITICAL: { icon: <AlertTriangle size={14} />, color: "text-red-500" },
};

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const filtered = logs.filter((log) => {
    const matchSearch = !search || log.description.toLowerCase().includes(search.toLowerCase()) || log.userName.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchSeverity = severityFilter === "ALL" || log.severity === severityFilter;
    return matchSearch && matchAction && matchSeverity;
  });

  const criticalCount = logs.filter((l) => l.severity === "CRITICAL").length;
  const highCount = logs.filter((l) => l.severity === "HIGH").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Audit & Keamanan"
        subtitle="Monitor aktivitas sistem dan log keamanan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Audit" }]}
        actions={
          <Button size="sm" variant="outline" leftIcon={<Download size={14} />}>
            Export Log
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Log", value: logs.length, icon: <Shield size={20} />, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20" },
          { label: "Kritis", value: criticalCount, icon: <AlertTriangle size={20} />, color: "bg-red-50 text-red-500 dark:bg-red-900/20" },
          { label: "Tinggi", value: highCount, icon: <AlertTriangle size={20} />, color: "bg-orange-50 text-orange-500 dark:bg-orange-900/20" },
          { label: "Aman", value: logs.length - criticalCount - highCount, icon: <CheckCircle size={20} />, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari log..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Aksi</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="EXPORT">Export</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Level</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* Log table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Waktu</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Pengguna</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Aksi</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Deskripsi</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">IP</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 py-3 px-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.slice(0, 15).map((log) => {
                const sev = severityConfig[log.severity];
                return (
                  <tr key={log.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${log.severity === "CRITICAL" ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{log.userName}</div>
                      <div className="text-xs text-gray-400">{log.userRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionColors[log.action]}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                      <div className="truncate">{log.description}</div>
                      <div className="text-xs text-gray-400">{log.entity} #{log.entityId}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400 font-mono">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 text-xs font-medium ${sev.color}`}>
                        {sev.icon} {log.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-400">
          Menampilkan {Math.min(15, filtered.length)} dari {filtered.length} log
        </div>
      </div>
    </div>
  );
}
