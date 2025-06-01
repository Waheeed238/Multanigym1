import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const reminders = await db.getAllBroadcastReminders()
    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching broadcast reminders:", error)
    return NextResponse.json({ error: "Failed to fetch broadcast reminders" }, { status: 500 })
  }
}
