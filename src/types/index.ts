import {
  Role,
  Gender,
  EmploymentStatus,
  ContractType,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  PayrollStatus,
  RecruitmentStatus,
  ApplicantStatus,
  NotificationType,
  PerformanceRating,
} from "@prisma/client";

export type {
  Role,
  Gender,
  EmploymentStatus,
  ContractType,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  PayrollStatus,
  RecruitmentStatus,
  ApplicantStatus,
  NotificationType,
  PerformanceRating,
};

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  employee?: {
    id: string;
    employeeId: string;
    fullName: string;
    photo?: string | null;
    departmentId?: string | null;
    positionId?: string | null;
  } | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  turnoverRate: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  pendingLeaves: number;
  pendingPayrolls: number;
  openRecruitments: number;
  totalApplicants: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AttendanceChartData {
  date: string;
  present: number;
  absent: number;
  late: number;
  wfh: number;
}

export interface PayrollChartData {
  month: string;
  total: number;
  basic: number;
  bonus: number;
  deductions: number;
}

export interface EmployeeFilter {
  search?: string;
  departmentId?: string;
  positionId?: string;
  employmentStatus?: EmploymentStatus;
  contractType?: ContractType;
  branchId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AttendanceFilter {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface PayrollFilter {
  year?: number;
  month?: number;
  status?: PayrollStatus;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface LeaveFilter {
  employeeId?: string;
  leaveType?: LeaveType;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: SidebarItem[];
  roles?: Role[];
}
