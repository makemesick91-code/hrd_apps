"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Plus, Search, Edit2, Trash2, Users, Navigation, X, Loader2,
  CheckCircle2, AlertCircle, Building2, Phone, Globe,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  isMain: boolean;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  _count: { employees: number };
}

const emptyForm = {
  name: "",
  code: "",
  address: "",
  city: "",
  phone: "",
  isMain: false,
  latitude: "",
  longitude: "",
  radius: "100",
};

export default function BranchesPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const canEdit = ["SUPER_ADMIN", "HRD"].includes(user?.role ?? "");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      if (data.success) setBranches(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (b: Branch) => {
    setEditTarget(b);
    setForm({
      name: b.name,
      code: b.code,
      address: b.address ?? "",
      city: b.city ?? "",
      phone: b.phone ?? "",
      isMain: b.isMain,
      latitude: b.latitude != null ? String(b.latitude) : "",
      longitude: b.longitude != null ? String(b.longitude) : "",
      radius: b.radius != null ? String(b.radius) : "100",
    });
    setShowModal(true);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung GPS");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setGettingLocation(false);
        toast.success("Lokasi berhasil diambil");
      },
      () => {
        toast.error("Gagal mendapatkan lokasi GPS");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Nama dan kode cabang wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        phone: form.phone.trim() || null,
        isMain: form.isMain,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        radius: form.radius ? Number(form.radius) : 100,
      };

      const res = await fetch(
        editTarget ? `/api/branches/${editTarget.id}` : "/api/branches",
        {
          method: editTarget ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || (editTarget ? "Cabang diperbarui" : "Cabang ditambahkan"));
        setShowModal(false);
        load();
      } else {
        toast.error(data.message || "Gagal menyimpan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`Hapus cabang "${branch.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(branch.id);
    try {
      const res = await fetch(`/api/branches/${branch.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Cabang berhasil dihapus");
        load();
      } else {
        toast.error(data.message || "Gagal menghapus");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = branches.filter(
    (b) =>
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalEmployees = branches.reduce((s, b) => s + b._count.employees, 0);
  const withGps = branches.filter((b) => b.latitude != null && b.longitude != null).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cabang Klinik"
        subtitle="Kelola cabang dan konfigurasi GPS untuk absensi berbasis lokasi"
        breadcrumb={[{ label: "Dashboard" }, { label: "Karyawan" }, { label: "Cabang" }]}
        actions={
          canEdit ? (
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
              Tambah Cabang
            </Button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Cabang", value: branches.length, sub: "cabang aktif", color: "text-blue-600" },
          { label: "Total Karyawan", value: totalEmployees, sub: "di semua cabang", color: "text-emerald-600" },
          { label: "GPS Aktif", value: withGps, sub: "cabang terkonfigurasi", color: "text-purple-600" },
          { label: "Tanpa GPS", value: branches.length - withGps, sub: "perlu konfigurasi", color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari cabang..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      {/* Branch list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada cabang</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((branch) => {
            const hasGps = branch.latitude != null && branch.longitude != null;
            return (
              <div
                key={branch.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {branch.code.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{branch.name}</span>
                        {branch.isMain && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium">Pusat</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{branch.code}</div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(branch)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(branch)}
                          disabled={deletingId === branch.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === branch.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1.5 mb-4">
                  {branch.city && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Globe size={12} className="flex-shrink-0" />
                      <span>{branch.city}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone size={12} className="flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users size={12} className="flex-shrink-0" />
                    <span><span className="font-semibold text-gray-700 dark:text-gray-300">{branch._count.employees}</span> karyawan</span>
                  </div>
                </div>

                {/* GPS Status */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                  hasGps
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}>
                  {hasGps ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>GPS Aktif — radius {branch.radius ?? 100} m</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} />
                      <span>GPS belum dikonfigurasi</span>
                    </>
                  )}
                </div>

                {hasGps && (
                  <div className="mt-2 text-[10px] text-gray-400 font-mono text-center">
                    {branch.latitude?.toFixed(6)}, {branch.longitude?.toFixed(6)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {editTarget ? "Edit Cabang" : "Tambah Cabang"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name & Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Nama Cabang *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="cth: Cabang Jakarta"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Kode Cabang *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="cth: JKT"
                    maxLength={10}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* City & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Kota</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="cth: Jakarta"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Telepon</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="cth: 0211234567"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Alamat</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Jl. ..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                />
              </div>

              {/* isMain */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isMain}
                  onChange={(e) => setForm((f) => ({ ...f, isMain: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Cabang Pusat</span>
              </label>

              {/* GPS section */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Konfigurasi GPS</div>
                    <div className="text-xs text-gray-400 mt-0.5">Atur titik koordinat dan radius area absensi</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                  >
                    {gettingLocation ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                    Lokasi Saat Ini
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                      placeholder="cth: -6.200000"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                      placeholder="cth: 106.816666"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">
                    Radius Area (meter) — default 100 m
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={form.radius}
                    onChange={(e) => setForm((f) => ({ ...f, radius: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Karyawan hanya bisa absen jika dalam radius ini dari titik koordinat cabang</p>
                </div>

                {(form.latitude || form.longitude) && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <MapPin size={12} />
                    <span>GPS akan aktif setelah disimpan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : (editTarget ? "Simpan Perubahan" : "Tambah Cabang")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
