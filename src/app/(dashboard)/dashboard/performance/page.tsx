"use client";

import { useState } from "react";
import { TrendingUp, Target, Star, Award, Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { formatDate } from "@/lib/utils";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const ratingLabels: Record<string, { label: string; color: string; score: number }> = {
  EXCELLENT: { label: "Sangat Baik", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20", score: 5 },
  GOOD: { label: "Baik", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", score: 4 },
  SATISFACTORY: { label: "Cukup", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20", score: 3 },
  NEEDS_IMPROVEMENT: { label: "Perlu Perbaikan", color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20", score: 2 },
  UNSATISFACTORY: { label: "Tidak Memuaskan", color: "text-red-500 bg-red-50 dark:bg-red-900/20", score: 1 },
};

const reviews = Array.from({ length: 8 }, (_, i) => ({
  id: `rev-${i}`,
  employeeName: ["Ahmad Fauzi", "Siti Rahayu", "Budi Santoso", "Dewi Lestari", "Eko Prasetyo", "Fani Kurnia", "Gita Nirmala", "Hendra Wijaya"][i],
  department: ["IT", "Marketing", "HRD", "Keuangan", "Operasional", "Design", "IT", "Finance"][i],
  period: "Q1 2026",
  rating: ["EXCELLENT", "GOOD", "SATISFACTORY", "GOOD", "EXCELLENT", "NEEDS_IMPROVEMENT", "GOOD", "EXCELLENT"][i],
  score: [95, 82, 71, 85, 97, 60, 78, 93][i],
  attendance: [96, 88, 75, 90, 100, 70, 82, 95][i],
  productivity: [94, 80, 68, 84, 96, 55, 76, 91][i],
  teamwork: [95, 85, 72, 83, 95, 62, 80, 94][i],
  reviewer: "Manajer Divisi",
  reviewDate: new Date(2026, 3, 15 + i).toISOString(),
}));

const radarData = [
  { subject: "Kehadiran", A: 96, fullMark: 100 },
  { subject: "Produktivitas", A: 94, fullMark: 100 },
  { subject: "Kerjasama", A: 95, fullMark: 100 },
  { subject: "Kepemimpinan", A: 88, fullMark: 100 },
  { subject: "Inovasi", A: 91, fullMark: 100 },
  { subject: "Ketepatan", A: 93, fullMark: 100 },
];

const kpiData = [
  { name: "Jan", target: 100, actual: 92 },
  { name: "Feb", target: 100, actual: 98 },
  { name: "Mar", target: 100, actual: 105 },
  { name: "Apr", target: 100, actual: 88 },
  { name: "Mei", target: 100, actual: 97 },
];

export default function PerformancePage() {
  const [tab, setTab] = useState<"reviews" | "kpi" | "analytics">("reviews");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Performance Management"
        subtitle="Pantau dan evaluasi kinerja karyawan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Performance" }]}
        actions={
          <Button size="sm" leftIcon={<Plus size={14} />}>
            Buat Review
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Rata-rata Score", value: `${(reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(0)}`, icon: <Star size={18} />, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
          { label: "Sangat Baik", value: reviews.filter(r => r.rating === "EXCELLENT").length, icon: <Award size={18} />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Perlu Perbaikan", value: reviews.filter(r => r.rating === "NEEDS_IMPROVEMENT").length, icon: <TrendingUp size={18} />, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
          { label: "Review Q1 2026", value: reviews.length, icon: <Target size={18} />, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
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
          { key: "reviews", label: "Penilaian" },
          { key: "kpi", label: "KPI" },
          { key: "analytics", label: "Analitik" },
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

      {tab === "reviews" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => {
            const rating = ratingLabels[rev.rating];
            return (
              <div key={rev.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {rev.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{rev.employeeName}</div>
                      <div className="text-xs text-gray-400">{rev.department} · {rev.period}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rating.color}`}>
                    {rating.label}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Score Keseluruhan</span>
                    <span className="font-bold text-gray-900 dark:text-white">{rev.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${rev.score}%`,
                        background: rev.score >= 90 ? "#10B981" : rev.score >= 75 ? "#3B82F6" : rev.score >= 60 ? "#F59E0B" : "#EF4444",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Kehadiran", value: rev.attendance },
                    { label: "Produktivitas", value: rev.productivity },
                    { label: "Kerjasama", value: rev.teamwork },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                      <div className="text-base font-bold text-gray-900 dark:text-white">{metric.value}</div>
                      <div className="text-[10px] text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="text-xs text-gray-400">Direview: {formatDate(rev.reviewDate)}</div>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={12} className={i < rating.score ? "text-[#F4B400] fill-[#F4B400]" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "kpi" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6 font-display">KPI vs Target Bulanan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="target" name="Target" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Aktual" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-display">Radar Performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="A" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-display">Distribusi Rating</h3>
            <div className="space-y-3 mt-4">
              {Object.entries(ratingLabels).map(([key, val]) => {
                const count = reviews.filter(r => r.rating === key).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{val.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB]"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
