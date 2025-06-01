import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST() {
  try {
    await db.clearAllData()
    return NextResponse.json({ message: "Database cleared successfully" })
  } catch (error) {
    console.error("Clear database error:", error)
    return NextResponse.json(
      {
        error: "Failed to clear database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
