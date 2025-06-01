import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const reminderId = params.id

    console.log("Updating broadcast reminder:", reminderId, data)

    // Calculate new expiry date if expiryDays is provided
    const updateData = { ...data }
    if (data.expiryDays) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + data.expiryDays)
      updateData.expiryDate = expiryDate.toISOString()
      delete updateData.expiryDays
    }

    updateData.updatedAt = new Date().toISOString()

    await db.updateBroadcastReminder(reminderId, updateData)

    return NextResponse.json({
      message: "Reminder updated successfully",
    })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json(
      {
        error: "Failed to update reminder",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reminderId = params.id

    console.log("Deleting broadcast reminder:", reminderId)

    await db.deleteBroadcastReminder(reminderId)

    return NextResponse.json({
      message: "Reminder deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json(
      {
        error: "Failed to delete reminder",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
