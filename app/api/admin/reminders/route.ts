import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Creating broadcast reminder:", data)

    // Validate required fields
    if (!data.type || !data.message) {
      return NextResponse.json({ error: "Missing required fields: type and message are required" }, { status: 400 })
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

    // Get all users for broadcast
    const allUsers = await db.getAllUsers()
    const userCount = allUsers.length

    const broadcastReminderData = {
      type: data.type,
      message: data.message,
      sentAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      createdBy: data.createdBy || "system",
      createdByName: createdByName,
      priority: data.priority || "normal",
      isBroadcast: true,
      userCount: userCount,
    }

    // Create broadcast reminder
    const broadcastReminderId = await db.createBroadcastReminder(broadcastReminderData)

    // Create individual reminders for each user
    const individualReminders = allUsers.map(async (user) => {
      const reminderData = {
        userId: user.id,
        userName: user.name,
        type: data.type,
        message: data.message,
        sentAt: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        read: false,
        createdBy: data.createdBy || "system",
        createdByName: createdByName,
        priority: data.priority || "normal",
        broadcastId: broadcastReminderId,
      }
      return db.createReminder(reminderData)
    })

    await Promise.all(individualReminders)

    console.log("Broadcast reminder created with ID:", broadcastReminderId)

    return NextResponse.json({
      message: `Reminder sent to ${userCount} users successfully`,
      broadcastReminder: { id: broadcastReminderId, ...broadcastReminderData },
      userCount: userCount,
    })
  } catch (error) {
    console.error("Error creating broadcast reminder:", error)
    return NextResponse.json(
      {
        error: "Failed to create reminder",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Clean up expired reminders first
    await db.deleteExpiredReminders()

    const reminders = await db.getAllBroadcastReminders()
    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}
