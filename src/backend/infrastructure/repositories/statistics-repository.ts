import type { PrismaClient } from "@prisma/client"
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns"
import { ja } from "date-fns/locale"

export interface PersonalStats {
  totalReports: number
  thisMonthReports: number
  averageCompletionTime: string
  completionRate: number
  weeklyTrend: Array<{ day: string; count: number }>
  recentProjects: Array<{ name: string; reports: number; percentage: number }>
}

export interface TeamStats {
  totalMembers: number
  activeToday: number
  reportCompletionRate: number
  averageResponseTime: string
  departmentStats: Array<{
    name: string
    members: number
    completion: number
    reports: number
  }>
  memberPerformance: Array<{
    name: string
    department: string
    reports: number
    completion: number
    avgTime: string
  }>
  weeklyTrend: {
    labels: string[]
    submitted: number[]
    onTime: number[]
  }
}

export interface StatisticsRepository {
  getPersonalStats: (userId: string) => Promise<PersonalStats>
  getTeamStats: () => Promise<TeamStats>
}

export const createStatisticsRepository = (
  prisma: PrismaClient,
): StatisticsRepository => ({
  getPersonalStats: async (userId: string): Promise<PersonalStats> => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const weekStart = startOfWeek(now, { locale: ja })
    const weekEnd = endOfWeek(now, { locale: ja })

    // Get total reports count
    const totalReports = await prisma.dailyReport.count({
      where: { userId },
    })

    // Get this month's reports
    const thisMonthReports = await prisma.dailyReport.count({
      where: {
        userId,
        reportDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    // Calculate average completion time
    // Since we don't have submittedAt field, we'll use createdAt as a proxy
    const reports = await prisma.dailyReport.findMany({
      where: {
        userId,
      },
      select: {
        reportDate: true,
        createdAt: true,
      },
      take: 30,
    })

    // Calculate average hours between report date end and creation
    const avgMinutes =
      reports.reduce((acc, report) => {
        const reportEndTime = endOfDay(new Date(report.reportDate))
        const createdTime = new Date(report.createdAt)
        // If created after the report date, calculate the difference
        if (createdTime > reportEndTime) {
          const diff = createdTime.getTime() - reportEndTime.getTime()
          return acc + diff / (1000 * 60)
        }
        return acc
      }, 0) / Math.max(reports.length, 1)

    const avgHours = Math.round((avgMinutes / 60) * 10) / 10
    const averageCompletionTime = avgHours > 0 ? `${avgHours}時間` : "当日提出"

    // Calculate completion rate
    const expectedReports = 22 // Assuming 22 working days per month
    const completionRate = Math.round(
      (thisMonthReports / expectedReports) * 100,
    )

    // Get weekly trend
    const weeklyTrend = []
    const weekDays = ["月", "火", "水", "木", "金"]

    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)

      const count = await prisma.dailyReport.count({
        where: {
          userId,
          reportDate: {
            gte: startOfDay(date),
            lt: endOfDay(date),
          },
        },
      })

      weeklyTrend.push({ day: weekDays[i], count })
    }

    // Get recent projects with work record counts
    const recentWorkRecords = await prisma.workRecord.findMany({
      where: {
        dailyReport: {
          userId,
          reportDate: {
            gte: subDays(now, 30),
          },
        },
      },
      include: {
        project: true,
      },
    })

    // Aggregate by project
    const projectMap = new Map<string, { name: string; count: number }>()
    for (const record of recentWorkRecords) {
      const projectName = record.project?.name || "その他"
      const current = projectMap.get(projectName) || {
        name: projectName,
        count: 0,
      }
      current.count++
      projectMap.set(projectName, current)
    }

    // Convert to array and calculate percentages
    const totalWorkRecords = recentWorkRecords.length
    const recentProjects = Array.from(projectMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((project) => ({
        name: project.name,
        reports: project.count,
        percentage: Math.round((project.count / totalWorkRecords) * 100),
      }))

    return {
      totalReports,
      thisMonthReports,
      averageCompletionTime,
      completionRate,
      weeklyTrend,
      recentProjects,
    }
  },

  getTeamStats: async (): Promise<TeamStats> => {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    // Get total members
    const totalMembers = await prisma.user.count()

    // Get active members today (count distinct users who created reports today)
    const activeTodayReports = await prisma.dailyReport.groupBy({
      by: ["userId"],
      where: {
        reportDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })
    const activeToday = activeTodayReports.length

    // Calculate report completion rate
    const expectedDailyReports = totalMembers
    const reportCompletionRate = Math.round(
      (activeToday / expectedDailyReports) * 100,
    )

    // Calculate average response time
    // Since we don't have approvedAt field, we'll use a mock value for now
    const averageResponseTime = "1.2時間"

    // Get department stats (mock departments for now)
    const departments = ["開発部", "営業部", "総務部"]
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        // In real implementation, would join with department table
        const members = await prisma.user.count({
          where: {
            // departmentId would be used here
          },
        })

        const reports = await prisma.dailyReport.count({
          where: {
            reportDate: {
              gte: startOfMonth(now),
              lte: endOfMonth(now),
            },
            // Would filter by department
          },
        })

        return {
          name: dept,
          members: Math.floor(totalMembers / 3), // Mock distribution
          completion: 85 + Math.floor(Math.random() * 10),
          reports: Math.floor(reports / 3),
        }
      }),
    )

    // Get member performance
    const topUsers = await prisma.dailyReport.groupBy({
      by: ["userId"],
      where: {
        reportDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    })

    const memberPerformance = await Promise.all(
      topUsers.map(async (userStat) => {
        const user = await prisma.user.findUnique({
          where: { id: userStat.userId },
        })

        // All created reports are considered submitted
        const submittedCount = userStat._count.id

        return {
          name: user?.username || "Unknown",
          department: departments[Math.floor(Math.random() * 3)], // Mock department
          reports: userStat._count.id,
          completion: Math.round((submittedCount / userStat._count.id) * 100),
          avgTime: `${1.5 + Math.random() * 2}時間`,
        }
      }),
    )

    // Get weekly trend
    const weekStart = startOfWeek(now, { locale: ja })
    const labels = ["月", "火", "水", "木", "金"]
    const submitted = []
    const onTime = []

    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const totalReportsDay = await prisma.dailyReport.count({
        where: {
          reportDate: {
            gte: startOfDay(date),
            lt: endOfDay(date),
          },
        },
      })

      // All created reports are considered submitted
      const submittedReportsDay = totalReportsDay

      // Consider "on time" if created on the same day as report date
      const onTimeReportsDay = await prisma.dailyReport.count({
        where: {
          reportDate: {
            gte: startOfDay(date),
            lt: endOfDay(date),
          },
          createdAt: {
            lt: endOfDay(date),
          },
        },
      })

      submitted.push(
        totalReportsDay > 0
          ? Math.round((submittedReportsDay / totalMembers) * 100)
          : 0,
      )
      onTime.push(
        totalReportsDay > 0
          ? Math.round((onTimeReportsDay / totalMembers) * 100)
          : 0,
      )
    }

    return {
      totalMembers,
      activeToday,
      reportCompletionRate,
      averageResponseTime,
      departmentStats,
      memberPerformance,
      weeklyTrend: {
        labels,
        submitted,
        onTime,
      },
    }
  },
})
