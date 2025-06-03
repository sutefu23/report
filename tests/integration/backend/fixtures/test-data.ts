import {
  createDailyReportId,
  createDepartmentId,
  createProjectId,
  createUserId,
} from "@domain/types/base"
import bcrypt from "bcryptjs"
import { ulid } from "ulid"

export const testUsers = {
  admin: {
    id: createUserId(ulid()),
    email: "admin@test.com",
    password: "AdminTestPassword123!",
    passwordHash: bcrypt.hashSync("AdminTestPassword123!", 10),
    name: "Test Admin",
    role: "admin" as const,
    departmentId: createDepartmentId(ulid()),
  },
  manager: {
    id: createUserId(ulid()),
    email: "manager@test.com",
    password: "ManagerTestPassword123!",
    passwordHash: bcrypt.hashSync("ManagerTestPassword123!", 10),
    name: "Test Manager",
    role: "manager" as const,
    departmentId: createDepartmentId(ulid()),
  },
  member: {
    id: createUserId(ulid()),
    email: "member@test.com",
    password: "MemberTestPassword123!",
    passwordHash: bcrypt.hashSync("MemberTestPassword123!", 10),
    name: "Test Member",
    role: "employee" as const,
    departmentId: createDepartmentId(ulid()),
  },
}

export const testDepartments = {
  engineering: {
    id: testUsers.admin.departmentId,
    name: "Engineering",
  },
  sales: {
    id: ulid(),
    name: "Sales",
  },
}

export const testProjects = {
  projectA: {
    id: createProjectId(ulid()),
    name: "Project A",
    description: "Test project A",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    departmentId: testDepartments.engineering.id,
  },
  projectB: {
    id: createProjectId(ulid()),
    name: "Project B",
    description: "Test project B",
    startDate: new Date("2024-02-01"),
    departmentId: testDepartments.engineering.id,
  },
}

export const testDailyReports = {
  draftReport: {
    id: createDailyReportId(ulid()),
    userId: testUsers.member.id,
    date: new Date("2024-01-15"),
    tasks: [
      {
        projectId: testProjects.projectA.id,
        description: "Implemented user authentication",
        hoursSpent: 4,
        progress: 75,
      },
      {
        projectId: testProjects.projectB.id,
        description: "Fixed bug in payment processing",
        hoursSpent: 2,
        progress: 100,
      },
    ],
    challenges: "Debugging JWT token expiration issues",
    nextDayPlan: "Complete authentication flow and start on user profile",
    status: "draft" as const,
  },
  submittedReport: {
    id: createDailyReportId(ulid()),
    userId: testUsers.member.id,
    date: new Date("2024-01-16"),
    tasks: [
      {
        projectId: testProjects.projectA.id,
        description: "Completed authentication flow",
        hoursSpent: 6,
        progress: 100,
      },
    ],
    challenges: "None",
    nextDayPlan: "Start user profile implementation",
    status: "submitted" as const,
    submittedAt: new Date("2024-01-16T17:00:00Z"),
  },
}

export function createTestUser(overrides = {}) {
  const id = createUserId(ulid())
  const defaultUser = {
    id,
    email: `user-${id}@test.com`,
    password: "TestPassword123!",
    name: `Test User ${id}`,
    role: "employee" as const,
    departmentId: testDepartments.engineering.id,
  }
  return { ...defaultUser, ...overrides }
}

export function createTestDailyReport(userId: string, overrides = {}) {
  const defaultReport = {
    id: createDailyReportId(ulid()),
    userId,
    date: new Date(),
    tasks: [
      {
        projectId: testProjects.projectA.id,
        description: "Test task",
        hoursSpent: 4,
        progress: 50,
      },
    ],
    challenges: "Test challenges",
    nextDayPlan: "Test plan",
    status: "draft" as const,
  }
  return { ...defaultReport, ...overrides }
}
