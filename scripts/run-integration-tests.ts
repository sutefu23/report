import { execSync } from "node:child_process"
import * as path from "node:path"
import * as dotenv from "dotenv"

// Load test environment
dotenv.config({ path: path.resolve(__dirname, "../../config/env/.env.test") })

console.log("🧪 Running integration tests...")
console.log("📊 Test database:", process.env.DATABASE_URL)

try {
  // Run auth integration tests
  console.log("\n🔐 Running authentication integration tests...")
  execSync("npx tsx ../../tests/integration/backend/auth.integration.test.ts", {
    stdio: "inherit",
    env: process.env,
  })

  // Run daily report integration tests
  console.log("\n📝 Running daily report integration tests...")
  execSync(
    "npx tsx ../../tests/integration/backend/daily-report.integration.test.ts",
    {
      stdio: "inherit",
      env: process.env,
    },
  )

  console.log("\n✅ All integration tests passed!")
} catch (error) {
  console.error("\n❌ Integration tests failed!")
  process.exit(1)
}
