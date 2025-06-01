import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { questionId, userId } = await request.json()

    if (!questionId || !userId) {
      return NextResponse.json({ error: "Question ID and User ID are required" }, { status: 400 })
    }

    await db.likeQuestion(questionId, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error liking question:", error)
    return NextResponse.json({ error: "Failed to like question" }, { status: 500 })
  }
}
