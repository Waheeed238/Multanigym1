import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId, dietPlan } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!dietPlan || !Array.isArray(dietPlan)) {
      return NextResponse.json({ error: "Diet plan is required and must be an array" }, { status: 400 })
    }

    console.log("Saving diet plan for user:", userId)
    console.log("Diet plan data:", dietPlan)

    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

    // Save or update today's diet plan
    const dietId = await db.saveDietPlan(userId, {
      foods: dietPlan,
      date: today,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    console.log("Diet plan saved with ID:", dietId)

    return NextResponse.json({
      success: true,
      dietId,
      message: "Diet plan saved successfully",
    })
  } catch (error) {
    console.error("Error saving diet plan:", error)
    return NextResponse.json(
      {
        error: "Failed to save diet plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("Loading diet plan for user:", userId, "date:", date)

    // Get diet plan for specific date
    const dietPlan = await db.getDietPlanByDate(userId, date)

    console.log("Found diet plan:", dietPlan)

    if (dietPlan) {
      return NextResponse.json({
        success: true,
        dietPlan: dietPlan.foods || [],
        date: dietPlan.date,
        lastUpdated: dietPlan.updatedAt,
      })
    } else {
      return NextResponse.json({
        success: true,
        dietPlan: [],
        date,
        message: "No diet plan found for this date",
      })
    }
  } catch (error) {
    console.error("Error loading diet plan:", error)
    return NextResponse.json(
      {
        error: "Failed to load diet plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
