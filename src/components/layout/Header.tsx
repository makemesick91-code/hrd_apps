"use client";

import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { Bell, Search, Moon, Sun, Menu, ChevronDown, Settings, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function Header() {
  const { sidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "Pengajuan cuti baru", message: "Ahmad mengajukan cuti tahunan", time: "5 mnt lalu", unread: true },
    { id: 2, title: "Payroll bulan ini", message: "Payroll Mei 2026 siap diproses", time: "1 jam lalu", unread: true },
    { id: 3, title: "Karyawan baru bergabung", message: "Siti Rahayu bergabung di divisi IT", time: "2 jam lalu", unread: false },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-40 flex items-center gap-4 px-6 transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[280px]"
      )}
    >
      {/* Breadcrumb placeholder */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">
          Selamat datang kembali,{" "}
          <span className="text-gray-900 dark:text-white">
            {user?.employee?.fullName?.split(" ")[0] || "Admin"}
          </span>{" "}
          👋
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Cari karyawan, laporan..."
              className="w-64 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Search size={20} />
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F4B400] rounded-full"></span>
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
              <span className="bg-[#F4B400] text-[#1E3A8A] text-xs font-bold px-2 py-0.5 rounded-full">
                {notifications.filter(n => n.unread).length}
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors",
                    notif.unread && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                >
                  <div className="flex gap-3">
                    {notif.unread && (
                      <div className="w-2 h-2 bg-[#F4B400] rounded-full mt-2 flex-shrink-0"></div>
                    )}
                    <div className={cn(!notif.unread && "ml-5")}>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/dashboard/notifications"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                onClick={() => setNotifOpen(false)}
              >
                Lihat semua notifikasi
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {user?.employee?.fullName?.split(" ")[0] || "Admin"}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{user?.role}</div>
          </div>
          <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-100 dark:border-gray-800 z-50 overflow-hidden py-2">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.employee?.fullName || user?.email}
              </div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <User size={16} />
              Profil Saya
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <Settings size={16} />
              Pengaturan
            </Link>
            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
