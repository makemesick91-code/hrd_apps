"use client";

import { useState } from "react";
import { Briefcase, Plus, Users, Eye, Edit, Star, Filter, Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { formatDate } from "@/lib/utils";

const jobs = Array.from({ length: 8 }, (_, i) => ({
  id: `job-${i}`,
  title: ["Senior Frontend Engineer", "Product Manager", "UI/UX Designer", "Backend Developer", "Data Analyst", "Marketing Manager", "DevOps Engineer", "QA Engineer"][i],
  department: ["IT", "Product", "Design", "IT", "Data", "Marketing", "IT", "QA"][i],
  type: ["PERMANENT", "CONTRACT", "PERMANENT", "PERMANENT", "CONTRACT", "PERMANENT", "PERMANENT", "CONTRACT"][i],
  location: ["Jakarta", "Remote", "Bandung", "Jakarta", "Remote", "Surabaya", "Jakarta", "Remote"][i],
  quota: [3, 1, 2, 4, 2, 1, 2, 3][i],
  filled: [1, 0, 1, 2, 0, 0, 1, 1][i],
  applicants: [24, 12, 18, 35, 15, 8, 20, 16][i],
  status: ["OPEN", "OPEN", "OPEN", "ON_HOLD", "OPEN", "CLOSED", "OPEN", "OPEN"][i],
  deadline: new Date(2026, 5 + (i % 2), 15 + i).toISOString(),
  salaryMin: 8000000 + i * 2000000,
  salaryMax: 15000000 + i * 3000000,
}));

const applicants = Array.from({ length: 10 }, (_, i) => ({
  id: `app-${i}`,
  name: ["Rizki Pratama", "Anisa Dewi", "Fajar Nugroho", "Sinta Cahyani", "Kevin Halim", "Ratna Sari", "Denny Kusuma", "Lia Permata", "Andi Wijaya", "Nita Rahayu"][i],
  email: `applicant${i + 1}@email.com`,
  phone: `08${String(10000000000 + i * 123456789).slice(-10)}`,
  jobTitle: jobs[i % jobs.length].title,
  status: ["APPLIED", "SCREENING", "INTERVIEW_1", "INTERVIEW_2", "OFFERING", "ACCEPTED", "REJECTED", "APPLIED", "SCREENING", "INTERVIEW_1"][i],
  expectedSalary: 7000000 + i * 1500000,
  rating: [null, 3, 4, 5, 4, 5, 2, null, 3, 4][i],
  appliedAt: new Date(2026, 4, 10 + i).toISOString(),
}));

const statusColors: Record<string, string> = {
  APPLIED: "bg-gray-100 text-gray-600",
  SCREENING: "bg-blue-100 text-blue-700",
  INTERVIEW_1: "bg-amber-100 text-amber-700",
  INTERVIEW_2: "bg-purple-100 text-purple-700",
  OFFERING: "bg-emerald-100 text-emerald-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PSYCHOTEST: "bg-pink-100 text-pink-700",
};

const statusLabels: Record<string, string> = {
  APPLIED: "Melamar",
  SCREENING: "Screening",
  INTERVIEW_1: "Interview 1",
  INTERVIEW_2: "Interview 2",
  OFFERING: "Penawaran",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  PSYCHOTEST: "Psikotes",
};

export default function RecruitmentPage() {
  const [tab, setTab] = useState<"jobs" | "applicants" | "pipeline">("jobs");
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rekrutmen"
        subtitle="Kelola lowongan pekerjaan dan pelamar"
        breadcrumb={[{ label: "Dashboard" }, { label: "Rekrutmen" }]}
        actions={
          <Button size="sm" leftIcon={<Plus size={14} />}>
            Buka Lowongan
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Lowongan Aktif", value: jobs.filter(j => j.status === "OPEN").length, icon: <Briefcase size={18} />, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Total Pelamar", value: jobs.reduce((s, j) => s + j.applicants, 0), icon: <Users size={18} />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Diterima Bulan Ini", value: 5, icon: <Star size={18} />, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
          { label: "Posisi Terpenuhi", value: jobs.reduce((s, j) => s + j.filled, 0), icon: <Briefcase size={18} />, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
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
          { key: "jobs", label: "Lowongan" },
          { key: "applicants", label: "Pelamar" },
          { key: "pipeline", label: "Pipeline" },
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

      {tab === "jobs" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari lowongan..."
              className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white w-full max-w-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{job.department}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{job.location}</span>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} />
                    <span>{job.applicants} pelamar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={12} />
                    <span>{job.filled}/{job.quota} terpenuhi</span>
                  </div>
                  <div>Deadline: {formatDate(job.deadline)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Rentang Gaji</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Rp {(job.salaryMin / 1000000).toFixed(0)}-{(job.salaryMax / 1000000).toFixed(0)}Jt
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "applicants" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {["Pelamar", "Posisi", "Ekspektasi Gaji", "Rating", "Status", "Tanggal Daftar", "Aksi"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F4B400] to-[#FBBF24] rounded-full flex items-center justify-center text-[#1E3A8A] text-xs font-bold">
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{app.name}</div>
                          <div className="text-xs text-gray-400">{app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{app.jobTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Rp {(app.expectedSalary / 1000000).toFixed(0)}Jt
                    </td>
                    <td className="px-4 py-3">
                      {app.rating ? (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={12} className={i < app.rating! ? "text-[#F4B400] fill-[#F4B400]" : "text-gray-300"} />
                          ))}
                        </div>
                      ) : <span className="text-xs text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[app.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(app.appliedAt)}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "pipeline" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(statusLabels).map(([status, label]) => {
            const count = applicants.filter(a => a.status === status).length;
            return (
              <div key={status} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className={`text-xs font-semibold px-2 py-1 rounded-lg mb-3 w-fit ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
                  {label}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white font-display">{count}</div>
                <div className="text-xs text-gray-400">pelamar</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
