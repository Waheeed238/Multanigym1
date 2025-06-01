import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const memberships = await db.getMemberships()
    return NextResponse.json(memberships)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 })
  }
}
