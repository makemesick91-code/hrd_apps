"use client";

import { useState } from "react";
import { FileText, Upload, Download, Eye, Trash2, Search, Filter, Folder } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { formatDate, formatFileSize } from "@/lib/utils";

const categories = [
  { key: "ALL", label: "Semua", count: 24 },
  { key: "CONTRACT", label: "Kontrak", count: 8 },
  { key: "KTP", label: "KTP", count: 5 },
  { key: "CERTIFICATE", label: "Sertifikat", count: 6 },
  { key: "BPJS", label: "BPJS", count: 3 },
  { key: "OTHER", label: "Lainnya", count: 2 },
];

const documents = Array.from({ length: 12 }, (_, i) => ({
  id: `doc-${i}`,
  name: ["Kontrak Kerja Ahmad Fauzi.pdf", "KTP Siti Rahayu.jpg", "Ijazah S1 Budi.pdf", "Sertifikat AWS Eko.pdf", "BPJS Kesehatan Dewi.pdf", "Slip Gaji Mei 2026.pdf", "SK Pengangkatan Fani.pdf", "Perjanjian NDA.pdf", "Sertifikat ISO.pdf", "Kontrak Baru Gita.pdf", "Akta Perusahaan.pdf", "NPWP Hendra.jpg"][i],
  category: ["CONTRACT", "KTP", "CERTIFICATE", "CERTIFICATE", "BPJS", "OTHER", "CONTRACT", "OTHER", "CERTIFICATE", "CONTRACT", "OTHER", "KTP"][i],
  employeeName: ["Ahmad Fauzi", "Siti Rahayu", "Budi Santoso", "Eko Prasetyo", "Dewi Lestari", null, "Fani Kurnia", null, null, "Gita Nirmala", null, "Hendra"][i],
  fileSize: [204800, 512000, 1048576, 307200, 153600, 204800, 256000, 512000, 1024000, 307200, 2097152, 204800][i],
  fileType: ["pdf", "jpg", "pdf", "pdf", "pdf", "pdf", "pdf", "pdf", "pdf", "pdf", "pdf", "jpg"][i],
  uploadedAt: new Date(2026, 3 + (i % 2), 1 + i).toISOString(),
  expiryDate: i % 3 === 0 ? new Date(2027, i % 12, 15).toISOString() : null,
}));

const categoryColors: Record<string, string> = {
  CONTRACT: "bg-blue-100 text-blue-700",
  KTP: "bg-emerald-100 text-emerald-700",
  CERTIFICATE: "bg-purple-100 text-purple-700",
  BPJS: "bg-amber-100 text-amber-700",
  OTHER: "bg-gray-100 text-gray-600",
  NPWP: "bg-orange-100 text-orange-700",
};

const categoryLabels: Record<string, string> = {
  CONTRACT: "Kontrak",
  KTP: "KTP",
  CERTIFICATE: "Sertifikat",
  BPJS: "BPJS",
  OTHER: "Lainnya",
  NPWP: "NPWP",
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filtered = documents.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "ALL" || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dokumen"
        subtitle="Kelola dokumen karyawan dan perusahaan"
        breadcrumb={[{ label: "Dashboard" }, { label: "Dokumen" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Upload size={14} />}>Upload</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar categories */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Kategori</h3>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder size={16} />
                  {cat.label}
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.key ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents list */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dokumen..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.fileType === "pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doc.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[doc.category]}`}>
                        {categoryLabels[doc.category]}
                      </span>
                      {doc.employeeName && (
                        <span className="text-xs text-gray-400">{doc.employeeName}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                      <span className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">
                      <Download size={14} />
                    </button>
                    <button className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-3">📂</div>
                  <div className="text-sm text-gray-400">Tidak ada dokumen ditemukan</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
