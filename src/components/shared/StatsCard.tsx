"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "gold" | "navy" | "success" | "danger";
  className?: string;
}

const variants = {
  default: {
    bg: "bg-white dark:bg-gray-900",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  gold: {
    bg: "bg-gradient-to-br from-[#F4B400] to-[#FBBF24]",
    iconBg: "bg-white/20",
    iconColor: "text-white",
  },
  navy: {
    bg: "bg-gradient-to-br from-[#1E3A8A] to-[#2563EB]",
    iconBg: "bg-white/15",
    iconColor: "text-white",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-500 to-green-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
  },
  danger: {
    bg: "bg-gradient-to-br from-red-500 to-rose-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  variant = "default",
  className,
}: StatsCardProps) {
  const isColored = variant !== "default";
  const v = variants[variant];

  return (
    <div
      className={cn(
        "rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        variant === "default"
          ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-card"
          : `${v.bg} border-transparent shadow-md`,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", v.iconBg)}>
          <div className={v.iconColor}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isColored
                ? "bg-white/20 text-white"
                : trend >= 0
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <div
          className={cn(
            "text-3xl font-bold font-display",
            isColored ? "text-white" : "text-gray-900 dark:text-white"
          )}
        >
          {value}
        </div>
        <div
          className={cn(
            "text-sm font-medium mt-1",
            isColored ? "text-white/80" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {title}
        </div>
        {(subtitle || trendLabel) && (
          <div
            className={cn(
              "text-xs mt-1",
              isColored ? "text-white/60" : "text-gray-400 dark:text-gray-500"
            )}
          >
            {trendLabel || subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
