import type {
  PrismaClient,
  DailyReport as PrismaDailyReport,
  WorkRecord as PrismaWorkRecord,
} from "@prisma/client"
import {
  type DailyReport,
  createDailyReportId,
  createProjectId,
  createUserId,
} from "../../domain/types"
import type { DailyReportRepository } from "../../domain/workflows"

export const createDailyReportRepository = (
  prisma: PrismaClient,
): DailyReportRepository => {
  const toDomain = (
    report: PrismaDailyReport & { workRecords: PrismaWorkRecord[] },
  ): DailyReport => ({
    id: createDailyReportId(report.id),
    userId: createUserId(report.userId),
    date: report.reportDate,
    tasks: report.workRecords.map((record: PrismaWorkRecord) => ({
      projectId: createProjectId(record.projectId),
      description: record.workContent,
      hoursSpent: record.workHours,
      progress: 0, // WorkRecord doesn't have progress field
    })),
    challenges: report.memo || "",
    nextDayPlan: report.tomorrowPlan || "",
    status: "draft" as DailyReport["status"], // No status in schema
    submittedAt: undefined,
    approvedAt: undefined,
    approvedBy: undefined,
    feedback: undefined,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  })

  return {
    findById: async (id: string): Promise<DailyReport | null> => {
      const report = await prisma.dailyReport.findUnique({
        where: { id },
        include: { workRecords: true },
      })
      return report ? toDomain(report) : null
    },

    findByUserAndDate: async (
      userId: string,
      date: Date,
    ): Promise<DailyReport | null> => {
      const report = await prisma.dailyReport.findUnique({
        where: {
          userId_reportDate: {
            userId,
            reportDate: date,
          },
        },
        include: { workRecords: true },
      })
      return report ? toDomain(report) : null
    },

    create: async (report: DailyReport): Promise<DailyReport> => {
      const created = await prisma.dailyReport.create({
        data: {
          id: report.id,
          userId: report.userId,
          reportDate: report.date,
          memo: report.challenges,
          tomorrowPlan: report.nextDayPlan,
          workRecords: {
            create: report.tasks.map((task) => ({
              projectId: task.projectId,
              workContent: task.description,
              workHours: task.hoursSpent,
            })),
          },
        },
        include: { workRecords: true },
      })
      return toDomain(created)
    },

    update: async (report: DailyReport): Promise<DailyReport> => {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.workRecord.deleteMany({
          where: { dailyReportId: report.id },
        })

        return await tx.dailyReport.update({
          where: { id: report.id },
          data: {
            memo: report.challenges,
            tomorrowPlan: report.nextDayPlan,
            workRecords: {
              create: report.tasks.map((task) => ({
                projectId: task.projectId,
                workContent: task.description,
                workHours: task.hoursSpent,
              })),
            },
          },
          include: { workRecords: true },
        })
      })
      return toDomain(updated)
    },
  }
}
