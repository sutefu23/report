import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"

// Mock environment variables for testing
process.env.NODE_ENV = "test"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db"
process.env.JWT_SECRET = "test-jwt-secret"

// Global test setup
beforeAll(async () => {
  console.log("🧪 Starting test suite...")
})

afterAll(async () => {
  console.log("✅ Test suite completed")
})

beforeEach(() => {
  // Reset all mocks before each test
})

afterEach(() => {
  // Clean up after each test
})
