"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Save, Trash2, Loader2, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";

interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  scanInStart: string | null;
  scanInEnd: string | null;
  scanOutStart: string | null;
  scanOutEnd: string | null;
  workDays: number[];
  toleranceMinutes: number;
  earlyLeaveTolerance: number;
  workDaysCount: number;
  workMinutesCount: number;
  color: string;
  requireCheckIn: boolean;
  requireCheckOut: boolean;
  timezone: string;
  isActive: boolean;
}

const BLANK: Omit<Shift, "id"> = {
  name: "",
  code: "",
  startTime: "08:00",
  endTime: "17:00",
  breakStart: null,
  breakEnd: null,
  scanInStart: "05:00",
  scanInEnd: "11:00",
  scanOutStart: "14:00",
  scanOutEnd: "20:00",
  workDays: [1, 2, 3, 4, 5],
  toleranceMinutes: 15,
  earlyLeaveTolerance: 0,
  workDaysCount: 1,
  workMinutesCount: 0,
  color: "#3B82F6",
  requireCheckIn: true,
  requireCheckOut: true,
  timezone: "Asia/Makassar",
  isActive: true,
};

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const PRESET_COLORS = [
  "#EF4444","#F97316","#EAB308","#84CC16","#22C55E","#10B981",
  "#06B6D4","#3B82F6","#6366F1","#8B5CF6","#EC4899","#F43F5E",
  "#78350F","#1E3A8A","#064E3B","#000000",
];

function TimeInput({ label, value, onChange, disabled }: { label: string; value: string | null | undefined; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 dark:text-gray-400 w-44 shrink-0">{label}</label>
      <input
        type="time"
        value={value ?? ""}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="w-24 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white tabular-nums disabled:opacity-40"
      />
    </div>
  );
}

function NumInput({ label, value, onChange, min = 0, max = 9999 }: { label: string; value: number | null | undefined; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 dark:text-gray-400 w-44 shrink-0">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? 0}
        onChange={e => onChange(Number(e.target.value))}
        className="w-24 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white tabular-nums"
      />
    </div>
  );
}

export default function ShiftSettings() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selected, setSelected] = useState<Shift | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shifts");
      const data = await res.json();
      if (data.success) setShifts(data.data);
    } catch { toast.error("Gagal memuat data shift"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTambah = () => {
    setSelected({ id: "", ...BLANK });
    setIsNew(true);
  };

  const handleSelect = (shift: Shift) => {
    setSelected({ ...shift });
    setIsNew(false);
    setShowColorPicker(false);
  };

  const handleSimpan = async () => {
    if (!selected) return;
    if (!selected.name.trim()) { toast.error("Nama jam kerja wajib diisi"); return; }
    if (!selected.code.trim()) { toast.error("Kode shift wajib diisi"); return; }
    if (!selected.startTime || !selected.endTime) { toast.error("Jam masuk dan jam pulang wajib diisi"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/shifts", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await load();
        setSelected(data.data);
        setIsNew(false);
      } else {
        toast.error(data.message || "Gagal menyimpan");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleHapus = async () => {
    if (!selected || isNew) return;
    if (!confirm(`Hapus shift "${selected.name}"? Data absensi terkait tidak akan terhapus.`)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelected(null);
        setIsNew(false);
        await load();
      } else {
        toast.error(data.message || "Gagal menghapus");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setDeleting(false); }
  };

  const upd = (patch: Partial<Shift>) => setSelected(prev => prev ? { ...prev, ...patch } : prev);

  return (
    <div className="flex gap-0 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900" style={{ minHeight: 520 }}>

      {/* ── LEFT: TABLE ── */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-gray-200 dark:border-gray-700">
        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-160">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {["Nama Jam Kerja","Jam Masuk","Jam Pulang","Mulai C/In","Akhir C/In","Mulai C/Out","Akhir C/Out","Warna","Hari Kerja"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400">
                  <Loader2 size={20} className="animate-spin mx-auto" />
                </td></tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                  Belum ada data. Klik <strong>+ Tambah</strong> untuk membuat shift baru.
                </td></tr>
              ) : shifts.map((s) => {
                const isActive = selected?.id === s.id;
                return (
                  <tr
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#1E3A8A] text-white"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{s.startTime}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{s.endTime}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{s.scanInStart ?? "—"}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{s.scanInEnd ?? "—"}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{s.scanOutStart ?? "—"}</td>
                    <td className="px-3 py-2 tabular-nums whitespace-nowrap">{s.scanOutEnd ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block w-6 h-5 rounded border border-black/10"
                        style={{ background: s.color }}
                      />
                    </td>
                    <td className="px-3 py-2 tabular-nums text-center">{s.workDaysCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div className="w-64 shrink-0 flex flex-col">
        {/* Action buttons */}
        <div className="flex items-center gap-1 px-3 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
          <button
            onClick={handleTambah}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
          >
            <Plus size={12} /> Tambah
          </button>
          <button
            onClick={handleSimpan}
            disabled={saving || !selected}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Simpan
          </button>
          <button
            onClick={handleHapus}
            disabled={deleting || !selected || isNew}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-40"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Hapus
          </button>
        </div>

        {/* Form fields */}
        {selected ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">

            {/* Nama + Kode */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Nama Jam kerja</label>
              <input
                type="text"
                value={selected.name}
                onChange={e => upd({ name: e.target.value })}
                placeholder="PAGI, SIANG, ..."
                className="mt-1 w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            {isNew && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Kode</label>
                <input
                  type="text"
                  value={selected.code}
                  onChange={e => upd({ code: e.target.value.toUpperCase() })}
                  placeholder="PAGI"
                  className="mt-1 w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            )}

            <div className="pt-1 space-y-2">
              <TimeInput label="Jam masuk" value={selected.startTime} onChange={v => upd({ startTime: v })} />
              <TimeInput label="Jam pulang" value={selected.endTime} onChange={v => upd({ endTime: v })} />
              <NumInput label="Toleransi terlambat (menit)" value={selected.toleranceMinutes} onChange={v => upd({ toleranceMinutes: v })} min={0} max={120} />
              <NumInput label="Toleransi plg. cepat (menit)" value={selected.earlyLeaveTolerance} onChange={v => upd({ earlyLeaveTolerance: v })} min={0} max={120} />
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 space-y-2">
              <TimeInput label="Jam mulai scan masuk" value={selected.scanInStart} onChange={v => upd({ scanInStart: v })} />
              <TimeInput label="Jam akhir scan masuk" value={selected.scanInEnd} onChange={v => upd({ scanInEnd: v })} />
              <TimeInput label="Jam mulai scan pulang" value={selected.scanOutStart} onChange={v => upd({ scanOutStart: v })} />
              <TimeInput label="Jam akhir scan pulang" value={selected.scanOutEnd} onChange={v => upd({ scanOutEnd: v })} />
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 space-y-2">
              <NumInput label="Hitungan hari" value={selected.workDaysCount} onChange={v => upd({ workDaysCount: v })} min={0} />
              <NumInput label="Hitungan menit" value={selected.workMinutesCount} onChange={v => upd({ workMinutesCount: v })} min={0} />
            </div>

            {/* Hari Kerja checkboxes */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Hari Kerja</label>
              <div className="flex gap-1 flex-wrap">
                {DAY_LABELS.map((d, i) => {
                  const on = selected.workDays.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const days = on
                          ? selected.workDays.filter(x => x !== i)
                          : [...selected.workDays, i].sort();
                        upd({ workDays: days });
                      }}
                      className={`w-8 h-7 rounded-md text-xs font-semibold transition-colors ${
                        on ? "bg-[#1E3A8A] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >{d}</button>
                  );
                })}
              </div>
            </div>

            {/* Harus C/In & C/Out */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex gap-4">
              <button
                type="button"
                onClick={() => upd({ requireCheckIn: !selected.requireCheckIn })}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium"
              >
                {selected.requireCheckIn
                  ? <CheckSquare size={14} className="text-[#1E3A8A]" />
                  : <Square size={14} className="text-gray-400" />
                }
                Harus C/In
              </button>
              <button
                type="button"
                onClick={() => upd({ requireCheckOut: !selected.requireCheckOut })}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium"
              >
                {selected.requireCheckOut
                  ? <CheckSquare size={14} className="text-[#1E3A8A]" />
                  : <Square size={14} className="text-gray-400" />
                }
                Harus C/Out
              </button>
            </div>

            {/* Color picker */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-7 rounded-md border border-black/15 shrink-0 cursor-pointer"
                  style={{ background: selected.color }}
                  onClick={() => setShowColorPicker(v => !v)}
                />
                <button
                  type="button"
                  onClick={() => setShowColorPicker(v => !v)}
                  className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800"
                >
                  Ganti warna
                </button>
              </div>

              {showColorPicker && (
                <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  {/* Quick presets */}
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { upd({ color: c }); setShowColorPicker(false); }}
                        title={c}
                        className={`w-6 h-6 rounded-md border-2 transition-all ${selected.color === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent hover:border-gray-400"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  {/* Native color input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selected.color}
                      onChange={e => upd({ color: e.target.value })}
                      className="w-8 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={selected.color}
                      onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && upd({ color: e.target.value })}
                      className="flex-1 text-xs px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none font-mono dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400 px-4 text-center">
            Pilih baris dari tabel atau klik <strong className="mx-0.5">+ Tambah</strong> untuk membuat shift baru
          </div>
        )}
      </div>
    </div>
  );
}
