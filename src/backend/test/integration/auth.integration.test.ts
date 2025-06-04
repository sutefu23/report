import { createUserWorkflow } from "@domain/workflows/user-workflow"
import { PasswordHasher } from "@infrastructure/auth/password-hasher"
import { TokenGenerator } from "@infrastructure/auth/token-generator"
import { UserRepository } from "@infrastructure/repositories/user-repository"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import { createTestUser, testUsers } from "./fixtures/test-data"
import {
  cleanupDatabase,
  closeDatabase,
  prisma,
  setupTestDatabase,
} from "./setup"

describe("Authentication Integration Tests", () => {
  let userRepository: UserRepository
  let passwordHasher: PasswordHasher
  let tokenGenerator: TokenGenerator

  beforeAll(async () => {
    await setupTestDatabase()
    userRepository = new UserRepository(prisma)
    passwordHasher = new PasswordHasher()
    tokenGenerator = new TokenGenerator()
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  describe("User Registration Flow", () => {
    it("should register new user and authenticate successfully", async () => {
      // 1. Create new user
      const createUser = createUserWorkflow(userRepository, passwordHasher)
      const newUser = createTestUser({
        email: "newuser@test.com",
        password: "SecurePassword123!",
      })

      const createResult = await createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        departmentId: newUser.departmentId,
      })

      expect(createResult.success).toBe(true)
      if (!createResult.success) return

      const createdUser = createResult.data

      // 2. Verify password was hashed
      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email },
      })
      expect(dbUser?.password).not.toBe(newUser.password)
      expect(dbUser?.password).toMatch(/^\$2b\$/) // bcrypt hash pattern

      // 3. Authenticate with correct password
      const foundUser = await userRepository.findByEmail(newUser.email)
      expect(foundUser).toBeTruthy()
      if (!foundUser) return

      const isValidPassword = await passwordHasher.verify(
        newUser.password,
        foundUser.password,
      )
      expect(isValidPassword).toBe(true)

      // 4. Generate JWT tokens
      const tokens = tokenGenerator.generateTokens({
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      })

      expect(tokens.accessToken).toBeTruthy()
      expect(tokens.refreshToken).toBeTruthy()

      // 5. Verify token content
      const decoded = tokenGenerator.verifyAccessToken(tokens.accessToken)
      expect(decoded).toMatchObject({
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      })
    })

    it("should reject duplicate email registration", async () => {
      // 1. Create first user
      const createUser = createUserWorkflow(userRepository, passwordHasher)
      const firstUser = createTestUser({ email: "duplicate@test.com" })

      await createUser({
        email: firstUser.email,
        password: firstUser.password,
        name: firstUser.name,
        role: firstUser.role,
        departmentId: firstUser.departmentId,
      })

      // 2. Try to create user with same email
      const duplicateResult = await createUser({
        email: firstUser.email, // Same email
        password: "DifferentPassword123!",
        name: "Different Name",
        role: "employee",
        departmentId: firstUser.departmentId,
      })

      expect(duplicateResult.success).toBe(false)
      if (duplicateResult.success) return

      expect(duplicateResult.error.code).toBe("USER_ALREADY_EXISTS")
      expect(duplicateResult.error.message).toContain("already exists")
    })

    it("should validate email format", async () => {
      const createUser = createUserWorkflow(userRepository, passwordHasher)

      const invalidEmails = [
        "notanemail",
        "missing@domain",
        "@nodomain.com",
        "spaces in@email.com",
        "",
      ]

      for (const invalidEmail of invalidEmails) {
        const result = await createUser({
          email: invalidEmail,
          password: "ValidPassword123!",
          name: "Test User",
          role: "employee",
          departmentId: testUsers.member.departmentId,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_EMAIL")
        }
      }
    })

    it("should validate password requirements", async () => {
      const createUser = createUserWorkflow(userRepository, passwordHasher)

      const weakPasswords = [
        "short", // Too short
        "nouppercase123!", // No uppercase
        "NOLOWERCASE123!", // No lowercase
        "NoNumbers!", // No numbers
        "NoSpecialChars123", // No special characters
        "", // Empty
      ]

      for (const weakPassword of weakPasswords) {
        const result = await createUser({
          email: `user-${Date.now()}@test.com`,
          password: weakPassword,
          name: "Test User",
          role: "employee",
          departmentId: testUsers.member.departmentId,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.code).toBe("WEAK_PASSWORD")
        }
      }
    })
  })

  describe("Authentication Flow", () => {
    it("should authenticate user with correct credentials", async () => {
      // 1. Create user
      const createUser = createUserWorkflow(userRepository, passwordHasher)
      const testUser = createTestUser()

      await createUser({
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
        role: testUser.role,
        departmentId: testUser.departmentId,
      })

      // 2. Find user by email
      const foundUser = await userRepository.findByEmail(testUser.email)
      expect(foundUser).toBeTruthy()
      if (!foundUser) return

      // 3. Verify password
      const isValid = await passwordHasher.verify(
        testUser.password,
        foundUser.password,
      )
      expect(isValid).toBe(true)

      // 4. Generate tokens
      const tokens = tokenGenerator.generateTokens({
        userId: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      })

      expect(tokens).toHaveProperty("accessToken")
      expect(tokens).toHaveProperty("refreshToken")
    })

    it("should reject invalid password", async () => {
      // 1. Create user
      const createUser = createUserWorkflow(userRepository, passwordHasher)
      const testUser = createTestUser()

      await createUser({
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
        role: testUser.role,
        departmentId: testUser.departmentId,
      })

      // 2. Try to authenticate with wrong password
      const foundUser = await userRepository.findByEmail(testUser.email)
      expect(foundUser).toBeTruthy()
      if (!foundUser) return

      const isValid = await passwordHasher.verify(
        "WrongPassword123!",
        foundUser.password,
      )
      expect(isValid).toBe(false)
    })

    it("should handle non-existent user", async () => {
      const foundUser = await userRepository.findByEmail("nonexistent@test.com")
      expect(foundUser).toBeNull()
    })
  })

  describe("Token Management", () => {
    it("should generate and verify access tokens", async () => {
      const payload = {
        userId: testUsers.member.id,
        email: testUsers.member.email,
        role: testUsers.member.role,
      }

      const tokens = tokenGenerator.generateTokens(payload)
      const decoded = tokenGenerator.verifyAccessToken(tokens.accessToken)

      expect(decoded).toMatchObject(payload)
    })

    it("should reject invalid tokens", async () => {
      expect(() => {
        tokenGenerator.verifyAccessToken("invalid.token.here")
      }).toThrow()
    })

    it("should handle expired tokens", async () => {
      // This would require mocking time or waiting for expiration
      // For now, we'll test that tokens have expiration set
      const tokens = tokenGenerator.generateTokens({
        userId: testUsers.member.id,
        email: testUsers.member.email,
        role: testUsers.member.role,
      })

      const decoded = tokenGenerator.verifyAccessToken(tokens.accessToken)
      expect(decoded).toHaveProperty("exp")
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000)
    })
  })
})
