import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create Company
  const company = await prisma.company.upsert({
    where: { id: "company-1" },
    update: {},
    create: {
      id: "company-1",
      name: "Daengtisia Corporation",
      legalName: "PT Daengtisia Teknologi Indonesia",
      email: "info@daengtisia.com",
      phone: "+62 21 1234 5678",
      address: "Jl. Jend. Sudirman Kav. 52-53, Jakarta Pusat",
      city: "Jakarta",
      province: "DKI Jakarta",
      country: "Indonesia",
      website: "https://daengtisia.com",
      industry: "Teknologi Informasi",
      description: "Perusahaan teknologi terdepan dalam solusi HR enterprise di Indonesia",
    },
  });

  // Create Branch
  const branch = await prisma.branch.upsert({
    where: { id: "branch-1" },
    update: {},
    create: {
      id: "branch-1",
      companyId: company.id,
      name: "Kantor Pusat Jakarta",
      code: "JKT-01",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      city: "Jakarta",
      isMain: true,
    },
  });

  // Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({ where: { code: "IT" }, update: {}, create: { name: "Teknologi Informasi", code: "IT", description: "Divisi pengembangan teknologi" } }),
    prisma.department.upsert({ where: { code: "MKT" }, update: {}, create: { name: "Marketing", code: "MKT", description: "Divisi pemasaran dan komunikasi" } }),
    prisma.department.upsert({ where: { code: "FIN" }, update: {}, create: { name: "Keuangan", code: "FIN", description: "Divisi keuangan dan akuntansi" } }),
    prisma.department.upsert({ where: { code: "HRD" }, update: {}, create: { name: "Human Resources", code: "HRD", description: "Divisi sumber daya manusia" } }),
    prisma.department.upsert({ where: { code: "OPS" }, update: {}, create: { name: "Operasional", code: "OPS", description: "Divisi operasional perusahaan" } }),
  ]);

  // Create Positions
  const positions = await Promise.all([
    prisma.position.upsert({ where: { code: "SWE-SR" }, update: {}, create: { departmentId: departments[0].id, name: "Senior Software Engineer", code: "SWE-SR", level: 4, minSalary: 15000000, maxSalary: 30000000 } }),
    prisma.position.upsert({ where: { code: "SWE-JR" }, update: {}, create: { departmentId: departments[0].id, name: "Junior Software Engineer", code: "SWE-JR", level: 2, minSalary: 6000000, maxSalary: 12000000 } }),
    prisma.position.upsert({ where: { code: "MGR-IT" }, update: {}, create: { departmentId: departments[0].id, name: "IT Manager", code: "MGR-IT", level: 5, minSalary: 20000000, maxSalary: 40000000 } }),
    prisma.position.upsert({ where: { code: "MKT-MGR" }, update: {}, create: { departmentId: departments[1].id, name: "Marketing Manager", code: "MKT-MGR", level: 5, minSalary: 18000000, maxSalary: 35000000 } }),
    prisma.position.upsert({ where: { code: "HRD-MGR" }, update: {}, create: { departmentId: departments[3].id, name: "HRD Manager", code: "HRD-MGR", level: 5, minSalary: 15000000, maxSalary: 30000000 } }),
    prisma.position.upsert({ where: { code: "CFO" }, update: {}, create: { departmentId: departments[2].id, name: "Chief Financial Officer", code: "CFO", level: 7, minSalary: 50000000, maxSalary: 100000000 } }),
  ]);

  // Create Users & Employees
  const usersData = [
    { email: "admin@daengtisia.com", password: "admin123456", role: "SUPER_ADMIN" as const, firstName: "Super", lastName: "Admin", empId: "EMP260001", gender: "MALE" as const, dept: departments[3].id, pos: positions[4].id, salary: 25000000 },
    { email: "hrd@daengtisia.com", password: "hrd123456", role: "HRD" as const, firstName: "Rina", lastName: "Pratiwi", empId: "EMP260002", gender: "FEMALE" as const, dept: departments[3].id, pos: positions[4].id, salary: 15000000 },
    { email: "manager@daengtisia.com", password: "manager123456", role: "MANAGER" as const, firstName: "Budi", lastName: "Hartono", empId: "EMP260003", gender: "MALE" as const, dept: departments[0].id, pos: positions[2].id, salary: 20000000 },
    { email: "ahmad@daengtisia.com", password: "emp123456", role: "EMPLOYEE" as const, firstName: "Ahmad", lastName: "Fauzi", empId: "EMP260004", gender: "MALE" as const, dept: departments[0].id, pos: positions[0].id, salary: 18000000 },
    { email: "siti@daengtisia.com", password: "emp123456", role: "EMPLOYEE" as const, firstName: "Siti", lastName: "Rahayu", empId: "EMP260005", gender: "FEMALE" as const, dept: departments[1].id, pos: positions[3].id, salary: 14000000 },
  ];

  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
        isVerified: true,
      },
    });

    await prisma.employee.upsert({
      where: { employeeId: userData.empId },
      update: {},
      create: {
        userId: user.id,
        employeeId: userData.empId,
        branchId: branch.id,
        departmentId: userData.dept,
        positionId: userData.pos,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        gender: userData.gender,
        joinDate: new Date("2023-01-15"),
        contractType: "PERMANENT",
        employmentStatus: "ACTIVE",
        basicSalary: userData.salary,
        bankName: "BCA",
        bankAccount: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      },
    });
  }

  // Create Leave Policies
  const leavePolicies = [
    { leaveType: "ANNUAL" as const, daysPerYear: 12, canCarryOver: true, maxCarryOver: 5 },
    { leaveType: "SICK" as const, daysPerYear: 10, canCarryOver: false, maxCarryOver: 0 },
    { leaveType: "EMERGENCY" as const, daysPerYear: 3, canCarryOver: false, maxCarryOver: 0 },
    { leaveType: "MATERNITY" as const, daysPerYear: 90, canCarryOver: false, maxCarryOver: 0 },
    { leaveType: "PATERNITY" as const, daysPerYear: 5, canCarryOver: false, maxCarryOver: 0 },
    { leaveType: "PERMISSION" as const, daysPerYear: 5, canCarryOver: false, maxCarryOver: 0 },
  ];

  for (const policy of leavePolicies) {
    await prisma.leavePolicy.upsert({
      where: { leaveType: policy.leaveType },
      update: {},
      create: policy,
    });
  }

  // Create Shifts
  await prisma.shift.upsert({
    where: { code: "SHIFT-A" },
    update: {},
    create: {
      name: "Shift Pagi",
      code: "SHIFT-A",
      startTime: "08:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      workDays: [1, 2, 3, 4, 5],
    },
  });

  // Create Holidays
  const holidays = [
    { name: "Tahun Baru 2026", date: new Date("2026-01-01") },
    { name: "Hari Raya Idul Fitri", date: new Date("2026-03-30") },
    { name: "Hari Kemerdekaan RI", date: new Date("2026-08-17") },
    { name: "Hari Natal", date: new Date("2026-12-25") },
  ];

  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: { id: holiday.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: holiday.name.toLowerCase().replace(/\s+/g, "-"),
        name: holiday.name,
        date: holiday.date,
        isNational: true,
      },
    });
  }

  // Create Announcement
  await prisma.announcement.create({
    data: {
      companyId: company.id,
      title: "Selamat Datang di Daengtisia HR Suite!",
      content: "Platform HR enterprise baru kami telah resmi diluncurkan. Nikmati fitur-fitur canggih untuk pengelolaan SDM yang lebih efisien.",
      isPinned: true,
      isPublic: true,
      publishedAt: new Date(),
    },
  });

  console.log("✅ Seeding completed!");
  console.log("");
  console.log("📧 Demo Credentials:");
  console.log("   Super Admin: admin@daengtisia.com / admin123456");
  console.log("   HRD:         hrd@daengtisia.com / hrd123456");
  console.log("   Manager:     manager@daengtisia.com / manager123456");
  console.log("   Karyawan:    ahmad@daengtisia.com / emp123456");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
