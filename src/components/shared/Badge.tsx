import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold" | "navy";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  gold: "bg-[#F4B400]/15 text-[#B45309] dark:text-[#F4B400]",
  navy: "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:text-blue-400",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    ACTIVE: { label: "Aktif", variant: "success" },
    INACTIVE: { label: "Tidak Aktif", variant: "default" },
    TERMINATED: { label: "Diberhentikan", variant: "danger" },
    RESIGNED: { label: "Resign", variant: "warning" },
    ON_LEAVE: { label: "Cuti", variant: "info" },
    PROBATION: { label: "Probasi", variant: "gold" },
    PRESENT: { label: "Hadir", variant: "success" },
    ABSENT: { label: "Absen", variant: "danger" },
    LATE: { label: "Terlambat", variant: "warning" },
    EARLY_LEAVE: { label: "Pulang Awal", variant: "warning" },
    WORK_FROM_HOME: { label: "WFH", variant: "info" },
    HOLIDAY: { label: "Hari Libur", variant: "default" },
    PENDING: { label: "Menunggu", variant: "warning" },
    APPROVED: { label: "Disetujui", variant: "success" },
    REJECTED: { label: "Ditolak", variant: "danger" },
    CANCELLED: { label: "Dibatalkan", variant: "default" },
    DRAFT: { label: "Draft", variant: "default" },
    PENDING_APPROVAL: { label: "Menunggu Persetujuan", variant: "warning" },
    PAID: { label: "Dibayar", variant: "success" },
    OPEN: { label: "Buka", variant: "success" },
    CLOSED: { label: "Tutup", variant: "default" },
    ON_HOLD: { label: "Ditahan", variant: "warning" },
    PERMANENT: { label: "Tetap", variant: "navy" },
    CONTRACT: { label: "Kontrak", variant: "gold" },
    INTERNSHIP: { label: "Magang", variant: "info" },
  };

  const config = map[status] || { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
