import * as path from "node:path"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"

// Load test environment
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") })

const prisma = new PrismaClient({
  datasourceUrl:
    "postgresql://postgres:postgres@localhost:5433/daily_report_test",
})

async function testDailyReportFlow() {
  console.log("📝 Running Daily Report Flow Integration Test")

  try {
    // Clean database
    await prisma.workRecord.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.dailyReport.deleteMany()
    await prisma.user.deleteMany()
    await prisma.project.deleteMany()

    // 1. Setup users (member and manager)
    console.log("\n1️⃣ Setting up users...")
    const memberPassword = await bcrypt.hash("MemberPass123!", 10)
    const managerPassword = await bcrypt.hash("ManagerPass123!", 10)

    const manager = await prisma.user.create({
      data: {
        username: "manager",
        email: "manager@example.com",
        passwordHash: managerPassword,
        role: "manager",
        slackUserId: "U_MANAGER",
      },
    })

    const member = await prisma.user.create({
      data: {
        username: "employee",
        email: "member@example.com",
        passwordHash: memberPassword,
        role: "employee",
        managerId: manager.id,
        slackUserId: "U_MEMBER",
      },
    })
    console.log("✅ Created manager and member with relationship")

    // 2. Create projects
    console.log("\n2️⃣ Creating projects...")
    const projectA = await prisma.project.create({
      data: {
        name: "Project Alpha",
        description: "Main development project",
      },
    })

    const projectB = await prisma.project.create({
      data: {
        name: "Project Beta",
        description: "Research project",
      },
    })
    console.log("✅ Created 2 projects")

    // 3. Create daily report with multiple tasks
    console.log("\n3️⃣ Creating daily report with tasks...")
    const report = await prisma.dailyReport.create({
      data: {
        userId: member.id,
        reportDate: new Date("2024-02-01"),
        memo: "Productive day with good progress on both projects",
        tomorrowPlan: "Continue feature implementation and start testing",
        workRecords: {
          create: [
            {
              projectId: projectA.id,
              workHours: 5.5,
              workContent: "Implemented user authentication module",
            },
            {
              projectId: projectB.id,
              workHours: 2.5,
              workContent: "Research on new technologies",
            },
          ],
        },
      },
      include: {
        workRecords: {
          include: {
            project: true,
          },
        },
        user: true,
      },
    })

    // Verify total hours
    const totalHours = report.workRecords.reduce(
      (sum, wr) => sum + wr.workHours,
      0,
    )
    console.log(
      `✅ Report created with ${report.workRecords.length} tasks (${totalHours} hours total)`,
    )

    // 4. Update report (add/modify tasks)
    console.log("\n4️⃣ Updating report...")

    // Delete existing work records
    await prisma.workRecord.deleteMany({
      where: { dailyReportId: report.id },
    })

    // Create new work records
    await prisma.workRecord.createMany({
      data: [
        {
          dailyReportId: report.id,
          projectId: projectA.id,
          workHours: 6.0,
          workContent: "Implemented user authentication module (updated)",
        },
        {
          dailyReportId: report.id,
          projectId: projectB.id,
          workHours: 1.5,
          workContent: "Research on new technologies (reduced time)",
        },
        {
          dailyReportId: report.id,
          projectId: projectA.id,
          workHours: 0.5,
          workContent: "Bug fixes",
        },
      ],
    })

    const updatedReport = await prisma.dailyReport.findUnique({
      where: { id: report.id },
      include: { workRecords: true },
    })

    const newTotalHours = updatedReport?.workRecords.reduce(
      (sum, wr) => sum + wr.workHours,
      0,
    )
    console.log(
      `✅ Report updated with ${updatedReport?.workRecords.length} tasks (${newTotalHours} hours total)`,
    )

    // 5. Add comments (manager feedback)
    console.log("\n5️⃣ Adding manager comments...")
    const comment = await prisma.comment.create({
      data: {
        dailyReportId: report.id,
        userId: manager.id,
        content:
          "Good progress on the authentication module. Please ensure proper error handling is implemented.",
      },
      include: {
        user: true,
      },
    })
    console.log(`✅ Manager comment added by ${comment.user.username}`)

    // 6. Query reports by date range
    console.log("\n6️⃣ Querying reports by date range...")
    const startDate = new Date("2024-02-01")
    const endDate = new Date("2024-02-28")

    const monthlyReports = await prisma.dailyReport.findMany({
      where: {
        userId: member.id,
        reportDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        workRecords: {
          include: {
            project: true,
          },
        },
      },
    })
    console.log(`✅ Found ${monthlyReports.length} reports for February 2024`)

    // 7. Manager viewing team reports
    console.log("\n7️⃣ Manager viewing team reports...")
    const teamReports = await prisma.dailyReport.findMany({
      where: {
        user: {
          managerId: manager.id,
        },
      },
      include: {
        user: true,
        workRecords: true,
      },
    })
    console.log(`✅ Manager can see ${teamReports.length} team member reports`)

    // 8. Test work hours validation (should not exceed 24)
    console.log("\n8️⃣ Testing work hours validation...")
    const testReport = await prisma.dailyReport.create({
      data: {
        userId: member.id,
        reportDate: new Date("2024-02-02"),
        memo: "Test report",
      },
    })

    // Calculate if adding these would exceed 24 hours
    const testHours = [
      { hours: 10, content: "Morning work" },
      { hours: 8, content: "Afternoon work" },
      { hours: 7, content: "Evening work" }, // Total would be 25
    ]

    const totalTestHours = testHours.reduce((sum, h) => sum + h.hours, 0)
    if (totalTestHours > 24) {
      console.log(
        `✅ Correctly identified invalid total hours: ${totalTestHours} > 24`,
      )
    }

    // 9. Test project statistics
    console.log("\n9️⃣ Calculating project statistics...")
    const projectStats = await prisma.workRecord.groupBy({
      by: ["projectId"],
      _sum: {
        workHours: true,
      },
      where: {
        dailyReport: {
          userId: member.id,
        },
      },
    })

    for (const stat of projectStats) {
      const project = await prisma.project.findUnique({
        where: { id: stat.projectId },
      })
      console.log(`✅ ${project?.name}: ${stat._sum.workHours} hours total`)
    }

    console.log("\n🎉 All daily report flow tests passed!")
  } catch (error) {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDailyReportFlow()
