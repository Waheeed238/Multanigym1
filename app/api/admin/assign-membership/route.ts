import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId, membershipId, planType, startDate, expiryDate, assignedBy } = await request.json()

    // Get the user to check if they already have a membership
    const user = await db.getUser(userId)

    let finalExpiryDate = new Date(expiryDate)

    // If user already has a membership, add the days to the existing expiry date
    if (user && user.membershipExpiry) {
      const currentExpiry = new Date(user.membershipExpiry)
      const newExpiry = new Date(expiryDate)

      // Only extend if the current expiry is in the future
      if (currentExpiry > new Date()) {
        // Calculate days difference between new expiry and start date
        const daysDifference = Math.ceil((newExpiry.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

        // Add those days to the current expiry date
        finalExpiryDate = new Date(currentExpiry)
        finalExpiryDate.setDate(finalExpiryDate.getDate() + daysDifference)
      }
    }

    // Update user with membership information
    await db.updateUser(userId, {
      membershipId,
      membershipType: planType,
      membershipStartDate: startDate,
      membershipExpiry: finalExpiryDate.toISOString(),
    })

    // Create membership assignment record
    const assignmentId = await db.createMembershipAssignment({
      userId,
      membershipId,
      planType,
      startDate,
      expiryDate: finalExpiryDate.toISOString(),
      assignedBy,
      assignedAt: new Date().toISOString(),
      isExtension: user?.membershipExpiry ? true : false,
    })

    return NextResponse.json({
      success: true,
      assignmentId,
      expiryDate: finalExpiryDate.toISOString(),
      isExtension: user?.membershipExpiry ? true : false,
    })
  } catch (error) {
    console.error("Error assigning membership:", error)
    return NextResponse.json({ error: "Failed to assign membership" }, { status: 500 })
  }
}
