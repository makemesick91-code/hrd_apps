"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, User, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  department: { name: string } | null;
}

interface EditRecord {
  employeeId: string;
  employeeName: string;
  date: string;        // "YYYY-MM-DD"
  checkIn?: string;    // "HH:mm"
  checkOut?: string;   // "HH:mm"
  status?: string;
  notes?: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  prefillDate?: string;
  editRecord?: EditRecord;
}

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Hadir", color: "text-emerald-600" },
  { value: "LATE", label: "Terlambat", color: "text-amber-600" },
  { value: "ABSENT", label: "Tidak Hadir", color: "text-red-600" },
  { value: "SICK", label: "Sakit", color: "text-orange-600" },
  { value: "PERMISSION", label: "Izin", color: "text-blue-600" },
  { value: "WFH", label: "WFH", color: "text-purple-600" },
];

export default function ManualAttendanceModal({ onClose, onSuccess, prefillDate, editRecord }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState(editRecord?.employeeName ?? "");

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });
  const isEdit = !!editRecord;

  const [form, setForm] = useState({
    targetEmployeeId: editRecord?.employeeId ?? "",
    date: editRecord?.date ?? prefillDate ?? today,
    checkInTime: editRecord?.checkIn ?? "08:00",
    checkOutTime: editRecord?.checkOut ?? "17:00",
    status: editRecord?.status ?? "PRESENT",
    manualNotes: editRecord?.notes ?? "",
  });

  // Load employees
  useEffect(() => {
    setLoading(true);
    fetch("/api/employees?limit=200")
      .then((r) => r.json())
      .then((d) => { if (d.success) setEmployees(d.data?.data || d.data || []); })
      .catch(() => toast.error("Gagal memuat daftar karyawan"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) =>
    !search ||
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedEmployee = employees.find((e) => e.id === form.targetEmployeeId);

  const noCheckInOut = ["ABSENT", "SICK", "PERMISSION"].includes(form.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetEmployeeId) { toast.error("Pilih karyawan terlebih dahulu"); return; }
    if (!form.date) { toast.error("Tanggal wajib diisi"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "manual",
          ...form,
          checkInTime: noCheckInOut ? null : form.checkInTime,
          checkOutTime: noCheckInOut ? null : form.checkOutTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Absensi berhasil ditambahkan");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Gagal menyimpan absensi");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white font-display">
              {isEdit ? "Edit Absensi" : "Tambah Absensi Manual"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? `${editRecord!.employeeName} · ${editRecord!.date}` : "Input absensi untuk karyawan secara manual"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Employee selector — hidden when editing existing record */}
          {!isEdit && <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <User size={12} /> Karyawan
            </label>
            <input
              type="text"
              placeholder="Cari nama atau ID karyawan..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setForm({ ...form, targetEmployeeId: "" }); }}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white mb-2"
            />

            {/* Selected badge */}
            {selectedEmployee && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-2">
                <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {selectedEmployee.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedEmployee.fullName}</div>
                  <div className="text-xs text-gray-400">{selectedEmployee.employeeId} · {selectedEmployee.department?.name}</div>
                </div>
                <button type="button" onClick={() => { setForm({ ...form, targetEmployeeId: "" }); setSearch(""); }} className="text-gray-400 hover:text-gray-600 shrink-0">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Dropdown list */}
            {!selectedEmployee && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
                ) : filtered.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">Tidak ada karyawan ditemukan</div>
                ) : (
                  filtered.slice(0, 20).map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => { setForm({ ...form, targetEmployeeId: emp.id }); setSearch(emp.fullName); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{emp.fullName}</div>
                        <div className="text-xs text-gray-400">{emp.employeeId} · {emp.department?.name}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>}

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              <Calendar size={12} /> Tanggal
            </label>
            <input
              type="date"
              value={form.date}
              max={today}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Status Kehadiran</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: s.value })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.status === s.value
                      ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Check-in / Check-out times — hidden for ABSENT/SICK/PERMISSION */}
          {!noCheckInOut && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  <Clock size={12} /> Jam Masuk (WIB/GMT+8)
                </label>
                <input
                  type="time"
                  value={form.checkInTime}
                  onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  <Clock size={12} /> Jam Pulang (WIB/GMT+8)
                </label>
                <input
                  type="time"
                  value={form.checkOutTime}
                  onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Keterangan</label>
            <textarea
              value={form.manualNotes}
              onChange={(e) => setForm({ ...form, manualNotes: e.target.value })}
              placeholder="Alasan, keterangan tambahan..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.targetEmployeeId}
            className="flex-1 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Menyimpan..." : "Simpan Absensi"}
          </button>
        </div>
      </div>
    </div>
  );
}
