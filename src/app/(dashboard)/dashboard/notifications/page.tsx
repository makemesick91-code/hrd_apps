"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2, Calendar, DollarSign, Users } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/shared/Button";
import { formatRelativeTime } from "@/lib/utils";

type NotifType = "INFO" | "SUCCESS" | "WARNING" | "LEAVE" | "PAYROLL" | "ATTENDANCE" | "RECRUITMENT";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const mockNotifications: Notification[] = [
  { id: "1", type: "LEAVE", title: "Pengajuan Cuti Disetujui", message: "Cuti tahunan Anda tanggal 20-22 Mei 2026 telah disetujui oleh HRD.", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), link: "/dashboard/leave" },
  { id: "2", type: "PAYROLL", title: "Slip Gaji Mei 2026 Tersedia", message: "Slip gaji bulan Mei 2026 sudah dapat diunduh. Gaji telah ditransfer ke rekening Anda.", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), link: "/dashboard/payroll" },
  { id: "3", type: "WARNING", title: "Absensi Tidak Tercatat", message: "Absensi masuk Anda pada 15 Mei 2026 tidak tercatat. Harap konfirmasi ke HRD.", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), link: "/dashboard/attendance" },
  { id: "4", type: "RECRUITMENT", title: "Kandidat Baru - Frontend Developer", message: "Ada 3 kandidat baru yang melamar posisi Frontend Developer. Segera lakukan review.", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), link: "/dashboard/recruitment" },
  { id: "5", type: "SUCCESS", title: "Profil Berhasil Diperbarui", message: "Data profil Anda telah berhasil diperbarui pada 12 Mei 2026.", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: "6", type: "INFO", title: "Pengumuman: Libur Nasional", message: "Sehubungan dengan Hari Raya Idul Adha, perusahaan libur pada tanggal 7 Juni 2026.", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  { id: "7", type: "ATTENDANCE", title: "Reminder: Absensi Belum Dilakukan", message: "Anda belum melakukan absensi masuk hari ini. Harap segera check-in.", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), link: "/dashboard/attendance" },
  { id: "8", type: "LEAVE", title: "Pengajuan Cuti Menunggu Persetujuan", message: "Budi Santoso mengajukan cuti sakit selama 2 hari. Segera proses persetujuan.", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), link: "/dashboard/leave" },
];

const typeConfig: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  INFO: { icon: <Info size={18} />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  SUCCESS: { icon: <CheckCircle2 size={18} />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  WARNING: { icon: <AlertTriangle size={18} />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  LEAVE: { icon: <Calendar size={18} />, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  PAYROLL: { icon: <DollarSign size={18} />, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  ATTENDANCE: { icon: <CheckCheck size={18} />, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  RECRUITMENT: { icon: <Users size={18} />, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifikasi"
        subtitle="Pusat pemberitahuan dan aktivitas terbaru"
        breadcrumb={[{ label: "Dashboard" }, { label: "Notifikasi" }]}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>
              Tandai Semua Dibaca
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3">
        {["all", "unread"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as "all" | "unread")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-[#1E3A8A] text-white"
                : "bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-blue-300"
            }`}
          >
            {f === "all" ? "Semua" : `Belum Dibaca`}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Bell size={40} className="mx-auto text-gray-300 mb-3" />
            <div className="text-sm text-gray-400">Tidak ada notifikasi</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((notif) => {
              const config = typeConfig[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notif.isRead ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => markRead(notif.id)} role="button">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {notif.title}
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
