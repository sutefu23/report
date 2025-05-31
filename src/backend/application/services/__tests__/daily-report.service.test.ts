import type { DailyReport } from "@domain/types/daily-report"
import type { DailyReportRepository } from "@infrastructure/repositories/daily-report.repository"
import type { UserRepository } from "@infrastructure/repositories/user.repository"
import type { SlackClient } from "@infrastructure/slack/client"
import {
  createDailyReportId,
  createProjectId,
  createUserId,
} from "@shared/types/branded"
import { ulid } from "ulid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DailyReportService } from "../daily-report.service"

describe("DailyReportService", () => {
  let service: DailyReportService
  let mockDailyReportRepo: DailyReportRepository
  let mockUserRepo: UserRepository
  let mockSlackClient: SlackClient

  beforeEach(() => {
    mockDailyReportRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserAndDate: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByUser: vi.fn(),
      findByDateRange: vi.fn(),
    }

    mockUserRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    }

    mockSlackClient = {
      sendMessage: vi.fn(),
      sendDailyReportNotification: vi.fn(),
    }

    service = new DailyReportService(
      mockDailyReportRepo,
      mockUserRepo,
      mockSlackClient,
    )
  })

  describe("submitDailyReport", () => {
    it("should submit report and send Slack notification to supervisor", async () => {
      const reportId = createDailyReportId(ulid())
      const userId = createUserId(ulid())
      const supervisorId = createUserId(ulid())

      const report: DailyReport = {
        id: reportId,
        userId,
        date: new Date("2024-01-15"),
        tasks: [
          {
            projectId: createProjectId(ulid()),
            description: "Completed API endpoints",
            hoursSpent: 6,
            progress: 100,
          },
        ],
        challenges: "None",
        nextDayPlan: "Start frontend integration",
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const user = {
        id: userId,
        email: "employee@example.com",
        name: "John Doe",
        role: "member" as const,
        supervisorId,
        slackId: "U123456",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const supervisor = {
        id: supervisorId,
        email: "supervisor@example.com",
        name: "Jane Smith",
        role: "admin" as const,
        slackId: "U789012",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDailyReportRepo.findById.mockResolvedValue(report)
      mockUserRepo.findById.mockResolvedValueOnce(user)
      mockUserRepo.findById.mockResolvedValueOnce(supervisor)
      mockDailyReportRepo.update.mockResolvedValue({
        ...report,
        status: "submitted",
        submittedAt: new Date(),
      })

      const result = await service.submitDailyReport({ id: reportId, userId })

      expect(result.success).toBe(true)
      expect(mockDailyReportRepo.update).toHaveBeenCalledWith(
        reportId,
        expect.objectContaining({
          status: "submitted",
          submittedAt: expect.any(Date),
        }),
      )
      expect(mockSlackClient.sendDailyReportNotification).toHaveBeenCalledWith({
        channelId: supervisor.slackId,
        report: expect.any(Object),
        employee: user,
      })
    })

    it("should return error if report not found", async () => {
      const reportId = createDailyReportId(ulid())
      const userId = createUserId(ulid())

      mockDailyReportRepo.findById.mockResolvedValue(null)

      const result = await service.submitDailyReport({ id: reportId, userId })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("DAILY_REPORT_NOT_FOUND")
      }
    })

    it("should return error if user is not the owner", async () => {
      const reportId = createDailyReportId(ulid())
      const userId = createUserId(ulid())
      const differentUserId = createUserId(ulid())

      const report: DailyReport = {
        id: reportId,
        userId: differentUserId,
        date: new Date(),
        tasks: [],
        challenges: "",
        nextDayPlan: "",
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDailyReportRepo.findById.mockResolvedValue(report)

      const result = await service.submitDailyReport({ id: reportId, userId })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("UNAUTHORIZED")
      }
    })

    it("should return error if report is already submitted", async () => {
      const reportId = createDailyReportId(ulid())
      const userId = createUserId(ulid())

      const report: DailyReport = {
        id: reportId,
        userId,
        date: new Date(),
        tasks: [],
        challenges: "",
        nextDayPlan: "",
        status: "submitted",
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDailyReportRepo.findById.mockResolvedValue(report)

      const result = await service.submitDailyReport({ id: reportId, userId })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_STATUS_TRANSITION")
      }
    })
  })

  describe("getTeamReports", () => {
    it("should return reports for all team members", async () => {
      const supervisorId = createUserId(ulid())
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-01-31")

      const teamMembers = [
        {
          id: createUserId(ulid()),
          email: "member1@example.com",
          name: "Member 1",
          role: "member" as const,
          supervisorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: createUserId(ulid()),
          email: "member2@example.com",
          name: "Member 2",
          role: "member" as const,
          supervisorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const reports: DailyReport[] = [
        {
          id: createDailyReportId(ulid()),
          userId: teamMembers[0].id,
          date: new Date("2024-01-15"),
          tasks: [],
          challenges: "",
          nextDayPlan: "",
          status: "submitted",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockUserRepo.findAll.mockResolvedValue(teamMembers)
      mockDailyReportRepo.findByDateRange.mockResolvedValue(reports)

      const result = await service.getTeamReports({
        supervisorId,
        startDate,
        endDate,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0]).toEqual(reports[0])
      }
      expect(mockUserRepo.findAll).toHaveBeenCalledWith({
        supervisorId,
      })
    })
  })
})
