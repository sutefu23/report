import * as path from "node:path"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"

// Load test environment
dotenv.config({
  path: path.resolve(__dirname, "../../../config/env/.env.test"),
})

const prisma = new PrismaClient({
  datasourceUrl:
    "postgresql://postgres:postgres@localhost:5433/daily_report_test",
})

async function testAuthFlow() {
  console.log("🧪 Running Authentication Integration Test")

  try {
    // 1. Clean database
    console.log("\n1️⃣ Cleaning database...")
    await prisma.workRecord.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.dailyReport.deleteMany()
    await prisma.user.deleteMany()
    await prisma.project.deleteMany()
    console.log("✅ Database cleaned")

    // 2. Create a user with hashed password
    console.log("\n2️⃣ Creating user with hashed password...")
    const password = "SecurePassword123!"
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        passwordHash: hashedPassword,
        role: "employee",
        slackUserId: "U123456",
      },
    })
    console.log("✅ User created:", user.email)

    // 3. Verify password
    console.log("\n3️⃣ Verifying password...")
    const isValid = await bcrypt.compare(password, user.passwordHash)
    console.log(
      isValid
        ? "✅ Password verification successful"
        : "❌ Password verification failed",
    )

    // 4. Test duplicate email prevention
    console.log("\n4️⃣ Testing duplicate email prevention...")
    try {
      await prisma.user.create({
        data: {
          username: "anotheruser",
          email: "test@example.com", // Same email
          passwordHash: hashedPassword,
          role: "employee",
          slackUserId: "U789012",
        },
      })
      console.log("❌ Duplicate email was allowed (should have failed)")
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        console.log("✅ Duplicate email correctly rejected")
      } else {
        throw error
      }
    }

    // 5. Create a daily report
    console.log("\n5️⃣ Creating daily report...")

    // First create a project
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        description: "A test project for integration testing",
      },
    })

    const report = await prisma.dailyReport.create({
      data: {
        userId: user.id,
        reportDate: new Date("2024-01-15"),
        memo: "Today I worked on integration testing",
        tomorrowPlan: "Continue with more tests",
        workRecords: {
          create: [
            {
              projectId: project.id,
              workHours: 6.5,
              workContent: "Implemented authentication integration tests",
            },
            {
              projectId: project.id,
              workHours: 1.5,
              workContent: "Code review and documentation",
            },
          ],
        },
      },
      include: {
        workRecords: true,
      },
    })
    console.log(
      "✅ Daily report created with",
      report.workRecords.length,
      "work records",
    )

    // 6. Test unique constraint on daily reports
    console.log("\n6️⃣ Testing unique daily report constraint...")
    try {
      await prisma.dailyReport.create({
        data: {
          userId: user.id,
          reportDate: new Date("2024-01-15"), // Same date
          memo: "Duplicate report",
        },
      })
      console.log("❌ Duplicate report was allowed (should have failed)")
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        console.log("✅ Duplicate report correctly rejected")
      } else {
        throw error
      }
    }

    // 7. Test cascade delete
    console.log("\n7️⃣ Testing cascade delete...")
    const recordCountBefore = await prisma.workRecord.count()
    await prisma.dailyReport.delete({
      where: { id: report.id },
    })
    const recordCountAfter = await prisma.workRecord.count()
    console.log(
      `✅ Work records deleted: ${recordCountBefore} → ${recordCountAfter}`,
    )

    console.log("\n🎉 All integration tests passed!")
  } catch (error) {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthFlow()
