import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { reminderId } = await request.json()

    await db.updateReminder(reminderId, { read: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark reminder as read" }, { status: 500 })
  }
}
