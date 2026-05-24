"use client";

import { useState } from "react";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, Download } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const leaveTypes = [
  { key: "ANNUAL", label: "Cuti Tahunan", color: "bg-blue-100 text-blue-700" },
  { key: "SICK", label: "Cuti Sakit", color: "bg-red-100 text-red-700" },
  { key: "EMERGENCY", label: "Cuti Darurat", color: "bg-orange-100 text-orange-700" },
  { key: "MATERNITY", label: "Cuti Melahirkan", color: "bg-pink-100 text-pink-700" },
  { key: "PATERNITY", label: "Cuti Ayah", color: "bg-purple-100 text-purple-700" },
  { key: "PERMISSION", label: "Izin", color: "bg-amber-100 text-amber-700" },
  { key: "UNPAID", label: "Cuti Tidak Berbayar", color: "bg-gray-100 text-gray-700" },
];


export default function LeavePage() {
  const [tab, setTab] = useState<"requests" | "balance" | "apply">("requests");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    leaveType: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const leaveRequests: never[] = [];
  const filtered = leaveRequests;

  const handleApply = () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      toast.error("Harap lengkapi semua field");
      return;
    }
    toast.success("Pengajuan cuti berhasil dikirim!");
    setTab("requests");
    setForm({ leaveType: "ANNUAL", startDate: "", endDate: "", reason: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cuti & Izin"
        subtitle="Kelola pengajuan cuti dan izin karyawan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Cuti & Izin" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>Export</Button>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setTab("apply")}>
              Ajukan Cuti
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Pengajuan", value: 0, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Pending", value: 0, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
          { label: "Disetujui", value: 0, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Ditolak", value: 0, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold font-display ${s.color}`}>
              {s.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { key: "requests", label: "Daftar Pengajuan" },
          { key: "balance", label: "Saldo Cuti" },
          { key: "apply", label: "Ajukan Cuti" },
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

      {tab === "requests" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada pengajuan cuti</div>
                <button
                  onClick={() => setTab("apply")}
                  className="mt-3 text-xs text-[#1E3A8A] hover:underline flex items-center gap-1 mx-auto"
                >
                  <Plus size={12} /> Ajukan cuti sekarang
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      {["Karyawan", "Divisi", "Jenis Cuti", "Periode", "Jumlah Hari", "Alasan", "Status", "Aksi"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map((req) => {
                      const lt = leaveTypes.find(t => t.key === req.leaveType);
                      return (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{req.employeeName}</div>
                              <div className="text-xs text-gray-400">{req.employeeId}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{req.department}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lt?.color || "bg-gray-100 text-gray-700"}`}>
                              {lt?.label || req.leaveType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-center">
                            {req.totalDays}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {req.reason}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                          <td className="px-4 py-3">
                            {req.status === "PENDING" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toast.success("Cuti disetujui")}
                                  className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                                <button
                                  onClick={() => toast.error("Cuti ditolak")}
                                  className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "balance" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="py-16 text-center">
            <Clock size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada data saldo cuti</div>
          </div>
        </div>
      )}

      {tab === "apply" && (
        <div className="max-w-lg">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6 font-display">Form Pengajuan Cuti</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jenis Cuti</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  {leaveTypes.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alasan</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Jelaskan alasan pengajuan cuti..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setTab("requests")}>Batal</Button>
                <Button className="flex-1" onClick={handleApply}>Ajukan Cuti</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
