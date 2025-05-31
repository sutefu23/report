import type {
  PrismaClient,
  DailyReport as PrismaDailyReport,
  Task as PrismaTask,
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
    report: PrismaDailyReport & { tasks: PrismaTask[] },
  ): DailyReport => ({
    id: createDailyReportId(report.id),
    userId: createUserId(report.userId),
    date: report.date,
    tasks: report.tasks.map((task: PrismaTask) => ({
      projectId: createProjectId(task.projectId),
      description: task.description,
      hoursSpent: task.hoursSpent,
      progress: task.progress,
    })),
    challenges: report.challenges,
    nextDayPlan: report.nextDayPlan,
    status: report.status as DailyReport["status"],
    submittedAt: report.submittedAt ?? undefined,
    approvedAt: report.approvedAt ?? undefined,
    approvedBy: report.approvedBy ? createUserId(report.approvedBy) : undefined,
    feedback: report.feedback ?? undefined,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  })

  return {
    findById: async (id: string): Promise<DailyReport | null> => {
      const report = await prisma.dailyReport.findUnique({
        where: { id },
        include: { tasks: true },
      })
      return report ? toDomain(report) : null
    },

    findByUserAndDate: async (
      userId: string,
      date: Date,
    ): Promise<DailyReport | null> => {
      const report = await prisma.dailyReport.findUnique({
        where: { userId_date: { userId, date } },
        include: { tasks: true },
      })
      return report ? toDomain(report) : null
    },

    create: async (report: DailyReport): Promise<DailyReport> => {
      const created = await prisma.dailyReport.create({
        data: {
          id: report.id,
          userId: report.userId,
          date: report.date,
          challenges: report.challenges,
          nextDayPlan: report.nextDayPlan,
          status: report.status,
          tasks: {
            create: report.tasks.map((task) => ({
              id: createDailyReportId(new Date().getTime().toString()),
              projectId: task.projectId,
              description: task.description,
              hoursSpent: task.hoursSpent,
              progress: task.progress,
            })),
          },
        },
        include: { tasks: true },
      })
      return toDomain(created)
    },

    update: async (report: DailyReport): Promise<DailyReport> => {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.task.deleteMany({
          where: { dailyReportId: report.id },
        })

        return await tx.dailyReport.update({
          where: { id: report.id },
          data: {
            challenges: report.challenges,
            nextDayPlan: report.nextDayPlan,
            status: report.status,
            submittedAt: report.submittedAt,
            approvedAt: report.approvedAt,
            approvedBy: report.approvedBy,
            feedback: report.feedback,
            tasks: {
              create: report.tasks.map((task) => ({
                id: createDailyReportId(new Date().getTime().toString()),
                projectId: task.projectId,
                description: task.description,
                hoursSpent: task.hoursSpent,
                progress: task.progress,
              })),
            },
          },
          include: { tasks: true },
        })
      })
      return toDomain(updated)
    },
  }
}
