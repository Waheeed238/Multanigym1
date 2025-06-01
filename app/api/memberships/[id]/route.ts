import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const membershipId = params.id
    const membership = await db.getMembership(membershipId)

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 })
    }

    return NextResponse.json(membership)
  } catch (error) {
    console.error("Error fetching membership:", error)
    return NextResponse.json({ error: "Failed to fetch membership" }, { status: 500 })
  }
}
