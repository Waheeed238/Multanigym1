import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST() {
  try {
    // Workout Plan memberships
    const workoutPlans = [
      {
        name: "Workout Plan - Monthly",
        duration: 1,
        price: 1000,
        pricePerMonth: 1000,
        features: [
          "Access to all gym equipment",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
        ],
        category: "workout",
        description: "Perfect for beginners starting their fitness journey",
        bestFor: "Beginners and casual fitness enthusiasts",
        badge: "Popular",
      },
      {
        name: "Workout Plan - Quarterly",
        duration: 3,
        price: 2600,
        pricePerMonth: 867,
        features: [
          "Access to all gym equipment",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
          "Monthly progress tracking",
        ],
        category: "workout",
        description: "3-month commitment with better value",
        bestFor: "Those ready to commit to a fitness routine",
        badge: "Best Value",
      },
      {
        name: "Workout Plan - Half Yearly",
        duration: 6,
        price: 4900,
        pricePerMonth: 817,
        features: [
          "Access to all gym equipment",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
          "Monthly progress tracking",
          "Nutrition guidance",
          "Free guest passes (2 per month)",
        ],
        category: "workout",
        description: "6-month plan with additional benefits",
        bestFor: "Serious fitness enthusiasts",
        badge: "Great Savings",
      },
      {
        name: "Workout Plan - Yearly",
        duration: 12,
        price: 9600,
        pricePerMonth: 800,
        features: [
          "Access to all gym equipment",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
          "Monthly progress tracking",
          "Nutrition guidance",
          "Free guest passes (4 per month)",
          "Priority booking for classes",
          "Annual health checkup",
        ],
        category: "workout",
        description: "Best value annual membership",
        bestFor: "Dedicated fitness enthusiasts",
        badge: "Maximum Savings",
      },
    ]

    // Gym + Cardio Plan memberships
    const gymCardioPlans = [
      {
        name: "Gym + Cardio Plan - Monthly",
        duration: 1,
        price: 1400,
        pricePerMonth: 1400,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
        ],
        category: "gym-cardio",
        description: "Complete gym and cardio access",
        bestFor: "Those wanting comprehensive fitness options",
        badge: "Complete Access",
      },
      {
        name: "Gym + Cardio Plan - Quarterly",
        duration: 3,
        price: 3700,
        pricePerMonth: 1233,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
          "Monthly progress tracking",
          "Group cardio classes",
        ],
        category: "gym-cardio",
        description: "3-month complete fitness package",
        bestFor: "Cardio enthusiasts and strength trainers",
        badge: "Best Value",
      },
      {
        name: "Gym + Cardio Plan - Half Yearly",
        duration: 6,
        price: 6800,
        pricePerMonth: 1133,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
          "Monthly progress tracking",
          "Group cardio classes",
          "Nutrition guidance",
          "Free guest passes (2 per month)",
          "Personal training session (1 per month)",
        ],
        category: "gym-cardio",
        description: "6-month premium fitness experience",
        bestFor: "Serious fitness enthusiasts wanting variety",
        badge: "Premium",
      },
      {
        name: "Gym + Cardio Plan - Yearly",
        duration: 12,
        price: 12800,
        pricePerMonth: 1067,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Basic fitness assessment",
          "Monthly progress tracking",
          "Group cardio classes",
          "Nutrition guidance",
          "Free guest passes (4 per month)",
          "Personal training sessions (2 per month)",
          "Priority booking for all classes",
          "Annual health checkup",
          "Diet consultation",
        ],
        category: "gym-cardio",
        description: "Ultimate annual fitness membership",
        bestFor: "Dedicated fitness enthusiasts wanting everything",
        badge: "Ultimate",
      },
    ]

    // Combine all plans
    const allPlans = [...workoutPlans, ...gymCardioPlans]

    // Insert all membership plans
    const insertedPlans = []
    for (const plan of allPlans) {
      const planId = await db.createMembership(plan)
      insertedPlans.push({ ...plan, id: planId })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedPlans.length} membership plans`,
      plans: insertedPlans,
    })
  } catch (error) {
    console.error("Error creating membership plans:", error)
    return NextResponse.json({ success: false, error: "Failed to create membership plans" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const memberships = await db.getMemberships()
    return NextResponse.json({
      success: true,
      plans: memberships,
    })
  } catch (error) {
    console.error("Error fetching membership plans:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch membership plans" }, { status: 500 })
  }
}
