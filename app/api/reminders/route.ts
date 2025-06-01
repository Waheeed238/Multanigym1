import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Clean up expired reminders first
    await db.deleteExpiredReminders()

    const reminders = await db.getUserReminders(userId)
    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Creating reminder:", data)

    // Validate required fields
    if (!data.userId || !data.message || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields: userId, message, and type are required" },
        { status: 400 },
      )
    }

    // Get user name
    let userName = "Unknown User"
    try {
      const user = await db.getUser(data.userId)
      if (user) {
        userName = user.name
      }
    } catch (error) {
      console.log("Could not fetch user name, using default")
    }

    // Get creator name
    let createdByName = "System"
    if (data.createdBy) {
      try {
        const creator = await db.getUser(data.createdBy)
        if (creator) {
          createdByName = creator.name
        }
      } catch (error) {
        console.log("Could not fetch creator name, using default")
      }
    }

    // Calculate expiry date (default 1 day from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + (data.expiryDays || 1))

    const reminderData = {
      userId: data.userId,
      userName: userName,
      type: data.type,
      message: data.message,
      sentAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      read: false,
      createdBy: data.createdBy || "system",
      createdByName: createdByName,
      priority: data.priority || "normal",
    }

    const reminderId = await db.createReminder(reminderData)
    console.log("Reminder created with ID:", reminderId)

    return NextResponse.json({
      message: "Reminder created successfully",
      reminder: { id: reminderId, ...reminderData },
    })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json(
      {
        error: "Failed to create reminder",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
