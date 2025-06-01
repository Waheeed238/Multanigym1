import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const reminderId = params.id

    console.log("Updating reminder:", reminderId, data)

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await db.updateReminder(reminderId, updateData)

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

    console.log("Deleting reminder:", reminderId)

    await db.deleteReminder(reminderId)

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
