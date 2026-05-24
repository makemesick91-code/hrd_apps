import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalEmployees,
      activeEmployees,
      newHires,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      pendingLeaves,
      pendingPayrolls,
      openRecruitments,
      totalApplicants,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employmentStatus: "ACTIVE" } }),
      prisma.employee.count({ where: { joinDate: { gte: firstDayOfMonth } } }),
      prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
      prisma.attendance.count({ where: { date: today, status: "ABSENT" } }),
      prisma.attendance.count({ where: { date: today, status: "LATE" } }),
      prisma.attendance.count({ where: { date: today, status: "PERMISSION" } }),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.payroll.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.recruitment.count({ where: { status: "OPEN" } }),
      prisma.applicant.count(),
    ]);

    const stats = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      newHires,
      turnoverRate: totalEmployees > 0 ? ((totalEmployees - activeEmployees) / totalEmployees * 100).toFixed(1) : 0,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      attendanceRate: activeEmployees > 0 ? ((presentToday / activeEmployees) * 100).toFixed(1) : 0,
      pendingLeaves,
      pendingPayrolls,
      openRecruitments,
      totalApplicants,
    };

    return apiResponse(stats, "Dashboard stats retrieved");
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return apiError("Terjadi kesalahan server", 500);
  }
}
