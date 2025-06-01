import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { questionId, userId, userName, content } = await request.json()

    if (!questionId || !userId || !userName || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const answer = {
      id: "", // Will be generated in the database function
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    }

    await db.addAnswerToQuestion(questionId, answer)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding answer:", error)
    return NextResponse.json({ error: "Failed to add answer" }, { status: 500 })
  }
}
