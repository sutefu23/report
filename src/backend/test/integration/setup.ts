import { execSync } from "node:child_process"
import * as path from "node:path"
import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") })

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

export async function setupTestDatabase() {
  try {
    // Run migrations
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    })
    console.log("✅ Test database migrations applied")
  } catch (error) {
    console.error("Failed to setup test database:", error)
    throw error
  }
}

export async function cleanupDatabase() {
  const tables = [
    "WorkRecord",
    "DailyReport",
    "ProjectAssignment",
    "Project",
    "User",
    "Department",
  ]

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)
  }
}

export async function closeDatabase() {
  await prisma.$disconnect()
}

// Test transaction wrapper for automatic rollback
export async function withTestTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return prisma
    .$transaction(async (tx) => {
      const result = await fn(tx as PrismaClient)
      throw new Error("Rollback")
    })
    .catch((error) => {
      if (error.message === "Rollback") {
        return error.result
      }
      throw error
    })
}
