import { serve } from "@hono/node-server"
import { config } from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { createDailyReportService } from "../application/services/daily-report-service.js"
import { createStatisticsService } from "../application/services/statistics-service.js"
import { createUserService } from "../application/services/user-service.js"
import { createDailyReportId } from "../domain/types/index.js"
import {
  authenticate,
  requireAdmin,
} from "../infrastructure/auth/middleware.js"
import { createPasswordHasher } from "../infrastructure/auth/password-hasher.js"
import { createTokenGenerator } from "../infrastructure/auth/token-generator.js"
import { getPrismaClient } from "../infrastructure/database/prisma.js"
import { createDailyReportRepository } from "../infrastructure/repositories/daily-report-repository.js"
import {
  type SimpleUserRepository,
  createSimpleUserRepository,
} from "../infrastructure/repositories/simple-user-repository.js"
import { createStatisticsRepository } from "../infrastructure/repositories/statistics-repository.js"
import { createUserRepository } from "../infrastructure/repositories/user-repository.js"

// Load environment variables
config()

type Variables = {
  userId: string
  userEmail: string
  userRole: string
}

const app = new Hono<{ Variables: Variables }>()

// Middleware
app.use("*", logger())
app.use("*", cors())

// Initialize dependencies
const prisma = getPrismaClient()
const dailyReportRepo = createDailyReportRepository(prisma)
const userRepo = createUserRepository(prisma)
const simpleUserRepo = createSimpleUserRepository(prisma)
const statisticsRepo = createStatisticsRepository(prisma)
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
const statisticsService = createStatisticsService(statisticsRepo)

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API Routes
app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json()
    const token = await userService.authenticate(body)
    return c.json(token)
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

// Statistics endpoints
app.get("/api/stats/personal", authenticate, async (c) => {
  try {
    const userId = c.get("userId")
    const stats = await statisticsService.getPersonalStats(userId)
    return c.json(stats)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    )
  }
})

app.get("/api/stats/team", authenticate, requireAdmin, async (c) => {
  try {
    const stats = await statisticsService.getTeamStats()
    return c.json(stats)
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    )
  }
})

// Start server
const port = process.env.PORT || 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port),
})
