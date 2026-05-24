"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, Users, Clock, DollarSign, Calendar, Briefcase,
  TrendingUp, FileText, Bell, Settings, ChevronLeft, ChevronRight,
  Building2, Shield, UserPlus, BarChart3, LogOut, ChevronDown, MapPin,
} from "lucide-react";
import { useState } from "react";
import { Role } from "@/types";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: Role[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Karyawan",
    icon: <Users size={20} />,
    roles: ["SUPER_ADMIN", "HRD", "MANAGER"],
    children: [
      { label: "Daftar Karyawan", href: "/dashboard/employees", icon: <Users size={18} /> },
      { label: "Tambah Karyawan", href: "/dashboard/employees/new", icon: <UserPlus size={18} /> },
      { label: "Departemen", href: "/dashboard/departments", icon: <Building2 size={18} /> },
      { label: "Cabang", href: "/dashboard/branches", icon: <MapPin size={18} />, roles: ["SUPER_ADMIN", "HRD"] as Role[] },
    ],
  },
  {
    label: "Absensi",
    href: "/dashboard/attendance",
    icon: <Clock size={20} />,
  },
  {
    label: "Payroll",
    icon: <DollarSign size={20} />,
    roles: ["SUPER_ADMIN", "HRD"],
    children: [
      { label: "Kelola Payroll", href: "/dashboard/payroll", icon: <DollarSign size={18} /> },
      { label: "Slip Gaji", href: "/dashboard/payroll/slips", icon: <FileText size={18} /> },
    ],
  },
  {
    label: "Cuti & Izin",
    href: "/dashboard/leave",
    icon: <Calendar size={20} />,
  },
  {
    label: "Rekrutmen",
    href: "/dashboard/recruitment",
    icon: <Briefcase size={20} />,
    roles: ["SUPER_ADMIN", "HRD", "MANAGER"],
  },
  {
    label: "Performance",
    href: "/dashboard/performance",
    icon: <TrendingUp size={20} />,
  },
  {
    label: "Laporan",
    href: "/dashboard/reports",
    icon: <BarChart3 size={20} />,
    roles: ["SUPER_ADMIN", "HRD"],
  },
  {
    label: "Notifikasi",
    href: "/dashboard/notifications",
    icon: <Bell size={20} />,
  },
  {
    label: "Keamanan",
    href: "/dashboard/audit",
    icon: <Shield size={20} />,
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: <Settings size={20} />,
    roles: ["SUPER_ADMIN", "HRD"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<string[]>(["Karyawan"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as Role)
  );

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-gray-100 dark:border-gray-800">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md">
          <span className="text-[#F4B400] font-bold text-lg">D</span>
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight font-display">
              Daengtisia
            </div>
            <div className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              HR Suite
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          if (item.children) {
            const isOpen = openMenus.includes(item.label);
            const hasActiveChild = item.children.some((c) => isActive(c.href));

            return (
              <div key={item.label}>
                <button
                  onClick={() => !sidebarCollapsed && toggleMenu(item.label)}
                  className={cn(
                    "sidebar-link w-full",
                    hasActiveChild && "text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>

                {!sidebarCollapsed && isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.filter((c) => !c.roles || c.roles.includes(user?.role as Role)).map((child) => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={cn(
                          "sidebar-link",
                          isActive(child.href) && "active"
                        )}
                      >
                        <span className="flex-shrink-0">{child.icon}</span>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "sidebar-link",
                isActive(item.href) && "active"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#F4B400] text-[#1E3A8A] text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.employee?.fullName || user?.email}
              </div>
              <div className="text-xs text-gray-400 truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={12} className="text-gray-600" />
        ) : (
          <ChevronLeft size={12} className="text-gray-600" />
        )}
      </button>
    </aside>
  );
}
