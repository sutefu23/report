import { execSync } from "node:child_process"
import * as path from "node:path"

console.log("🧪 Running All Integration Tests")
console.log("================================\n")

const tests = [
  {
    name: "Authentication Flow",
    file: "simple-auth.test.ts",
  },
  {
    name: "Daily Report Flow",
    file: "daily-report-flow.test.ts",
  },
]

let passedTests = 0
let failedTests = 0

for (const test of tests) {
  console.log(`\n📋 Running: ${test.name}`)
  console.log("─".repeat(40))

  try {
    execSync(`npx tsx ${path.join(__dirname, test.file)}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    })
    passedTests++
    console.log(`\n✅ ${test.name} - PASSED`)
  } catch (error) {
    failedTests++
    console.log(`\n❌ ${test.name} - FAILED`)
  }
}

console.log(`\n${"=".repeat(50)}`)
console.log("📊 Test Summary:")
console.log(`   ✅ Passed: ${passedTests}`)
console.log(`   ❌ Failed: ${failedTests}`)
console.log(`   📋 Total:  ${tests.length}`)
console.log("=".repeat(50))

if (failedTests > 0) {
  console.log("\n❌ Some tests failed!")
  process.exit(1)
} else {
  console.log("\n🎉 All integration tests passed!")
}
