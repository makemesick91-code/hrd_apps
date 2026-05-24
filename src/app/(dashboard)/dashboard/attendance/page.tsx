"use client";

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import { Clock, MapPin, QrCode, CheckCircle2, XCircle, Timer, Download, Filter, Loader2, Plus, CalendarDays, X, Pencil, ScanFace, LocateFixed, WifiOff } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const QRScanner = lazy(() => import("@/components/attendance/QRScanner"));
const QRDisplay = lazy(() => import("@/components/attendance/QRDisplay"));
const ManualAttendanceModal = lazy(() => import("@/components/attendance/ManualAttendanceModal"));
const BulkAttendanceModal = lazy(() => import("@/components/attendance/BulkAttendanceModal"));
const FaceEnrollment = lazy(() => import("@/components/attendance/FaceEnrollment"));
const FaceVerification = lazy(() => import("@/components/attendance/FaceVerification"));

type CheckStatus = "idle" | "checked-in" | "checked-out";

interface TodayRecord {
  id: string;
  date?: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  lateMinutes: number | null;
  earlyLeaveMinutes?: number | null;
  overtimeHours?: number | null;
  status: string;
  method: string;
  shift?: { id: string; name: string; code: string; startTime: string; endTime: string; color?: string } | null;
  employee?: {
    id: string;
    fullName: string;
    employeeId: string;
    department: { name: string } | null;
  };
}

export default function AttendancePage() {
  const { user } = useAuthStore();
  const isAdmin = user && ["SUPER_ADMIN", "HRD"].includes((user as { role: string }).role);
  const [tab, setTab] = useState<"today" | "checkin">("checkin");
  const [showScanner, setShowScanner] = useState(false);
  const [showQRDisplay, setShowQRDisplay] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState<"check-in" | "check-out" | null>(null);
  const [editRecord, setEditRecord] = useState<{
    employeeId: string; employeeName: string; date: string;
    checkIn?: string; checkOut?: string; status?: string; notes?: string;
  } | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<CheckStatus>("idle");

  // Real attendance data for "today" tab
  const [todayData, setTodayData] = useState<TodayRecord[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "active" | "denied" | "unavailable">("idle");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [todayRecord, setTodayRecord] = useState<TodayRecord | null>(null);
  const [now, setNow] = useState(new Date());

  // Filter state
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({ startDate: todayStr, endDate: todayStr, status: "", department: "" });
  const [pendingFilters, setPendingFilters] = useState({ startDate: todayStr, endDate: todayStr, status: "", department: "" });
  const activeFilterCount = [filters.status, filters.department,
    filters.startDate !== todayStr || filters.endDate !== todayStr ? "date" : ""].filter(Boolean).length;

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load today's attendance status on mount
  const loadTodayStatus = useCallback(async () => {
    const employeeId = (user as { employee?: { id: string } } | null)?.employee?.id;
    if (!employeeId) { setInitializing(false); return; }

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/attendance?employeeId=${employeeId}&startDate=${today}&endDate=${today}&limit=1`);
      const data = await res.json();
      if (data.success && data.data?.data?.length > 0) {
        const rec: TodayRecord = data.data.data[0];
        // Check if it's from today
        const recDate = new Date(rec.checkIn || "");
        const today = new Date();
        if (
          recDate.getDate() === today.getDate() &&
          recDate.getMonth() === today.getMonth() &&
          recDate.getFullYear() === today.getFullYear()
        ) {
          setTodayRecord(rec);
          if (rec.checkOut) {
            setCheckInStatus("checked-out");
            setCheckInTime(new Date(rec.checkIn!));
            setCheckOutTime(new Date(rec.checkOut));
          } else {
            setCheckInStatus("checked-in");
            setCheckInTime(new Date(rec.checkIn!));
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => { loadTodayStatus(); requestLocation(); }, [loadTodayStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodayAttendance = useCallback(async (f = filters) => {
    const empId = (user as { employee?: { id: string } } | null)?.employee?.id;
    const adminView = user && ["SUPER_ADMIN", "HRD"].includes((user as { role: string }).role);
    if (!adminView && !empId) return;
    setLoadingToday(true);
    try {
      const empParam = adminView ? "" : `&employeeId=${empId}`;
      const res = await fetch(`/api/attendance?startDate=${f.startDate}&endDate=${f.endDate}${empParam}&limit=500`);
      const data = await res.json();
      if (data.success) setTodayData(data.data?.data || []);
    } catch { /* ignore */ } finally {
      setLoadingToday(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { if (tab === "today") loadTodayAttendance(filters); }, [tab]); // eslint-disable-line

  // Client-side filter
  const departments = useMemo(() =>
    [...new Set(todayData.map(r => r.employee?.department?.name).filter((d): d is string => !!d))],
    [todayData]);

  const filteredData = useMemo(() =>
    todayData.filter(r => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.department && r.employee?.department?.name !== filters.department) return false;
      return true;
    }), [todayData, filters]);

  const handleApplyFilter = () => {
    setFilters(pendingFilters);
    setFilterOpen(false);
    loadTodayAttendance(pendingFilters);
  };

  const handleResetFilter = () => {
    const reset = { startDate: todayStr, endDate: todayStr, status: "", department: "" };
    setFilters(reset);
    setPendingFilters(reset);
    setFilterOpen(false);
    loadTodayAttendance(reset);
  };

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async () => {
    const TZ = "Asia/Makassar";
    let exportData: TodayRecord[] = todayData;

    const empId = (user as { employee?: { id: string } } | null)?.employee?.id;
    const adminView = user && ["SUPER_ADMIN", "HRD"].includes((user as { role: string }).role);
    try {
      const empParam = adminView ? "" : empId ? `&employeeId=${empId}` : "";
      const res = await fetch(`/api/attendance?startDate=${filters.startDate}&endDate=${filters.endDate}${empParam}&limit=1000`);
      const json = await res.json();
      if (json.success) exportData = json.data?.data ?? [];
    } catch { /* fall back to todayData */ }

    if (exportData.length === 0) { toast.error("Tidak ada data untuk diekspor"); return; }

    const XLSX = await import("xlsx");

    const fmtDate = (dt: string | null | undefined) => {
      if (!dt) return "";
      return new Date(dt).toLocaleDateString("id-ID", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
    };
    const fmtTime = (dt: string | null | undefined) => {
      if (!dt) return "";
      return new Date(dt).toLocaleTimeString("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
    };

    const MONTH_ID = ["JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI","JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"];
    const startD = new Date(filters.startDate + "T00:00:00");
    const endD   = new Date(filters.endDate   + "T00:00:00");
    const sameMonth = startD.getMonth() === endD.getMonth() && startD.getFullYear() === endD.getFullYear();
    const period = sameMonth
      ? `${MONTH_ID[startD.getMonth()]} ${startD.getFullYear()}`
      : `${filters.startDate} s/d ${filters.endDate}`;

    const headers = [
      "No", "Nama", "Tanggal", "Jam Kerja",
      "Jam Masuk", "Jam Pulang", "Scan Masuk", "Scan Pulang",
      "Terlambat (mnt)", "Pulang Cepat (mnt)", "Lembur (jam)", "Jml Jam Kerja", "Divisi",
    ];

    const dataRows = exportData.map((r, i) => [
      i + 1,
      r.employee?.fullName ?? "",
      fmtDate(r.date ?? r.checkIn),
      r.shift?.name ?? "-",
      r.shift?.startTime ?? "-",
      r.shift?.endTime ?? "-",
      fmtTime(r.checkIn),
      fmtTime(r.checkOut),
      r.lateMinutes ?? 0,
      r.earlyLeaveMinutes ?? 0,
      r.overtimeHours ?? 0,
      r.workHours ?? 0,
      r.employee?.department?.name ?? "",
    ]);

    const wsData = [
      [`LAPORAN ABSENSI - ${period}`],
      [],
      headers,
      ...dataRows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title across all columns
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

    // Column widths
    ws["!cols"] = [
      { wch: 5 },  { wch: 28 }, { wch: 14 }, { wch: 22 },
      { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 11 },
      { wch: 17 }, { wch: 19 }, { wch: 13 }, { wch: 14 }, { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");

    const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbOut], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absensi_${filters.startDate}_${filters.endDate}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${exportData.length} data diekspor ke Excel`);
  };

  const getLocation = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) { setGpsStatus("unavailable"); return resolve(null); }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setGpsStatus("active");
          resolve(loc);
        },
        (err) => {
          setGpsStatus(err.code === 1 ? "denied" : "unavailable");
          resolve(null);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });

  const requestLocation = () => {
    setGpsStatus("loading");
    getLocation();
  };

  useEffect(() => {
    if (tab === "checkin") requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleQRScan = async (scannedData: string) => {
    setShowScanner(false);
    setLoading(true);
    try {
      const loc = await getLocation();
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: checkInStatus === "idle" ? "check-in" : "check-out",
          latitude: loc?.lat,
          longitude: loc?.lng,
          method: "QR_CODE",
          qrToken: scannedData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (checkInStatus === "idle") {
          setCheckInStatus("checked-in");
          setCheckInTime(new Date(data.data.checkIn));
          setTodayRecord(data.data);
          toast.success("Check in via QR berhasil! 🎉");
        } else {
          setCheckInStatus("checked-out");
          setCheckOutTime(new Date(data.data.checkOut));
          setTodayRecord(data.data);
          toast.success(`Check out via QR berhasil! ${data.data.workHours?.toFixed(1)} jam kerja 🏠`);
        }
      } else {
        toast.error(data.message || "QR code tidak valid");
      }
    } catch {
      toast.error("Gagal memproses QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (method: "MANUAL" | "FACE" = "MANUAL") => {
    setLoading(true);
    try {
      const loc = await getLocation();
      if (loc) setLocation(loc);

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "check-in",
          latitude: loc?.lat,
          longitude: loc?.lng,
          method,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCheckInStatus("checked-in");
        setCheckInTime(new Date(data.data.checkIn));
        setTodayRecord(data.data);
        toast.success("Check in berhasil! Selamat bekerja 🎉");
      } else {
        toast.error(data.message || "Gagal check in");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (method: "MANUAL" | "FACE" = "MANUAL") => {
    setLoading(true);
    try {
      const loc = await getLocation();

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "check-out",
          latitude: loc?.lat,
          longitude: loc?.lng,
          method,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCheckInStatus("checked-out");
        setCheckOutTime(new Date(data.data.checkOut));
        setTodayRecord(data.data);
        toast.success(`Check out berhasil! Total ${data.data.workHours?.toFixed(1)} jam kerja 🏠`);
      } else {
        toast.error(data.message || "Gagal check out");
      }
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceScan = async (actionType: "check-in" | "check-out") => {
    try {
      const res = await fetch("/api/employees/face");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShowFaceVerification(actionType);
          return;
        }
      }
      setShowFaceEnrollment(true);
      toast("Daftarkan wajah Anda terlebih dahulu", { icon: "ℹ️" });
    } catch {
      setShowFaceEnrollment(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Absensi"
        subtitle="Kelola dan pantau absensi karyawan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Absensi" }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter size={14} />}
                onClick={() => { setPendingFilters(filters); setFilterOpen(v => !v); }}
              >
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#1E3A8A] text-white text-xs leading-none">{activeFilterCount}</span>
                )}
              </Button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Filter Absensi</span>
                    <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Tanggal Dari</label>
                    <input type="date" value={pendingFilters.startDate}
                      onChange={e => setPendingFilters(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Tanggal Sampai</label>
                    <input type="date" value={pendingFilters.endDate}
                      onChange={e => setPendingFilters(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
                    <select value={pendingFilters.status}
                      onChange={e => setPendingFilters(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                      <option value="">Semua Status</option>
                      {[["PRESENT","Hadir"],["LATE","Terlambat"],["ABSENT","Absen"],["SICK","Sakit"],["PERMISSION","Izin"],["WFH","WFH"]].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Divisi</label>
                    <select value={pendingFilters.department}
                      onChange={e => setPendingFilters(p => ({ ...p, department: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                      <option value="">Semua Divisi</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={handleResetFilter} className="flex-1 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Reset
                    </button>
                    <button onClick={handleApplyFilter} className="flex-1 py-2 text-xs font-semibold bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-800 transition-colors">
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExport}>Export</Button>
            {isAdmin && (
              <>
                <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowManualModal(true)}>
                  Tambah Manual
                </Button>
                <Button size="sm" variant="outline" leftIcon={<CalendarDays size={14} />} onClick={() => setShowBulkModal(true)}>
                  Input Bulanan
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Hadir Hari Ini", value: 142, icon: <CheckCircle2 size={18} />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Terlambat", value: 12, icon: <Timer size={18} />, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
          { label: "Tidak Hadir", value: 8, icon: <XCircle size={18} />, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
          { label: "WFH", value: 15, icon: <MapPin size={18} />, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white font-display">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { key: "checkin", label: "Check In/Out" },
          { key: "today", label: "Absensi Hari Ini" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "checkin" && (
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-premium overflow-hidden">
            {/* Clock display */}
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] p-8 text-center">
              <div className="text-6xl font-bold text-white font-display mb-2 tabular-nums">
                {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div className="text-blue-200 text-sm">{formatDate(now, "EEEE, dd MMMM yyyy")}</div>
              <div className="flex items-center justify-center mt-3">
                {gpsStatus === "loading" && (
                  <div className="flex items-center gap-1.5 text-blue-200 text-xs">
                    <Loader2 size={12} className="animate-spin" /> Mengambil lokasi...
                  </div>
                )}
                {gpsStatus === "active" && location && (
                  <button onClick={requestLocation} className="flex items-center gap-1.5 text-emerald-300 text-xs hover:text-emerald-200 transition-colors">
                    <LocateFixed size={12} />
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </button>
                )}
                {(gpsStatus === "denied" || gpsStatus === "unavailable") && (
                  <button onClick={requestLocation} className="flex items-center gap-1.5 text-red-300 text-xs hover:text-red-200 transition-colors">
                    <WifiOff size={12} /> GPS tidak aktif — klik untuk coba lagi
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {initializing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
                </div>
              ) : (
                <>
                  {checkInStatus === "idle" && (
                    <>
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Verifikasi wajah diperlukan untuk mulai bekerja hari ini
                      </div>
                      <button
                        onClick={() => handleFaceScan("check-in")}
                        disabled={loading}
                        className="w-full py-4 bg-linear-to-r from-emerald-500 to-green-400 text-white font-semibold rounded-2xl hover:opacity-95 hover:shadow-lg transition-all flex items-center justify-center gap-3 text-base disabled:opacity-60"
                      >
                        {loading ? <Loader2 size={22} className="animate-spin" /> : <ScanFace size={22} />}
                        {loading ? "Memproses..." : "Check In via Wajah"}
                      </button>
                      <button
                        onClick={() => setShowScanner(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <QrCode size={18} />
                        Scan QR Code
                      </button>
                    </>
                  )}

                  {checkInStatus === "checked-in" && (
                    <>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                        <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          Sudah Check In
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                          Pukul {checkInTime?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleFaceScan("check-out")}
                        disabled={loading}
                        className="w-full py-4 bg-linear-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-3 text-base disabled:opacity-60"
                      >
                        {loading ? <Loader2 size={22} className="animate-spin" /> : <ScanFace size={22} />}
                        {loading ? "Memproses..." : "Check Out via Wajah"}
                      </button>
                      <button
                        onClick={() => setShowScanner(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <QrCode size={18} />
                        Check Out via QR Code
                      </button>
                    </>
                  )}

                  {checkInStatus === "checked-out" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center space-y-3">
                      <div className="text-4xl">🏠</div>
                      <div className="text-base font-semibold text-blue-700 dark:text-blue-400">
                        Sudah Check Out
                      </div>
                      {todayRecord?.workHours != null && (
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Total jam kerja: <span className="font-bold">{todayRecord.workHours.toFixed(1)} jam</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-2">
                          <div className="text-gray-400 mb-0.5">Check In</div>
                          <div className="font-semibold text-gray-700 dark:text-gray-200">
                            {checkInTime?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-2">
                          <div className="text-gray-400 mb-0.5">Check Out</div>
                          <div className="font-semibold text-gray-700 dark:text-gray-200">
                            {checkOutTime?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-500 mt-2">
                        Terima kasih atas kerja keras Anda hari ini!
                      </div>
                    </div>
                  )}

                  {/* QR Display for HRD/Admin */}
                  {user && ["SUPER_ADMIN", "HRD"].includes((user as { role: string }).role) && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => setShowQRDisplay((v) => !v)}
                        className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-[#1E3A8A] dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                      >
                        <QrCode size={16} />
                        {showQRDisplay ? "Sembunyikan" : "Tampilkan"} QR Code Kantor
                      </button>
                      {showQRDisplay && (
                        <Suspense fallback={<div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                          <QRDisplay />
                        </Suspense>
                      )}
                    </div>
                  )}

                  {/* Methods info */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-colors ${
                      gpsStatus === "active" ? "border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}>
                      {gpsStatus === "loading" ? <Loader2 size={16} className="animate-spin" /> : gpsStatus === "active" ? <LocateFixed size={16} /> : <MapPin size={16} />}
                      GPS
                    </div>
                    {[
                      { icon: <QrCode size={16} />, label: "QR Code" },
                      { icon: <Clock size={16} />, label: "Manual" },
                      { icon: <ScanFace size={16} />, label: "Wajah" },
                    ].map((method) => (
                      <div key={method.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 text-xs">
                        {method.icon}
                        {method.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "today" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loadingToday ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" /> Memuat data absensi...
            </div>
          ) : todayData.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-gray-400 text-sm">Belum ada absensi pada periode ini</div>
              {isAdmin && (
                <button onClick={() => setShowManualModal(true)} className="mt-3 text-xs text-[#1E3A8A] hover:underline flex items-center gap-1 mx-auto">
                  <Plus size={12} /> Tambah absensi manual
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {filteredData.length < todayData.length && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between">
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    Menampilkan <strong>{filteredData.length}</strong> dari {todayData.length} data
                  </span>
                  <button onClick={handleResetFilter} className="text-xs text-blue-600 hover:underline">Hapus filter</button>
                </div>
              )}
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Divisi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam Kerja</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metode</th>
                    {isAdmin && <th className="px-4 py-3 w-10" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredData.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data yang cocok dengan filter</td></tr>
                  ) : filteredData.map((att) => {
                    const checkInLocal = att.checkIn
                      ? new Date(att.checkIn).toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit" })
                      : null;
                    const checkOutLocal = att.checkOut
                      ? new Date(att.checkOut).toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit" })
                      : null;
                    return (
                      <tr key={att.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{att.employee?.fullName ?? "-"}</div>
                          <div className="text-xs text-gray-400">{att.employee?.employeeId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{att.employee?.department?.name ?? "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          {checkInLocal ? (
                            <div>
                              <span className={att.status === "LATE" ? "text-amber-600 font-semibold" : "text-gray-700 dark:text-gray-300"}>
                                {checkInLocal}
                              </span>
                              {att.lateMinutes && att.lateMinutes > 0 ? (
                                <div className="text-xs text-amber-500">+{att.lateMinutes} mnt</div>
                              ) : null}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{checkOutLocal ?? "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {att.workHours != null ? `${att.workHours}j` : "-"}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={att.status} /></td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                            {(att.method || "MANUAL").replace("_", " ")}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-2 py-3">
                            <button
                              onClick={() => {
                                const TZ = "Asia/Makassar";
                                const toTime = (dt: string | null) => dt
                                  ? new Date(dt).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false })
                                  : undefined;
                                const dateStr = att.date
                                  ? new Date(att.date).toLocaleDateString("en-CA", { timeZone: TZ })
                                  : att.checkIn
                                    ? new Date(att.checkIn).toLocaleDateString("en-CA", { timeZone: TZ })
                                    : "";
                                setEditRecord({
                                  employeeId: att.employee?.id ?? "",
                                  employeeName: att.employee?.fullName ?? "",
                                  date: dateStr,
                                  checkIn: toTime(att.checkIn),
                                  checkOut: toTime(att.checkOut),
                                  status: att.status,
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-[#1E3A8A] transition-colors"
                              title="Edit absensi"
                            >
                              <Pencil size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual attendance modal */}
      {showManualModal && (
        <Suspense fallback={null}>
          <ManualAttendanceModal
            onClose={() => setShowManualModal(false)}
            onSuccess={() => { loadTodayAttendance(); setTab("today"); }}
          />
        </Suspense>
      )}

      {/* Edit attendance record modal */}
      {editRecord && (
        <Suspense fallback={null}>
          <ManualAttendanceModal
            editRecord={editRecord}
            onClose={() => setEditRecord(null)}
            onSuccess={() => { setEditRecord(null); loadTodayAttendance(); }}
          />
        </Suspense>
      )}

      {/* Bulk monthly attendance modal */}
      {showBulkModal && (
        <Suspense fallback={null}>
          <BulkAttendanceModal
            onClose={() => setShowBulkModal(false)}
            onSuccess={() => { loadTodayAttendance(); setTab("today"); }}
          />
        </Suspense>
      )}

      {/* QR Scanner modal */}
      {showScanner && (
        <Suspense fallback={null}>
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        </Suspense>
      )}

      {/* Face enrollment modal */}
      {showFaceEnrollment && (
        <Suspense fallback={null}>
          <FaceEnrollment
            onClose={() => setShowFaceEnrollment(false)}
            onSuccess={() => setShowFaceEnrollment(false)}
          />
        </Suspense>
      )}

      {/* Face verification modal */}
      {showFaceVerification && (
        <Suspense fallback={null}>
          <FaceVerification
            type={showFaceVerification}
            onClose={() => setShowFaceVerification(null)}
            onSuccess={() => {
              if (showFaceVerification === "check-in") handleCheckIn("FACE");
              else handleCheckOut("FACE");
              setShowFaceVerification(null);
            }}
          />
        </Suspense>
      )}

    </div>
  );
}
