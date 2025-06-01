import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const questions = await db.getQuestions()
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, title, content } = await request.json()

    if (!userId || !userName || !title || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const questionId = await db.createQuestion({
      userId,
      userName,
      title,
      content,
      answers: [],
      likes: [],
      dislikes: [],
    })

    return NextResponse.json({ id: questionId, success: true })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
