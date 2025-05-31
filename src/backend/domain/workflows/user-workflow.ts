import { ulid } from "ulid"
import {
  type DomainError,
  alreadyExists,
  notFound,
  unauthorized,
  validationError,
} from "../errors"
import {
  type AuthToken,
  type AuthenticateUserInput,
  type CreateUserInput,
  type Either,
  type UpdateUserInput,
  type User,
  createUserId,
  left,
  right,
} from "../types"

export type UserRepository = {
  findById: (id: string) => Promise<User | null>
  findByEmail: (email: string) => Promise<User | null>
  create: (user: User & { password: string }) => Promise<User>
  update: (user: User) => Promise<User>
}

export type PasswordHasher = {
  hash: (password: string) => Promise<string>
  verify: (password: string, hash: string) => Promise<boolean>
}

export type TokenGenerator = {
  generate: (userId: string, role: string) => AuthToken
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): Either<DomainError, string> => {
  if (password.length < 8) {
    return left(validationError("パスワードは8文字以上である必要があります"))
  }

  if (!/[A-Z]/.test(password)) {
    return left(
      validationError(
        "パスワードには少なくとも1つの大文字を含める必要があります",
      ),
    )
  }

  if (!/[a-z]/.test(password)) {
    return left(
      validationError(
        "パスワードには少なくとも1つの小文字を含める必要があります",
      ),
    )
  }

  if (!/[0-9]/.test(password)) {
    return left(
      validationError(
        "パスワードには少なくとも1つの数字を含める必要があります",
      ),
    )
  }

  return right(password)
}

export const createUserWorkflow =
  (userRepo: UserRepository, passwordHasher: PasswordHasher) =>
  async (input: CreateUserInput): Promise<Either<DomainError, User>> => {
    if (!validateEmail(input.email)) {
      return left(validationError("有効なメールアドレスを入力してください"))
    }

    const passwordValidation = validatePassword(input.password)
    if (passwordValidation.tag === "Left") {
      return passwordValidation
    }

    const existingUser = await userRepo.findByEmail(input.email)
    if (existingUser) {
      return left(alreadyExists("このメールアドレスは既に使用されています"))
    }

    const hashedPassword = await passwordHasher.hash(input.password)
    const now = new Date()

    const user: User & { password: string } = {
      id: createUserId(ulid()),
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role,
      departmentId: input.departmentId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const created = await userRepo.create(user)
    return right(created)
  }

export const updateUserWorkflow =
  (userRepo: UserRepository) =>
  async (input: UpdateUserInput): Promise<Either<DomainError, User>> => {
    const user = await userRepo.findById(input.id)
    if (!user) {
      return left(notFound("ユーザーが見つかりません"))
    }

    const updated: User = {
      ...user,
      name: input.name ?? user.name,
      role: input.role ?? user.role,
      departmentId: input.departmentId ?? user.departmentId,
      isActive: input.isActive ?? user.isActive,
      updatedAt: new Date(),
    }

    const result = await userRepo.update(updated)
    return right(result)
  }

export const authenticateUserWorkflow =
  (
    userRepo: UserRepository,
    passwordHasher: PasswordHasher,
    tokenGenerator: TokenGenerator,
  ) =>
  async (
    input: AuthenticateUserInput,
  ): Promise<Either<DomainError, AuthToken>> => {
    const user = await userRepo.findByEmail(input.email)
    if (!user) {
      return left(
        unauthorized("メールアドレスまたはパスワードが正しくありません"),
      )
    }

    if (!user.isActive) {
      return left(unauthorized("このアカウントは無効化されています"))
    }

    if (!user.password) {
      return left(unauthorized("パスワードが設定されていません"))
    }

    const isValidPassword = await passwordHasher.verify(
      input.password,
      user.password,
    )
    if (!isValidPassword) {
      return left(
        unauthorized("メールアドレスまたはパスワードが正しくありません"),
      )
    }

    const token = tokenGenerator.generate(user.id, user.role)
    return right(token)
  }
