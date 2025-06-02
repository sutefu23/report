import { config } from "dotenv"
import { ulid } from "ulid"
import { createPasswordHasher } from "../auth/password-hasher"
import { disconnectPrisma, getPrismaClient } from "./prisma"

// Load environment variables
config()

async function main() {
  console.log("🌱 Starting database seeding...")

  const prisma = getPrismaClient()

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminUsername = process.env.ADMIN_USERNAME

  // Validate environment variables
  if (!adminEmail || !adminPassword || !adminUsername) {
    throw new Error(
      "Admin credentials not found in environment variables. Please set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_USERNAME in your .env file.",
    )
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [{ email: adminEmail }, { username: adminUsername }],
      },
    })

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists. Skipping creation.")
      return
    }

    // Hash the password
    const passwordHasher = createPasswordHasher()
    const passwordHash = await passwordHasher.hash(adminPassword)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        id: ulid(),
        email: adminEmail,
        username: adminUsername,
        passwordHash,
        role: "admin",
        slackUserId: "", // Empty string as placeholder
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log("✅ Admin user created successfully!")
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Username: ${adminUser.username}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   ID: ${adminUser.id}`)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error("Seed script failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await disconnectPrisma()
  })
