import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/database"
import type { User } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Registration request data:", data)

    // Validate required fields
    if (!data.email || !data.password || !data.name) {
      console.error("Missing required fields:", { email: !!data.email, password: !!data.password, name: !!data.name })
      return NextResponse.json(
        { error: "Missing required fields: email, password, and name are required" },
        { status: 400 },
      )
    }

    // Check if email already exists
    try {
      const existingUser = await db.getUserByEmail(data.email)
      if (existingUser) {
        console.log("Email already exists:", data.email)
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }
    } catch (error) {
      console.error("Error checking existing email:", error)
    }

    // Check if username already exists (if provided)
    if (data.username) {
      try {
        const existingUsername = await db.getUserByUsername(data.username)
        if (existingUsername) {
          console.log("Username already exists:", data.username)
          return NextResponse.json({ error: "Username already taken" }, { status: 400 })
        }
      } catch (error) {
        console.error("Error checking existing username:", error)
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Calculate age from date of birth if provided
    let age = data.age || 0
    if (data.dateOfBirth && !age) {
      const birthDate = new Date(data.dateOfBirth)
      const today = new Date()
      age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }

    // Create user object with proper defaults
    const userData: Omit<User, "id"> = {
      name: data.name,
      email: data.email,
      username: data.username || data.email.split("@")[0], // Default username from email
      password: hashedPassword,
      phone: data.phone || "",
      age: age,
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      weight: Number.parseFloat(data.weight) || 0,
      height: data.height || 0,
      goals: Array.isArray(data.goals) ? data.goals : data.goals ? [data.goals] : [],
      experienceLevel: data.experienceLevel || "Beginner",
      profilePic: data.profilePic || null,
      role: "user",
      isAdmin: false,
      createdAt: new Date().toISOString(),
    }

    console.log("Creating user with data:", { ...userData, password: "[HIDDEN]" })

    // Save user to database
    const userId = await db.createUser(userData)
    console.log("User created with ID:", userId)

    // Create response user object (without password)
    const responseUser: User = {
      id: userId,
      ...userData,
      password: undefined as any, // Remove password from response
    }

    // Remove password completely
    delete (responseUser as any).password

    console.log("Registration successful for user:", responseUser.email)

    return NextResponse.json({
      message: "User registered successfully",
      user: responseUser,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Failed to register user",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
