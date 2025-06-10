import type { Context, Next } from "hono"
import jwt from "jsonwebtoken"
import type { Env } from "../../types/middleware"

interface JwtPayload {
  userId: string
  email: string
  role: string
}

export const authenticate = async (c: Context<Env>, next: Next) => {
  const authorization = c.req.header("Authorization")

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const token = authorization.substring(7)

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret",
    ) as JwtPayload

    // Store user info in context for use in handlers
    c.set("userId", payload.userId)
    c.set("userEmail", payload.email)
    c.set("userRole", payload.role)

    await next()
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401)
  }
}

export const requireAdmin = async (c: Context<Env>, next: Next) => {
  const role = c.get("userRole")

  if (role !== "admin" && role !== "manager") {
    return c.json({ error: "Forbidden: Admin access required" }, 403)
  }

  await next()
}

export const requireManager = async (c: Context<Env>, next: Next) => {
  const role = c.get("userRole")

  if (role !== "admin" && role !== "manager") {
    return c.json({ error: "Forbidden: Manager access required" }, 403)
  }

  await next()
}
