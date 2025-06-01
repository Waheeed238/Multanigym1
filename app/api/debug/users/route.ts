import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const users = await db.getAllUsers()

    // Remove passwords for security
    const safeUsers = users.map(({ password, ...user }) => ({
      ...user,
      passwordExists: !!password,
    }))

    return NextResponse.json({
      count: users.length,
      users: safeUsers,
    })
  } catch (error) {
    console.error("Debug users error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
