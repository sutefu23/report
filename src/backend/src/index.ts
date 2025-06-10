import { serve } from "@hono/node-server"
import { config } from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { createDailyReportService } from "../application/services/daily-report-service.js"
import { createUserService } from "../application/services/user-service.js"
import { createDailyReportId } from "../domain/types/index.js"
import { createPasswordHasher } from "../infrastructure/auth/password-hasher.js"
import { createTokenGenerator } from "../infrastructure/auth/token-generator.js"
import { getPrismaClient } from "../infrastructure/database/prisma.js"
import { createDailyReportRepository } from "../infrastructure/repositories/daily-report-repository.js"
import {
  type SimpleUserRepository,
  createSimpleUserRepository,
} from "../infrastructure/repositories/simple-user-repository.js"
import { createUserRepository } from "../infrastructure/repositories/user-repository.js"

// Load environment variables
config()

const app = new Hono()

// Middleware
app.use("*", logger())
app.use("*", cors())

// Initialize dependencies
const prisma = getPrismaClient()
const dailyReportRepo = createDailyReportRepository(prisma)
const userRepo = createUserRepository(prisma)
const simpleUserRepo = createSimpleUserRepository(prisma)
const passwordHasher = createPasswordHasher()
const tokenGenerator = createTokenGenerator(
  process.env.JWT_SECRET || "default-secret",
)

// Initialize services
const dailyReportService = createDailyReportService(
  dailyReportRepo,
  simpleUserRepo,
)
const userService = createUserService(userRepo, passwordHasher, tokenGenerator)

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API Routes
app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json()
    const token = await userService.authenticate(body)

    // Get user information
    const user = await userService.findByEmail(body.email)
    if (!user) {
      return c.json({ error: "User not found" }, 400)
    }

    // Return both token and user info (without password)
    return c.json({
      token: token.accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role:
          user.role === "admin" || user.role === "manager" ? "admin" : "user",
        departmentId: user.departmentId,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

app.post("/api/users", async (c) => {
  try {
    const body = await c.req.json()
    const user = await userService.create(body)
    return c.json(user)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

app.post("/api/daily-reports", async (c) => {
  try {
    const body = await c.req.json()
    const report = await dailyReportService.create(body)
    return c.json(report)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

app.put("/api/daily-reports/:id", async (c) => {
  try {
    const id = createDailyReportId(c.req.param("id"))
    const body = await c.req.json()
    const report = await dailyReportService.update({ ...body, id })
    return c.json(report)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

app.post("/api/daily-reports/:id/submit", async (c) => {
  try {
    const id = createDailyReportId(c.req.param("id"))
    const body = await c.req.json()
    const report = await dailyReportService.submit({ id, userId: body.userId })
    return c.json(report)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

app.post("/api/daily-reports/:id/approve", async (c) => {
  try {
    const id = createDailyReportId(c.req.param("id"))
    const body = await c.req.json()
    const report = await dailyReportService.approve({
      id,
      approverId: body.approverId,
      feedback: body.feedback,
    })
    return c.json(report)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

app.post("/api/daily-reports/:id/reject", async (c) => {
  try {
    const id = createDailyReportId(c.req.param("id"))
    const body = await c.req.json()
    const report = await dailyReportService.reject({
      id,
      approverId: body.approverId,
      feedback: body.feedback,
    })
    return c.json(report)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    )
  }
})

// Statistics routes
app.get("/api/stats/personal", async (c) => {
  // TODO: Implement personal statistics with real database queries
  // TODO: Optimize with database aggregations for better performance
  // This should return user's personal report statistics
  return c.json({
    totalReports: 145,
    thisMonthReports: 22,
    averageCompletionTime: "2.5時間",
    completionRate: 95,
    weeklyTrend: [
      { day: "月", count: 5 },
      { day: "火", count: 4 },
      { day: "水", count: 5 },
      { day: "木", count: 4 },
      { day: "金", count: 4 },
    ],
    recentProjects: [
      { name: "プロジェクトA", reports: 45, percentage: 31 },
      { name: "プロジェクトB", reports: 38, percentage: 26 },
      { name: "プロジェクトC", reports: 32, percentage: 22 },
      { name: "その他", reports: 30, percentage: 21 },
    ],
  })
})

app.get("/api/stats/team", async (c) => {
  // TODO: Implement team statistics with real database queries (admin only)
  // TODO: Add authentication middleware to verify admin role
  // TODO: Optimize with database aggregations and consider caching
  // This should return team-wide report statistics
  return c.json({
    totalMembers: 24,
    activeToday: 18,
    reportCompletionRate: 87,
    averageResponseTime: "1.2時間",
    departmentStats: [
      { name: "開発部", members: 12, completion: 92, reports: 276 },
      { name: "営業部", members: 8, completion: 85, reports: 184 },
      { name: "総務部", members: 4, completion: 78, reports: 89 },
    ],
    memberPerformance: [
      {
        name: "田中太郎",
        department: "開発部",
        reports: 22,
        completion: 100,
        avgTime: "2.1時間",
      },
      {
        name: "佐藤花子",
        department: "営業部",
        reports: 21,
        completion: 95,
        avgTime: "1.8時間",
      },
      {
        name: "鈴木一郎",
        department: "開発部",
        reports: 20,
        completion: 91,
        avgTime: "2.5時間",
      },
      {
        name: "高橋美咲",
        department: "総務部",
        reports: 19,
        completion: 86,
        avgTime: "1.5時間",
      },
      {
        name: "山田健",
        department: "開発部",
        reports: 18,
        completion: 82,
        avgTime: "3.0時間",
      },
    ],
    weeklyTrend: {
      labels: ["月", "火", "水", "木", "金"],
      submitted: [85, 88, 92, 87, 83],
      onTime: [78, 82, 85, 80, 75],
    },
  })
})

// Start server
const port = process.env.PORT || 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port),
})
