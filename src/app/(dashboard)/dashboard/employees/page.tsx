"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search, Plus, Download, Upload, Eye, Edit, Trash2,
  UserCheck, UserX, Mail, Phone, Building2, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  photo?: string;
  employmentStatus: string;
  contractType: string;
  joinDate: string;
  basicSalary: number;
  department?: { id: string; name: string };
  position?: { id: string; name: string };
  branch?: { id: string; name: string };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const limit = 10;

  const fetchEmployees = useCallback(async (s = search, status = statusFilter, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (s) params.set("search", s);
      if (status) params.set("status", status);
      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data?.data || []);
        setTotal(data.data?.total ?? 0);
        setTotalPages(data.data?.totalPages ?? 1);
      }
    } catch {
      toast.error("Gagal memuat data karyawan");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchEmployees(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    fetchEmployees(val, statusFilter, 1);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    fetchEmployees(search, val, 1);
  };

  const handlePage = (p: number) => {
    setPage(p);
    fetchEmployees(search, statusFilter, p);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus karyawan ${name}?`)) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Karyawan berhasil dihapus");
        fetchEmployees();
      } else {
        toast.error(data.message || "Gagal menghapus karyawan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const activeCount   = employees.filter(e => e.employmentStatus === "ACTIVE").length;
  const probationCount = employees.filter(e => e.employmentStatus === "PROBATION").length;
  const inactiveCount = employees.filter(e => e.employmentStatus === "INACTIVE").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Manajemen Karyawan"
        subtitle={`${total} karyawan terdaftar`}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Karyawan" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Upload size={14} />}>Import</Button>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>Export</Button>
            <Link href="/dashboard/employees/new">
              <Button size="sm" leftIcon={<Plus size={14} />}>Tambah Karyawan</Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, icon: <UserCheck size={16} />, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
          { label: "Aktif", value: activeCount, icon: <UserCheck size={16} />, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
          { label: "Probasi", value: probationCount, icon: <UserX size={16} />, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
          { label: "Tidak Aktif", value: inactiveCount, icon: <UserX size={16} />, color: "bg-gray-50 dark:bg-gray-800 text-gray-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari karyawan, ID, email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Tidak Aktif</option>
          <option value="PROBATION">Probasi</option>
          <option value="TERMINATED">Diberhentikan</option>
          <option value="RESIGNED">Resign</option>
        </select>
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
          >Tabel</button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"}`}
          >Grid</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Memuat data karyawan...
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 text-center">
          <div className="text-gray-400 text-sm">Tidak ada karyawan ditemukan</div>
          <Link href="/dashboard/employees/new">
            <button className="mt-3 text-xs text-[#1E3A8A] hover:underline flex items-center gap-1 mx-auto">
              <Plus size={12} /> Tambah karyawan
            </button>
          </Link>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Divisi / Jabatan</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kontak</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Bergabung</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Gaji Pokok</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {employee.photo
                            ? <img src={employee.photo} alt={employee.fullName} className="w-10 h-10 rounded-full object-cover" />
                            : getInitials(employee.fullName)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{employee.fullName}</div>
                          <div className="text-xs text-gray-400">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{employee.department?.name || "-"}</div>
                      <div className="text-xs text-gray-400">{employee.position?.name || "-"}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Mail size={12} /> {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Phone size={12} /> {employee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(employee.joinDate)}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={employee.employmentStatus} /></td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(employee.basicSalary)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          <button className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors" title="Lihat detail">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <Link href={`/dashboard/employees/${employee.id}/edit`}>
                          <button className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition-colors" title="Edit karyawan">
                            <Edit size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(employee.id, employee.fullName)}
                          className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                          title="Hapus karyawan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total {total} karyawan · Halaman {page} dari {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{page} / {totalPages}</span>
              <button
                onClick={() => handlePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(employee.fullName)}
                </div>
                <StatusBadge status={employee.employmentStatus} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{employee.fullName}</h3>
              <div className="text-xs text-gray-400 mt-0.5">{employee.employeeId}</div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Building2 size={12} className="text-[#1E3A8A]" />
                  {employee.department?.name || "-"} · {employee.position?.name || "-"}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Mail size={12} className="text-[#1E3A8A]" />
                  {employee.email}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                <div>
                  <div className="text-xs text-gray-400">Gaji Pokok</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(employee.basicSalary)}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/employees/${employee.id}`}>
                    <button className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                    </button>
                  </Link>
                  <Link href={`/dashboard/employees/${employee.id}/edit`}>
                    <button className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                      <Edit size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
