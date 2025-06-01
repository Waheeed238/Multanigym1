import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Get user details
    const user = await db.getUser(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // In a real application, you would send an email or SMS here
    // For now, we'll just log the reminder
    console.log(`Reminder sent to ${user.name} (${user.email}) about membership expiry`)

    // Create reminder record
    const reminderId = await db.createReminder({
      userId,
      type: "membership_expiry",
      message: "Your membership is expiring soon. Please renew to continue enjoying our services.",
      sentAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, reminderId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
