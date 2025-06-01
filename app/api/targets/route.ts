import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  console.log("POST /api/targets called")

  try {
    const body = await request.json()
    console.log("Request body:", body)

    const { userId, targets } = body

    if (!userId) {
      console.error("No userId provided")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!targets) {
      console.error("No targets provided")
      return NextResponse.json({ error: "Targets data is required" }, { status: 400 })
    }

    console.log("Connecting to database...")
    const client = await connectToDatabase
    const db = client.db()
    const targetsCollection = db.collection("targets")

    const targetData = {
      userId,
      protein: Number(targets.protein) || 0,
      calories: Number(targets.calories) || 0,
      fat: Number(targets.fat) || 0,
      carbs: Number(targets.carbs) || 0,
      fiber: Number(targets.fiber) || 0,
      sugar: Number(targets.sugar) || 0,
      updatedAt: new Date().toISOString(),
    }

    console.log("Saving target data:", targetData)

    // Upsert the targets (update if exists, insert if not)
    const result = await targetsCollection.updateOne({ userId }, { $set: targetData }, { upsert: true })

    console.log("Database operation result:", result)

    return NextResponse.json({
      success: true,
      message: "Targets saved successfully",
      data: targetData,
    })
  } catch (error) {
    console.error("Error in POST /api/targets:", error)
    return NextResponse.json(
      {
        error: "Failed to save targets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("GET /api/targets called")

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("Getting targets for userId:", userId)

    if (!userId) {
      console.error("No userId provided in GET request")
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const client = await connectToDatabase
    const db = client.db()
    const targetsCollection = db.collection("targets")

    const targets = await targetsCollection.findOne({ userId })
    console.log("Found targets:", targets)

    if (!targets) {
      console.log("No targets found, returning defaults")
      // Return default targets if none found
      return NextResponse.json({
        protein: 150,
        calories: 2500,
        fat: 80,
        carbs: 300,
        fiber: 25,
        sugar: 50,
      })
    }

    // Remove MongoDB _id and userId from response
    const { _id, userId: uid, updatedAt, ...targetData } = targets

    console.log("Returning target data:", targetData)
    return NextResponse.json(targetData)
  } catch (error) {
    console.error("Error in GET /api/targets:", error)
    return NextResponse.json(
      {
        error: "Failed to get targets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
