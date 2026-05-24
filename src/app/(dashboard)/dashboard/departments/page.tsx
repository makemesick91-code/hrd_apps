"use client";

import { useState } from "react";
import { Building2, Plus, Search, Edit2, Trash2, Users, ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";

interface Department {
  id: string;
  name: string;
  code: string;
  headName: string | null;
  employeeCount: number;
  positions: string[];
  color: string;
}

const departments: Department[] = [
  { id: "1", name: "Technology", code: "TECH", headName: "Eko Prasetyo", employeeCount: 12, positions: ["Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"], color: "bg-blue-500" },
  { id: "2", name: "Human Resources", code: "HRD", headName: "Siti Rahayu", employeeCount: 6, positions: ["HR Manager", "HR Staff", "Recruiter"], color: "bg-emerald-500" },
  { id: "3", name: "Finance", code: "FIN", headName: "Ahmad Fauzi", employeeCount: 8, positions: ["Finance Manager", "Accountant", "Treasurer"], color: "bg-amber-500" },
  { id: "4", name: "Marketing", code: "MKT", headName: "Gita Nirmala", employeeCount: 9, positions: ["Marketing Manager", "Designer", "Content Writer", "SEO Specialist"], color: "bg-purple-500" },
  { id: "5", name: "Operations", code: "OPS", headName: "Budi Santoso", employeeCount: 15, positions: ["Operations Manager", "Supervisor", "Staff"], color: "bg-orange-500" },
];

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = departments.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Departemen"
        subtitle="Kelola struktur departemen dan posisi perusahaan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Karyawan" }, { label: "Departemen" }]}
        actions={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)}>
            Tambah Departemen
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Departemen", value: departments.length, sub: "aktif", color: "text-blue-600" },
          { label: "Total Karyawan", value: totalEmployees, sub: "di semua dept.", color: "text-emerald-600" },
          { label: "Total Posisi", value: departments.reduce((s, d) => s + d.positions.length, 0), sub: "jabatan", color: "text-purple-600" },
          { label: "Rata-rata/Dept.", value: Math.round(totalEmployees / departments.length), sub: "karyawan", color: "text-amber-600" },
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
          placeholder="Cari departemen..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          <div key={dept.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${dept.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {dept.code.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{dept.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{dept.code}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{dept.employeeCount}</span> karyawan
              </span>
              {dept.headName && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <span className="text-xs text-gray-400 truncate">Kepala: {dept.headName}</span>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Kapasitas</span>
                <span>{dept.employeeCount}/20</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${dept.color} rounded-full transition-all`}
                  style={{ width: `${(dept.employeeCount / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* Positions */}
            <div>
              <div className="text-xs font-medium text-gray-400 mb-2">Posisi ({dept.positions.length})</div>
              <div className="flex flex-wrap gap-1">
                {dept.positions.slice(0, 3).map((pos) => (
                  <span key={pos} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {pos}
                  </span>
                ))}
                {dept.positions.length > 3 && (
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                    +{dept.positions.length - 3} lainnya
                  </span>
                )}
              </div>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium py-2 border border-dashed border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
              Lihat Detail <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tambah Departemen</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Nama Departemen</label>
                <input
                  type="text"
                  placeholder="cth: Engineering"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Kode Departemen</label>
                <input
                  type="text"
                  placeholder="cth: ENG"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Kepala Departemen</label>
                <select className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                  <option value="">Pilih Kepala Departemen</option>
                  <option>Ahmad Fauzi</option>
                  <option>Siti Rahayu</option>
                  <option>Budi Santoso</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                <Button className="flex-1" onClick={() => setShowModal(false)}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
