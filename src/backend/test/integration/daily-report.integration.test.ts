import { DomainError } from "@domain/errors"
import type { DailyReport } from "@domain/types/daily-report"
import {
  approveDailyReportWorkflow,
  createDailyReportWorkflow,
  rejectDailyReportWorkflow,
  submitDailyReportWorkflow,
  updateDailyReportWorkflow,
} from "@domain/workflows/daily-report-workflow"
import { DailyReportRepository } from "@infrastructure/repositories/daily-report-repository"
import { SimpleUserRepository } from "@infrastructure/repositories/simple-user-repository"
import { UserRepository } from "@infrastructure/repositories/user-repository"
import { createDailyReportId } from "@shared/types/branded"
import { ulid } from "ulid"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import {
  createTestDailyReport,
  testDailyReports,
  testDepartments,
  testProjects,
  testUsers,
} from "./fixtures/test-data"
import {
  cleanupDatabase,
  closeDatabase,
  prisma,
  setupTestDatabase,
} from "./setup"

describe("Daily Report Integration Tests", () => {
  let dailyReportRepository: DailyReportRepository
  let userRepository: UserRepository
  let simpleUserRepository: SimpleUserRepository

  beforeAll(async () => {
    await setupTestDatabase()
    dailyReportRepository = new DailyReportRepository(prisma)
    userRepository = new UserRepository(prisma)
    simpleUserRepository = new SimpleUserRepository(prisma)

    // Setup test data
    await prisma.department.create({ data: testDepartments.engineering })
    await prisma.user.create({
      data: {
        id: testUsers.member.id,
        email: testUsers.member.email,
        password: testUsers.member.passwordHash,
        name: testUsers.member.name,
        role: testUsers.member.role,
        departmentId: testUsers.member.departmentId,
      },
    })
    await prisma.user.create({
      data: {
        id: testUsers.manager.id,
        email: testUsers.manager.email,
        password: testUsers.manager.passwordHash,
        name: testUsers.manager.name,
        role: testUsers.manager.role,
        departmentId: testUsers.manager.departmentId,
        subordinateIds: [testUsers.member.id],
      },
    })
    await prisma.project.create({ data: testProjects.projectA })
    await prisma.project.create({ data: testProjects.projectB })
  })

  afterEach(async () => {
    // Clean only daily reports and work records
    await prisma.workRecord.deleteMany()
    await prisma.dailyReport.deleteMany()
  })

  afterAll(async () => {
    await cleanupDatabase()
    await closeDatabase()
  })

  describe("Daily Report Creation", () => {
    it("should create daily report with tasks successfully", async () => {
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const input = {
        userId: testUsers.member.id,
        date: new Date("2024-01-20"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Implemented new feature",
            hoursSpent: 6,
            progress: 80,
          },
          {
            projectId: testProjects.projectB.id,
            description: "Code review",
            hoursSpent: 2,
            progress: 100,
          },
        ],
        challenges: "Complex business logic",
        nextDayPlan: "Continue implementation",
      }

      const result = await createReport(input)

      expect(result.success).toBe(true)
      if (!result.success) return

      const report = result.data
      expect(report.userId).toBe(input.userId)
      expect(report.date).toEqual(input.date)
      expect(report.tasks).toHaveLength(2)
      expect(report.status).toBe("draft")

      // Verify database persistence
      const dbReport = await prisma.dailyReport.findUnique({
        where: { id: report.id },
        include: { workRecords: true },
      })

      expect(dbReport).toBeTruthy()
      expect(dbReport?.workRecords).toHaveLength(2)
    })

    it("should prevent duplicate reports for same date", async () => {
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const date = new Date("2024-01-21")

      // Create first report
      const firstResult = await createReport({
        userId: testUsers.member.id,
        date,
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "First report",
            hoursSpent: 8,
            progress: 100,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(firstResult.success).toBe(true)

      // Try to create duplicate
      const duplicateResult = await createReport({
        userId: testUsers.member.id,
        date, // Same date
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Duplicate report",
            hoursSpent: 4,
            progress: 50,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(duplicateResult.success).toBe(false)
      if (!duplicateResult.success) {
        expect(duplicateResult.error.code).toBe("DAILY_REPORT_ALREADY_EXISTS")
      }
    })

    it("should validate total task hours <= 24", async () => {
      const createReport = createDailyReportWorkflow(dailyReportRepository)

      const result = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-22"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Task 1",
            hoursSpent: 15,
            progress: 50,
          },
          {
            projectId: testProjects.projectB.id,
            description: "Task 2",
            hoursSpent: 10, // Total: 25 hours
            progress: 50,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_TASK_HOURS")
      }
    })

    it("should validate progress between 0-100", async () => {
      const createReport = createDailyReportWorkflow(dailyReportRepository)

      const invalidProgressValues = [-10, 101, 150]

      for (const progress of invalidProgressValues) {
        const result = await createReport({
          userId: testUsers.member.id,
          date: new Date(
            `2024-01-${23 + invalidProgressValues.indexOf(progress)}`,
          ),
          tasks: [
            {
              projectId: testProjects.projectA.id,
              description: "Invalid progress task",
              hoursSpent: 4,
              progress,
            },
          ],
          challenges: "",
          nextDayPlan: "",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_PROGRESS_VALUE")
        }
      }
    })
  })

  describe("Daily Report Update", () => {
    it("should update draft report successfully", async () => {
      // Create draft report
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-25"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Initial task",
            hoursSpent: 4,
            progress: 50,
          },
        ],
        challenges: "Initial challenges",
        nextDayPlan: "Initial plan",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const reportId = createResult.data.id

      // Update report
      const updateReport = updateDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const updateResult = await updateReport({
        id: reportId,
        userId: testUsers.member.id,
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Updated task",
            hoursSpent: 6,
            progress: 75,
          },
          {
            projectId: testProjects.projectB.id,
            description: "New task",
            hoursSpent: 2,
            progress: 100,
          },
        ],
        challenges: "Updated challenges",
        nextDayPlan: "Updated plan",
      })

      expect(updateResult.success).toBe(true)
      if (!updateResult.success) return

      // Verify update
      const updatedReport = updateResult.data
      expect(updatedReport.tasks).toHaveLength(2)
      expect(updatedReport.challenges).toBe("Updated challenges")

      // Verify old work records were replaced
      const dbWorkRecords = await prisma.workRecord.findMany({
        where: { dailyReportId: reportId },
      })
      expect(dbWorkRecords).toHaveLength(2)
      expect(dbWorkRecords[0].description).toBe("Updated task")
    })

    it("should prevent updating submitted report", async () => {
      // Create and submit report
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-26"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Task",
            hoursSpent: 8,
            progress: 100,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const reportId = createResult.data.id

      // Submit report
      const submitReport = submitDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      await submitReport({
        id: reportId,
        userId: testUsers.member.id,
      })

      // Try to update submitted report
      const updateReport = updateDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const updateResult = await updateReport({
        id: reportId,
        userId: testUsers.member.id,
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Modified task",
            hoursSpent: 4,
            progress: 50,
          },
        ],
        challenges: "Modified",
        nextDayPlan: "Modified",
      })

      expect(updateResult.success).toBe(false)
      if (!updateResult.success) {
        expect(updateResult.error.code).toBe("INVALID_STATUS_TRANSITION")
      }
    })

    it("should prevent updating other user's report", async () => {
      // Create another user
      await prisma.user.create({
        data: {
          id: testUsers.admin.id,
          email: testUsers.admin.email,
          password: testUsers.admin.passwordHash,
          name: testUsers.admin.name,
          role: testUsers.admin.role,
          departmentId: testUsers.admin.departmentId,
        },
      })

      // Create report as member
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-27"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Member's task",
            hoursSpent: 8,
            progress: 100,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      // Try to update as admin
      const updateReport = updateDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const updateResult = await updateReport({
        id: createResult.data.id,
        userId: testUsers.admin.id, // Different user
        tasks: [],
        challenges: "",
        nextDayPlan: "",
      })

      expect(updateResult.success).toBe(false)
      if (!updateResult.success) {
        expect(updateResult.error.code).toBe("FORBIDDEN")
      }
    })
  })

  describe("Daily Report Status Transitions", () => {
    it("should complete draft -> submit -> approve flow", async () => {
      // Create draft report
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-28"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Complete feature",
            hoursSpent: 8,
            progress: 100,
          },
        ],
        challenges: "None",
        nextDayPlan: "Start new feature",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const reportId = createResult.data.id

      // Submit report
      const submitReport = submitDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const submitResult = await submitReport({
        id: reportId,
        userId: testUsers.member.id,
      })

      expect(submitResult.success).toBe(true)
      if (!submitResult.success) return

      expect(submitResult.data.status).toBe("submitted")
      expect(submitResult.data.submittedAt).toBeTruthy()

      // Approve report as manager
      const approveReport = approveDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const approveResult = await approveReport({
        id: reportId,
        approverId: testUsers.manager.id,
      })

      expect(approveResult.success).toBe(true)
      if (!approveResult.success) return

      expect(approveResult.data.status).toBe("approved")
      expect(approveResult.data.approvedAt).toBeTruthy()
      expect(approveResult.data.approvedBy).toBe(testUsers.manager.id)
    })

    it("should complete submit -> reject -> resubmit flow", async () => {
      // Create and submit report
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-29"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Incomplete work",
            hoursSpent: 4,
            progress: 30,
          },
        ],
        challenges: "Unclear requirements",
        nextDayPlan: "Continue work",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const reportId = createResult.data.id

      // Submit
      const submitReport = submitDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      await submitReport({
        id: reportId,
        userId: testUsers.member.id,
      })

      // Reject with feedback
      const rejectReport = rejectDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const rejectResult = await rejectReport({
        id: reportId,
        approverId: testUsers.manager.id,
        feedback: "Please provide more details about the challenges",
      })

      expect(rejectResult.success).toBe(true)
      if (!rejectResult.success) return

      expect(rejectResult.data.status).toBe("rejected")
      expect(rejectResult.data.feedback).toBe(
        "Please provide more details about the challenges",
      )

      // Update rejected report
      const updateReport = updateDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const updateResult = await updateReport({
        id: reportId,
        userId: testUsers.member.id,
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Incomplete work - clarified requirements with PM",
            hoursSpent: 4,
            progress: 30,
          },
        ],
        challenges:
          "Requirements were unclear. Met with PM to clarify acceptance criteria.",
        nextDayPlan: "Implement based on clarified requirements",
      })

      expect(updateResult.success).toBe(true)

      // Resubmit
      const resubmitResult = await submitReport({
        id: reportId,
        userId: testUsers.member.id,
      })

      expect(resubmitResult.success).toBe(true)
      if (!resubmitResult.success) return

      expect(resubmitResult.data.status).toBe("submitted")
    })

    it("should enforce role-based approval permissions", async () => {
      // Create and submit report
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-30"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Task",
            hoursSpent: 8,
            progress: 100,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const reportId = createResult.data.id

      // Submit
      const submitReport = submitDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      await submitReport({
        id: reportId,
        userId: testUsers.member.id,
      })

      // Try to approve as member (should fail)
      const approveReport = approveDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const approveResult = await approveReport({
        id: reportId,
        approverId: testUsers.member.id, // Member trying to approve
      })

      expect(approveResult.success).toBe(false)
      if (!approveResult.success) {
        expect(approveResult.error.code).toBe("FORBIDDEN")
      }
    })

    it("should prevent invalid status transitions", async () => {
      // Create report
      const createReport = createDailyReportWorkflow(dailyReportRepository)
      const createResult = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-01-31"),
        tasks: [
          {
            projectId: testProjects.projectA.id,
            description: "Task",
            hoursSpent: 8,
            progress: 100,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const reportId = createResult.data.id

      // Try to approve draft (should fail)
      const approveReport = approveDailyReportWorkflow(
        dailyReportRepository,
        simpleUserRepository,
      )
      const approveResult = await approveReport({
        id: reportId,
        approverId: testUsers.manager.id,
      })

      expect(approveResult.success).toBe(false)
      if (!approveResult.success) {
        expect(approveResult.error.code).toBe("INVALID_STATUS_TRANSITION")
      }
    })
  })

  describe("Transaction Integrity", () => {
    it("should rollback on partial failure", async () => {
      // This test would simulate a failure during work record creation
      // In a real scenario, you might need to mock the database to force an error
      const createReport = createDailyReportWorkflow(dailyReportRepository)

      // Create report with invalid project ID (should fail during work record creation)
      const result = await createReport({
        userId: testUsers.member.id,
        date: new Date("2024-02-01"),
        tasks: [
          {
            projectId: "invalid-project-id", // This should cause a foreign key error
            description: "Task",
            hoursSpent: 4,
            progress: 50,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      })

      expect(result.success).toBe(false)

      // Verify no partial data was saved
      const reports = await prisma.dailyReport.findMany({
        where: {
          userId: testUsers.member.id,
          date: new Date("2024-02-01"),
        },
      })
      expect(reports).toHaveLength(0)
    })
  })
})
