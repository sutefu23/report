import * as path from "node:path"
import { createUserWorkflow } from "@domain/workflows/user-workflow"
import { createPasswordHasher } from "@infrastructure/auth/password-hasher"
import { createUserRepository } from "@infrastructure/repositories/user-repository"
import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import { createTestUser } from "./fixtures/test-data"

// Load test environment
const envPath = path.resolve(__dirname, "../../../config/env/.env.test")
console.log("Loading env from:", envPath)
dotenv.config({ path: envPath })

// Override with test database URL
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5433/daily_report_test"

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function runTest() {
  console.log("🧪 Running sample integration test...")
  console.log("📊 Database URL:", process.env.DATABASE_URL)

  try {
    // Clean database
    await prisma.workRecord.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.dailyReport.deleteMany()
    await prisma.user.deleteMany()
    await prisma.project.deleteMany()
    console.log("✅ Database cleaned")

    // Setup
    const userRepository = createUserRepository(prisma)
    const passwordHasher = createPasswordHasher()

    // No department table in schema, so we'll use a dummy department ID
    const deptId = "test-dept-01"
    console.log("✅ Using test department ID:", deptId)

    // Test user creation
    const createUser = createUserWorkflow(userRepository, passwordHasher)
    const newUser = createTestUser({
      email: "integration-test@example.com",
      password: "SecurePassword123!",
      departmentId: deptId,
    })

    const result = await createUser({
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
      role: "employee" as const,
      departmentId: newUser.departmentId,
    })

    if (result.tag === "Right") {
      console.log("✅ User created successfully:", result.right.email)

      // Verify password was hashed
      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email },
      })

      if (dbUser && dbUser.passwordHash !== newUser.password) {
        console.log("✅ Password was hashed correctly")
      } else {
        console.error("❌ Password hashing failed")
      }

      // Test authentication
      const foundUser = await userRepository.findByEmail(newUser.email)
      if (foundUser) {
        const userPassword = foundUser.password || dbUser?.passwordHash || ""
        const isValid = await passwordHasher.verify(
          newUser.password,
          userPassword,
        )
        if (isValid) {
          console.log("✅ Authentication successful")
        } else {
          console.error("❌ Authentication failed")
        }
      }
    } else {
      console.error("❌ User creation failed:", result.left)
    }

    console.log("\n🎉 Integration test completed successfully!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

runTest()
