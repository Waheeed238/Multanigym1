import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST() {
  try {
    // Clear existing data
    await db.clearAllData()

    // Create admin user
    const adminId = await db.createUser({
      name: "Admin User",
      email: "admin@multanigym.com",
      password: "admin123",
      phone: "+91-9876543210",
      age: 30,
      weight: 75,
      height: 70,
      goals: ["Manage Gym Operations"],
      role: "admin",
      isAdmin: true,
      createdAt: new Date().toISOString(),
    })

    // Create sample regular user
    const userId = await db.createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "user123",
      phone: "+91-9876543211",
      age: 25,
      weight: 70,
      height: 68,
      goals: ["Weight Loss", "Muscle Gain"],
      role: "user",
      isAdmin: false,
      createdAt: new Date().toISOString(),
    })

    // Create unique membership plans (no duplicates)
    const membershipPlans = [
      // Bodybuilding Plans
      {
        name: "Bodybuilding Plan - Monthly",
        duration: 1,
        price: 1000,
        features: [
          "Access to all gym equipment",
          "No access to cardio machines",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
        ],
        category: "bodybuilding",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bodybuilding Plan - Quarterly",
        duration: 3,
        price: 2600,
        features: [
          "Access to all gym equipment",
          "No access to cardio machines",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Monthly progress tracking",
        ],
        category: "bodybuilding",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bodybuilding Plan - Half Yearly",
        duration: 6,
        price: 4900,
        features: [
          "Access to all gym equipment",
          "No access to cardio machines",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Monthly progress tracking",
          "Nutrition guidance",
        ],
        category: "bodybuilding",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bodybuilding Plan - Yearly",
        duration: 12,
        price: 9600,
        features: [
          "Access to all gym equipment",
          "No access to cardio machines",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Monthly progress tracking",
          "Nutrition guidance",
          "Priority booking for classes",
          "Annual health checkup",
        ],
        category: "bodybuilding",
        createdAt: new Date().toISOString(),
      },
      // Bodybuilding + Cardio Plans
      {
        name: "Bodybuilding + Cardio Plan - Monthly",
        duration: 1,
        price: 1400,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
        ],
        category: "bodybuilding-cardio",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bodybuilding + Cardio Plan - Quarterly",
        duration: 3,
        price: 3700,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Monthly progress tracking",
          "Group cardio classes",
        ],
        category: "bodybuilding-cardio",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bodybuilding + Cardio Plan - Half Yearly",
        duration: 6,
        price: 6800,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Monthly progress tracking",
          "Group cardio classes",
          "Nutrition guidance",
          "Personal training session (1 per month)",
        ],
        category: "bodybuilding-cardio",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Bodybuilding + Cardio Plan - Yearly",
        duration: 12,
        price: 12800,
        features: [
          "Access to all gym equipment",
          "Full cardio section access",
          "Treadmill, elliptical, cycling",
          "Basic workout guidance",
          "Locker facility",
          "Free water",
          "Monthly progress tracking",
          "Group cardio classes",
          "Nutrition guidance",
          "Personal training sessions (2 per month)",
          "Priority booking for all classes",
          "Annual health checkup",
          "Diet consultation",
        ],
        category: "bodybuilding-cardio",
        createdAt: new Date().toISOString(),
      },
    ]

    // Create all membership plans (ensuring no duplicates)
    const membershipIds = []
    for (const plan of membershipPlans) {
      const membershipId = await db.createMembership(plan)
      membershipIds.push(membershipId)
    }

    // Create some sample questions
    await db.createQuestion({
      userId: userId,
      userName: "John Doe",
      title: "Best workout routine for beginners?",
      content: "I'm new to the gym and looking for advice on the best workout routine to start with. Any suggestions?",
    })

    // Create some sample reviews
    await db.createReview({
      userId: userId,
      userName: "John Doe",
      rating: 5,
      comment: "Excellent gym with great equipment and friendly staff!",
    })

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        adminId,
        userId,
        membershipPlans: membershipIds.length,
        totalPlans: membershipPlans.length,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
