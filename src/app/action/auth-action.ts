"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type ActionResult = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

// Mock database - replace with your actual database
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "password123", // In real app, this would be hashed
    role: {
      id: "admin",
      name: "Administrator",
      description: "Full system access",
      permissions: [
        { id: "1", name: "user.create", description: "Create users", resource: "user", action: "create" },
        { id: "2", name: "user.read", description: "View users", resource: "user", action: "read" },
        { id: "3", name: "user.update", description: "Update users", resource: "user", action: "update" },
        { id: "4", name: "user.delete", description: "Delete users", resource: "user", action: "delete" },
        { id: "5", name: "role.manage", description: "Manage roles", resource: "role", action: "manage" },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    password: "password123",
    role: {
      id: "user",
      name: "User",
      description: "Basic user access",
      permissions: [{ id: "2", name: "user.read", description: "View users", resource: "user", action: "read" }],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
]

export async function signup(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const validatedFields = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = mockUsers.find((user) => user.email === email)
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      }
    }

    // Create new user (in real app, hash password and save to database)
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password, // Hash this in production
      role: {
        id: "user",
        name: "User",
        description: "Basic user access",
        permissions: [{ id: "2", name: "user.read", description: "View users", resource: "user", action: "read" }],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    mockUsers.push(newUser)

    // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set("session", JSON.stringify({ userId: newUser.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return {
      success: true,
      message: "Account created successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}

export async function login(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        message: "Account is deactivated. Please contact support.",
      }
    }

    // Set session cookie

    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return {
      success: true,
      message: "Login successful",
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
  
    const session =cookieStore.get("session")
    if (!session) return null

    const { userId } = JSON.parse(session.value)
    const user = mockUsers.find((u) => u.id === userId)

    return user || null
  } catch {
    return null
  }
}
