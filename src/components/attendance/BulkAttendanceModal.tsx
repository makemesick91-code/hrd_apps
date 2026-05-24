"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Save, Loader2, ChevronLeft, ChevronRight, Wand2, RotateCcw, CheckSquare, Square, Search, Users } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<string, { label: string; dot: string; row: string; badge: string }> = {
  PRESENT:    { label: "Hadir",     dot: "bg-emerald-500", row: "bg-emerald-50/40 dark:bg-emerald-900/10",  badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  LATE:       { label: "Terlambat", dot: "bg-amber-500",   row: "bg-amber-50/40 dark:bg-amber-900/10",    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  ABSENT:     { label: "Absen",     dot: "bg-red-500",     row: "bg-red-50/40 dark:bg-red-900/10",        badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  SICK:       { label: "Sakit",     dot: "bg-orange-500",  row: "bg-orange-50/40 dark:bg-orange-900/10",  badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  PERMISSION: { label: "Izin",      dot: "bg-blue-500",    row: "bg-blue-50/40 dark:bg-blue-900/10",      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  WFH:        { label: "WFH",       dot: "bg-purple-500",  row: "bg-purple-50/40 dark:bg-purple-900/10",  badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
};

const STATUS_CYCLE = ["PRESENT", "LATE", "ABSENT", "SICK", "PERMISSION", "WFH"];
const NO_TIME = new Set(["ABSENT", "SICK", "PERMISSION"]);
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const MANUAL_ID = "__manual__";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  department: { name: string } | null;
}

interface ShiftOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DayRecord {
  date: string;
  day: number;
  dayName: string;
  isWeekend: boolean;
  status: string;
  shiftId: string;       // shift id, "" = no shift yet, MANUAL_ID = manual
  checkInTime: string;
  checkOutTime: string;
  notes: string;
  active: boolean;
}

function calcWorkHours(inTime: string, outTime: string): string {
  const [ih, im] = inTime.split(":").map(Number);
  const [oh, om] = outTime.split(":").map(Number);
  const diff = (oh * 60 + om) - (ih * 60 + im);
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `${h}j ${m}m` : `${h}j`;
}

function buildRecords(year: number, month: number, defaultShift: ShiftOption | null): DayRecord[] {
  const total = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => {
    const day = i + 1;
    const dow = new Date(year, month, day).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return {
      date: `${year}-${mm}-${dd}`,
      day,
      dayName: DAY_NAMES[dow],
      isWeekend,
      status: isWeekend ? "ABSENT" : "PRESENT",
      shiftId: defaultShift ? defaultShift.id : "",
      checkInTime: defaultShift?.startTime ?? "08:00",
      checkOutTime: defaultShift?.endTime ?? "17:00",
      notes: "",
      active: !isWeekend,
    };
  });
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkAttendanceModal({ onClose, onSuccess }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empSearch, setEmpSearch] = useState("");
  const [showEmpList, setShowEmpList] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [loadingEmps, setLoadingEmps] = useState(false);

  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [defaultShiftId, setDefaultShiftId] = useState<string>("");

  const [records, setRecords] = useState<DayRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Load employees + shifts on mount
  useEffect(() => {
    setLoadingEmps(true);
    fetch("/api/employees?limit=200")
      .then(r => r.json())
      .then(d => { if (d.success) setEmployees(d.data?.data || d.data || []); })
      .catch(() => toast.error("Gagal memuat karyawan"))
      .finally(() => setLoadingEmps(false));

    fetch("/api/shifts")
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          const list: ShiftOption[] = d.data.map((s: ShiftOption) => ({
            id: s.id, name: s.name, startTime: s.startTime, endTime: s.endTime, color: s.color,
          }));
          setShifts(list);
          if (list.length > 0) {
            setDefaultShiftId(list[0].id);
            setRecords(buildRecords(now.getFullYear(), now.getMonth(), list[0]));
          } else {
            setRecords(buildRecords(now.getFullYear(), now.getMonth(), null));
          }
        } else {
          setRecords(buildRecords(now.getFullYear(), now.getMonth(), null));
        }
      })
      .catch(() => setRecords(buildRecords(now.getFullYear(), now.getMonth(), null)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultShift = useMemo(() => shifts.find(s => s.id === defaultShiftId) ?? null, [shifts, defaultShiftId]);

  // Rebuild when month/year changes (keep using current defaultShift)
  useEffect(() => {
    setRecords(buildRecords(year, month, defaultShift));
    setSelectedRows(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const filteredEmps = useMemo(() =>
    employees.filter(e =>
      !empSearch ||
      e.fullName.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(empSearch.toLowerCase())
    ), [employees, empSearch]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const update = useCallback((idx: number, patch: Partial<DayRecord>) =>
    setRecords(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r)), []);

  const applyShiftToRow = useCallback((idx: number, shiftId: string) => {
    if (shiftId === MANUAL_ID) {
      update(idx, { shiftId: MANUAL_ID });
      return;
    }
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      update(idx, { shiftId: shift.id, checkInTime: shift.startTime, checkOutTime: shift.endTime });
    } else {
      update(idx, { shiftId: "" });
    }
  }, [shifts, update]);

  const cycleStatus = useCallback((idx: number) =>
    setRecords(prev => {
      const rec = prev[idx];
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(rec.status) + 1) % STATUS_CYCLE.length];
      return prev.map((r, i) => i === idx ? { ...r, status: next } : r);
    }), []);

  const autoFill = () => {
    const shift = defaultShift;
    setRecords(prev => prev.map(r => ({
      ...r,
      status: r.isWeekend ? "ABSENT" : "PRESENT",
      shiftId: shift ? shift.id : r.shiftId,
      checkInTime: shift ? shift.startTime : r.checkInTime,
      checkOutTime: shift ? shift.endTime : r.checkOutTime,
      notes: "",
      active: !r.isWeekend,
    })));
    toast.success(shift
      ? `Diisi otomatis: Hadir · ${shift.name} (${shift.startTime}–${shift.endTime})`
      : "Hari kerja diisi otomatis: Hadir"
    );
  };

  // Apply default shift to all active rows when defaultShiftId changes
  const applyDefaultShiftToAll = (shiftId: string) => {
    setDefaultShiftId(shiftId);
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    setRecords(prev => prev.map(r =>
      r.active ? { ...r, shiftId: shift.id, checkInTime: shift.startTime, checkOutTime: shift.endTime } : r
    ));
  };

  const reset = () => { setRecords(buildRecords(year, month, defaultShift)); setSelectedRows(new Set()); };

  const applyStatusToSelected = (status: string) => {
    setRecords(prev => prev.map((r, i) =>
      selectedRows.has(i) ? { ...r, status, active: true } : r
    ));
    setSelectedRows(new Set());
  };

  const toggleRow = (idx: number) =>
    setSelectedRows(prev => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });

  const toggleAll = () =>
    setSelectedRows(prev => prev.size === records.length ? new Set() : new Set(records.map((_, i) => i)));

  const summary = useMemo(() => {
    const active = records.filter(r => r.active);
    return {
      total: active.length,
      present: active.filter(r => r.status === "PRESENT").length,
      late:    active.filter(r => r.status === "LATE").length,
      absent:  active.filter(r => r.status === "ABSENT").length,
      sick:    active.filter(r => r.status === "SICK").length,
      perm:    active.filter(r => r.status === "PERMISSION").length,
      wfh:     active.filter(r => r.status === "WFH").length,
    };
  }, [records]);

  const handleSubmit = async () => {
    if (!selectedEmp) { toast.error("Pilih karyawan terlebih dahulu"); return; }
    const toSubmit = records.filter(r => r.active);
    if (toSubmit.length === 0) { toast.error("Tidak ada hari yang akan disimpan"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmp.id,
          records: toSubmit.map(r => ({
            date: r.date,
            status: r.status,
            checkInTime: NO_TIME.has(r.status) ? null : r.checkInTime,
            checkOutTime: NO_TIME.has(r.status) ? null : r.checkOutTime,
            shiftId: NO_TIME.has(r.status) ? null : (r.shiftId !== MANUAL_ID ? r.shiftId || null : null),
            notes: r.notes || null,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); onSuccess(); onClose(); }
      else toast.error(data.message || "Gagal menyimpan");
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const allSelected = selectedRows.size === records.length && records.length > 0;

  // Grid layout: Checkbox | Tgl | Hari | Status | Jadwal | Jam Kerja | Keterangan | Aktif
  const GRID = "40px 44px 44px 150px minmax(160px,1.2fr) 68px minmax(120px,1fr) 52px";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col" style={{ height: "94vh" }}>

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white font-display text-base">Input Absensi Bulanan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pilih jadwal kerja per baris · klik status untuk mengganti · pilih baris untuk aksi massal</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-3 flex-wrap bg-gray-50/50 dark:bg-gray-800/20">

          {/* Employee dropdown */}
          <div className="relative">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowEmpList(v => !v)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowEmpList(v => !v); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors min-w-52 cursor-pointer select-none ${
                selectedEmp
                  ? "bg-white dark:bg-gray-800 border-[#1E3A8A] text-gray-900 dark:text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-400"
              }`}
            >
              {selectedEmp ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {selectedEmp.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-xs truncate">{selectedEmp.fullName}</div>
                    <div className="text-xs text-gray-400">{selectedEmp.employeeId}</div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={e => { e.stopPropagation(); setSelectedEmp(null); setEmpSearch(""); setShowEmpList(false); }}
                    onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); setSelectedEmp(null); setEmpSearch(""); setShowEmpList(false); } }}
                    className="text-gray-300 hover:text-gray-500 shrink-0 cursor-pointer"
                  ><X size={13} /></span>
                </>
              ) : (
                <>
                  <Users size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm">Pilih Karyawan...</span>
                </>
              )}
            </div>

            {showEmpList && (
              <div className="absolute top-full mt-1 left-0 z-30 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Search size={13} className="text-gray-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={empSearch}
                      onChange={e => setEmpSearch(e.target.value)}
                      placeholder="Cari nama atau ID..."
                      className="flex-1 text-sm bg-transparent focus:outline-none dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {loadingEmps ? (
                    <div className="flex justify-center py-5"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
                  ) : filteredEmps.length === 0 ? (
                    <div className="py-5 text-center text-xs text-gray-400">Tidak ditemukan</div>
                  ) : filteredEmps.slice(0, 20).map(emp => (
                    <button key={emp.id} type="button"
                      onClick={() => { setSelectedEmp(emp); setShowEmpList(false); setEmpSearch(""); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-xs flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{emp.fullName}</div>
                        <div className="text-xs text-gray-400">{emp.employeeId} · {emp.department?.name ?? "—"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

          {/* Month navigation */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button onClick={prevMonth} className="px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white px-3 min-w-36 text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button onClick={nextMonth} className="px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

          {/* Default shift selector — applies to all rows */}
          {shifts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Jadwal default:</span>
              <select
                value={defaultShiftId}
                onChange={e => applyDefaultShiftToAll(e.target.value)}
                className="text-xs px-2.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.startTime}–{s.endTime})</option>
                ))}
              </select>
            </div>
          )}

          {/* Action buttons */}
          <button onClick={autoFill} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800">
            <Wand2 size={13} /> Isi Otomatis
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
            <RotateCcw size={13} /> Reset
          </button>

          {/* Summary chips */}
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {[
              { label: "Hadir",     count: summary.present, color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
              { label: "Terlambat", count: summary.late,    color: "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" },
              { label: "Sakit",     count: summary.sick,    color: "text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
              { label: "Izin",      count: summary.perm,    color: "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
              { label: "Absen",     count: summary.absent,  color: "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
              { label: "WFH",       count: summary.wfh,     color: "text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
            ].map(s => (
              <span key={s.label} className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${s.color}`}>
                {s.label} <strong>{s.count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* ── BULK ACTION BAR ── */}
        {selectedRows.size > 0 && (
          <div className="px-5 py-2.5 bg-[#1E3A8A]/5 dark:bg-blue-900/20 border-b border-[#1E3A8A]/20 dark:border-blue-800 shrink-0 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-[#1E3A8A] dark:text-blue-300 shrink-0">
              {selectedRows.size} baris dipilih
            </span>
            <span className="text-xs text-gray-500 shrink-0">Ubah status:</span>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <button
                  key={val}
                  onClick={() => applyStatusToSelected(val)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${cfg.badge} hover:opacity-75 transition-opacity`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
            {shifts.length > 0 && (
              <>
                <span className="text-xs text-gray-500 shrink-0">Ubah jadwal:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {shifts.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setRecords(prev => prev.map((r, i) =>
                          selectedRows.has(i) && r.active
                            ? { ...r, shiftId: s.id, checkInTime: s.startTime, checkOutTime: s.endTime }
                            : r
                        ));
                        setSelectedRows(new Set());
                      }}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button onClick={() => setSelectedRows(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              Batal pilih
            </button>
          </div>
        )}

        {/* ── TABLE ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">

          {/* Column headers */}
          <div
            className="grid shrink-0 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold text-gray-500 dark:text-gray-400"
            style={{ gridTemplateColumns: GRID }}
          >
            <div className="flex items-center justify-center py-3 px-1">
              <button onClick={toggleAll} className="text-gray-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors">
                {allSelected
                  ? <CheckSquare size={15} className="text-[#1E3A8A] dark:text-blue-400" />
                  : <Square size={15} />
                }
              </button>
            </div>
            <div className="py-3 flex items-center">Tgl</div>
            <div className="py-3 flex items-center">Hari</div>
            <div className="py-3 px-2 flex items-center">Status</div>
            <div className="py-3 px-2 flex items-center">Jadwal Kerja</div>
            <div className="py-3 flex items-center">Jam Kerja</div>
            <div className="py-3 px-2 flex items-center">Keterangan</div>
            <div className="py-3 flex items-center justify-center">Aktif</div>
          </div>

          {/* Scrollable rows */}
          <div className="overflow-y-auto flex-1">
            {records.map((rec, idx) => {
              const cfg = STATUS_CONFIG[rec.status] ?? STATUS_CONFIG.PRESENT;
              const hideTime = NO_TIME.has(rec.status);
              const isSelected = selectedRows.has(idx);
              const isManual = rec.shiftId === MANUAL_ID;
              const workHours = !hideTime && rec.active && rec.checkInTime && rec.checkOutTime
                ? calcWorkHours(rec.checkInTime, rec.checkOutTime)
                : "—";
              const shiftForRow = shifts.find(s => s.id === rec.shiftId);

              return (
                <div
                  key={rec.date}
                  className={`grid border-b border-gray-100 dark:border-gray-800 transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : !rec.active
                        ? "bg-gray-50/80 dark:bg-gray-800/30 opacity-50"
                        : rec.isWeekend
                          ? "bg-red-50/20 dark:bg-red-900/5"
                          : cfg.row
                  }`}
                  style={{ gridTemplateColumns: GRID }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center py-2 px-1">
                    <button onClick={() => toggleRow(idx)} className="text-gray-300 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors">
                      {isSelected
                        ? <CheckSquare size={14} className="text-[#1E3A8A] dark:text-blue-400" />
                        : <Square size={14} />
                      }
                    </button>
                  </div>

                  {/* Day number */}
                  <div className={`flex items-center py-2 text-sm font-bold tabular-nums ${rec.isWeekend ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                    {rec.day}
                  </div>

                  {/* Day name */}
                  <div className={`flex items-center py-2 text-xs font-medium ${rec.isWeekend ? "text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {rec.dayName}
                  </div>

                  {/* Status — clickable to cycle */}
                  <div className="flex items-center py-2 px-2">
                    {rec.isWeekend && !rec.active ? (
                      <span className="text-xs text-gray-300 dark:text-gray-600 italic select-none">Libur</span>
                    ) : (
                      <button
                        onClick={() => rec.active && cycleStatus(idx)}
                        title={rec.active ? "Klik untuk ganti status" : ""}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${cfg.badge} ${
                          rec.active ? "hover:opacity-75 active:scale-95 cursor-pointer" : "cursor-default opacity-60"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    )}
                  </div>

                  {/* Jadwal Kerja — dropdown + manual time inputs */}
                  <div className="flex items-center py-1.5 px-2 gap-1.5">
                    {hideTime ? (
                      <span className="text-xs text-gray-300 dark:text-gray-600 italic">—</span>
                    ) : (
                      <>
                        <select
                          value={rec.shiftId || ""}
                          disabled={!rec.active}
                          onChange={e => applyShiftToRow(idx, e.target.value || "")}
                          className="flex-1 min-w-0 text-xs px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-20 disabled:cursor-not-allowed dark:text-white"
                        >
                          {!rec.shiftId && (
                            <option value="">— Pilih —</option>
                          )}
                          {shifts.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.startTime}–{s.endTime})
                            </option>
                          ))}
                          <option value={MANUAL_ID}>Manual...</option>
                        </select>

                        {/* Manual time inputs shown when "Manual..." selected */}
                        {isManual && rec.active && (
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="time"
                              value={rec.checkInTime}
                              onChange={e => update(idx, { checkInTime: e.target.value })}
                              className="w-20 text-xs px-1.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white tabular-nums"
                            />
                            <span className="text-gray-300 text-xs shrink-0">–</span>
                            <input
                              type="time"
                              value={rec.checkOutTime}
                              onChange={e => update(idx, { checkOutTime: e.target.value })}
                              className="w-20 text-xs px-1.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white tabular-nums"
                            />
                          </div>
                        )}

                        {/* Show time info when shift selected (not manual) */}
                        {shiftForRow && !isManual && rec.active && (
                          <span className="text-xs text-gray-400 tabular-nums shrink-0 hidden xl:inline">
                            {shiftForRow.startTime}–{shiftForRow.endTime}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Calculated work hours */}
                  <div className="flex items-center py-2 px-2">
                    <span className={`text-xs tabular-nums font-medium ${workHours === "—" ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"}`}>
                      {workHours}
                    </span>
                  </div>

                  {/* Notes */}
                  <div className="flex items-center py-1.5 pr-2">
                    <input
                      type="text"
                      value={rec.notes}
                      disabled={!rec.active}
                      onChange={e => update(idx, { notes: e.target.value })}
                      placeholder={rec.active ? "Keterangan..." : ""}
                      className="w-full text-xs px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-0 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                    />
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-center py-2">
                    <button
                      onClick={() => update(idx, { active: !rec.active })}
                      title={rec.active ? "Nonaktifkan baris" : "Aktifkan baris"}
                      className={`w-8 h-4 rounded-full transition-colors relative ${rec.active ? "bg-[#1E3A8A]" : "bg-gray-300 dark:bg-gray-600"}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${rec.active ? "left-4" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0 bg-gray-50/30 dark:bg-gray-800/20">
          <div className="flex-1 min-w-0">
            {selectedEmp ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Menyimpan{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{summary.total} hari</span>
                {" "}untuk{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedEmp.fullName}</span>
                {" "}· {MONTH_NAMES[month]} {year}
              </p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Pilih karyawan terlebih dahulu untuk menyimpan data
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !selectedEmp || summary.total === 0}
            className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Menyimpan..." : `Simpan ${summary.total} Hari`}
          </button>
        </div>
      </div>
    </div>
  );
}
