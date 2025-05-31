import type { DomainError } from "../../domain/errors"
import {
  type AuthToken,
  type AuthenticateUserInput,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
  isLeft,
} from "../../domain/types"
import {
  type PasswordHasher,
  type TokenGenerator,
  type UserRepository,
  authenticateUserWorkflow,
  createUserWorkflow,
  updateUserWorkflow,
} from "../../domain/workflows"

export type UserService = {
  create: (input: CreateUserInput) => Promise<User>
  update: (input: UpdateUserInput) => Promise<User>
  authenticate: (input: AuthenticateUserInput) => Promise<AuthToken>
  findById: (id: string) => Promise<User | null>
  findByEmail: (email: string) => Promise<User | null>
}

export const createUserService = (
  userRepo: UserRepository,
  passwordHasher: PasswordHasher,
  tokenGenerator: TokenGenerator,
): UserService => {
  const handleWorkflowResult = async <T>(
    workflow: Promise<
      { tag: "Left"; left: DomainError } | { tag: "Right"; right: T }
    >,
  ): Promise<T> => {
    const result = await workflow
    if (isLeft(result)) {
      throw new Error(result.left.message)
    }
    return result.right
  }

  return {
    create: async (input: CreateUserInput): Promise<User> => {
      const workflow = createUserWorkflow(userRepo, passwordHasher)
      return handleWorkflowResult(workflow(input))
    },

    update: async (input: UpdateUserInput): Promise<User> => {
      const workflow = updateUserWorkflow(userRepo)
      return handleWorkflowResult(workflow(input))
    },

    authenticate: async (input: AuthenticateUserInput): Promise<AuthToken> => {
      const workflow = authenticateUserWorkflow(
        userRepo,
        passwordHasher,
        tokenGenerator,
      )
      return handleWorkflowResult(workflow(input))
    },

    findById: async (id: string): Promise<User | null> => {
      return userRepo.findById(id) as Promise<User | null>
    },

    findByEmail: async (email: string): Promise<User | null> => {
      return userRepo.findByEmail(email)
    },
  }
}
