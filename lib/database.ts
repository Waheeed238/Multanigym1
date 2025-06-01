import { ObjectId } from "mongodb"
import { getCollection } from "./mongodb"
import type { User, Membership, Question, Answer, Review } from "./types"

export const db = {
  // User operations
  async createUser(userData: Omit<User, "id">) {
    const users = await getCollection("users")
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date().toISOString(),
      isAdmin: userData.isAdmin || false,
      role: userData.role || "user",
    })
    return result.insertedId.toString()
  },

  async getUser(userId: string) {
    const users = await getCollection("users")
    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) return null

    // Convert MongoDB document to User type
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      phone: user.phone,
      age: user.age,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      goals: user.goals,
      experienceLevel: user.experienceLevel,
      profilePic: user.profilePic,
      role: user.role,
      isAdmin: user.isAdmin,
      membershipId: user.membershipId,
      membershipType: user.membershipType,
      membershipStartDate: user.membershipStartDate,
      membershipExpiry: user.membershipExpiry,
      createdAt: user.createdAt,
      username: user.username,
    } as User
  },

  async getUserByEmail(email: string) {
    const users = await getCollection("users")
    const user = await users.findOne({ email })
    if (!user) return null

    // Convert MongoDB document to User type
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      phone: user.phone,
      age: user.age,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      goals: user.goals,
      experienceLevel: user.experienceLevel,
      profilePic: user.profilePic,
      role: user.role,
      isAdmin: user.isAdmin,
      membershipId: user.membershipId,
      membershipType: user.membershipType,
      membershipStartDate: user.membershipStartDate,
      membershipExpiry: user.membershipExpiry,
      createdAt: user.createdAt,
      username: user.username,
    } as User
  },

  async getUserByUsername(username: string) {
    const users = await getCollection("users")
    const user = await users.findOne({ username })
    if (!user) return null

    // Convert MongoDB document to User type
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      phone: user.phone,
      age: user.age,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      goals: user.goals,
      experienceLevel: user.experienceLevel,
      profilePic: user.profilePic,
      role: user.role,
      isAdmin: user.isAdmin,
      membershipId: user.membershipId,
      membershipType: user.membershipType,
      membershipStartDate: user.membershipStartDate,
      membershipExpiry: user.membershipExpiry,
      createdAt: user.createdAt,
      username: user.username,
    } as User
  },

  async updateUser(userId: string, updateData: Partial<User>) {
    const users = await getCollection("users")
    const { id, ...dataToUpdate } = updateData
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: dataToUpdate })
    return true
  },

  async getAllUsers() {
    const users = await getCollection("users")
    const userList = await users.find({}).toArray()

    // Convert MongoDB documents to User type
    return userList.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      phone: user.phone,
      age: user.age,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      goals: user.goals,
      experienceLevel: user.experienceLevel,
      profilePic: user.profilePic,
      role: user.role,
      isAdmin: user.isAdmin,
      membershipId: user.membershipId,
      membershipType: user.membershipType,
      membershipStartDate: user.membershipStartDate,
      membershipExpiry: user.membershipExpiry,
      createdAt: user.createdAt,
      username: user.username,
    })) as User[]
  },

  // Broadcast Reminder operations
  async createBroadcastReminder(reminderData: any) {
    const broadcastReminders = await getCollection("broadcast_reminders")
    const result = await broadcastReminders.insertOne({
      ...reminderData,
      createdAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  },

  async getAllBroadcastReminders() {
    const broadcastReminders = await getCollection("broadcast_reminders")
    const reminderList = await broadcastReminders.find({}).sort({ createdAt: -1 }).toArray()
    return reminderList.map((reminder) => ({
      id: reminder._id.toString(),
      type: reminder.type,
      message: reminder.message,
      sentAt: reminder.sentAt,
      expiryDate: reminder.expiryDate,
      createdBy: reminder.createdBy,
      createdByName: reminder.createdByName,
      priority: reminder.priority,
      isBroadcast: reminder.isBroadcast,
      userCount: reminder.userCount,
      createdAt: reminder.createdAt,
    }))
  },

  async updateBroadcastReminder(reminderId: string, updateData: any) {
    const broadcastReminders = await getCollection("broadcast_reminders")
    await broadcastReminders.updateOne({ _id: new ObjectId(reminderId) }, { $set: updateData })
    return true
  },

  async deleteBroadcastReminder(reminderId: string) {
    const broadcastReminders = await getCollection("broadcast_reminders")
    await broadcastReminders.deleteOne({ _id: new ObjectId(reminderId) })
    return true
  },

  // Individual Reminder operations (for user-specific tracking)
  async createReminder(reminderData: any) {
    const reminders = await getCollection("reminders")
    const result = await reminders.insertOne({
      ...reminderData,
      createdAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  },

  async getUserReminders(userId: string) {
    const reminders = await getCollection("reminders")
    const reminderList = await reminders.find({ userId }).sort({ createdAt: -1 }).toArray()
    return reminderList.map((reminder) => ({
      id: reminder._id.toString(),
      userId: reminder.userId,
      userName: reminder.userName,
      type: reminder.type,
      message: reminder.message,
      sentAt: reminder.sentAt,
      expiryDate: reminder.expiryDate,
      read: reminder.read,
      createdBy: reminder.createdBy,
      createdByName: reminder.createdByName,
      priority: reminder.priority,
      broadcastId: reminder.broadcastId,
      createdAt: reminder.createdAt,
    }))
  },

  async getAllReminders() {
    const reminders = await getCollection("reminders")
    const reminderList = await reminders.find({}).sort({ createdAt: -1 }).toArray()
    return reminderList.map((reminder) => ({
      id: reminder._id.toString(),
      userId: reminder.userId,
      userName: reminder.userName,
      type: reminder.type,
      message: reminder.message,
      sentAt: reminder.sentAt,
      expiryDate: reminder.expiryDate,
      read: reminder.read,
      createdBy: reminder.createdBy,
      createdByName: reminder.createdByName,
      priority: reminder.priority,
      broadcastId: reminder.broadcastId,
      createdAt: reminder.createdAt,
    }))
  },

  async updateReminder(reminderId: string, updateData: any) {
    const reminders = await getCollection("reminders")
    await reminders.updateOne({ _id: new ObjectId(reminderId) }, { $set: updateData })
    return true
  },

  async deleteReminder(reminderId: string) {
    const reminders = await getCollection("reminders")
    await reminders.deleteOne({ _id: new ObjectId(reminderId) })
    return true
  },

  async deleteExpiredReminders() {
    const reminders = await getCollection("reminders")
    const broadcastReminders = await getCollection("broadcast_reminders")
    const now = new Date().toISOString()

    await reminders.deleteMany({ expiryDate: { $lt: now } })
    await broadcastReminders.deleteMany({ expiryDate: { $lt: now } })
    return true
  },

  // Membership operations
  async createMembership(membershipData: Omit<Membership, "id">) {
    const memberships = await getCollection("memberships")
    const result = await memberships.insertOne({
      ...membershipData,
      createdAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  },

  async getMemberships() {
    const memberships = await getCollection("memberships")
    const membershipList = await memberships.find({}).toArray()

    // Convert MongoDB documents to Membership type
    return membershipList.map((membership) => ({
      id: membership._id.toString(),
      name: membership.name,
      duration: membership.duration,
      price: membership.price,
      features: membership.features,
      category: membership.category,
      eligibility: membership.eligibility,
      createdAt: membership.createdAt,
      description: membership.description,
      badge: membership.badge,
      bestFor: membership.bestFor,
      pricePerMonth: membership.pricePerMonth,
    })) as Membership[]
  },

  async getMembership(membershipId: string) {
    const memberships = await getCollection("memberships")
    const membership = await memberships.findOne({ _id: new ObjectId(membershipId) })
    if (!membership) return null

    // Convert MongoDB document to Membership type
    return {
      id: membership._id.toString(),
      name: membership.name,
      duration: membership.duration,
      price: membership.price,
      features: membership.features,
      category: membership.category,
      eligibility: membership.eligibility,
      createdAt: membership.createdAt,
      description: membership.description,
      badge: membership.badge,
      bestFor: membership.bestFor,
      pricePerMonth: membership.pricePerMonth,
    } as Membership
  },

  // Targets operations
  async saveTargets(userId: string, targets: any) {
    const targetsCollection = await getCollection("targets")
    await targetsCollection.replaceOne(
      { userId },
      { userId, ...targets, updatedAt: new Date().toISOString() },
      { upsert: true },
    )
    return true
  },

  async getTargets(userId: string) {
    const targetsCollection = await getCollection("targets")
    const targets = await targetsCollection.findOne({ userId })
    if (!targets) return {}

    const { _id, userId: uid, updatedAt, ...targetData } = targets
    return targetData
  },

  // Diet operations
  async saveDietPlan(userId: string, dietData: any) {
    const diets = await getCollection("diets")

    // Use upsert to update existing diet plan for the same date or create new one
    const result = await diets.replaceOne(
      { userId, date: dietData.date },
      {
        userId,
        ...dietData,
        updatedAt: new Date().toISOString(),
      },
      { upsert: true },
    )

    return result.upsertedId?.toString() || "updated"
  },

  async getDietPlanByDate(userId: string, date: string) {
    const diets = await getCollection("diets")
    const diet = await diets.findOne({ userId, date })
    if (!diet) return null

    return {
      id: diet._id.toString(),
      userId: diet.userId,
      foods: diet.foods,
      date: diet.date,
      createdAt: diet.createdAt,
      updatedAt: diet.updatedAt,
    }
  },

  async getUserDiets(userId: string) {
    const diets = await getCollection("diets")
    const dietList = await diets.find({ userId }).sort({ date: -1 }).toArray()
    return dietList.map((diet) => ({
      id: diet._id.toString(),
      userId: diet.userId,
      foods: diet.foods,
      date: diet.date,
      createdAt: diet.createdAt,
      updatedAt: diet.updatedAt,
    }))
  },

  // Legacy diet operations (for backward compatibility)
  async saveDiet(userId: string, dietData: any) {
    return this.saveDietPlan(userId, dietData)
  },

  async getDietByDate(userId: string, date: string) {
    return this.getDietPlanByDate(userId, date)
  },

  // Questions operations
  async createQuestion(questionData: Omit<Question, "id">) {
    const questions = await getCollection("questions")
    const result = await questions.insertOne({
      ...questionData,
      answers: [],
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  },

  async getQuestions() {
    const questions = await getCollection("questions")
    const questionList = await questions.find({}).sort({ createdAt: -1 }).toArray()

    // Convert MongoDB documents to Question type
    return questionList.map((question) => ({
      id: question._id.toString(),
      userId: question.userId,
      userName: question.userName,
      title: question.title,
      content: question.content,
      answers: question.answers || [],
      likes: question.likes || [],
      dislikes: question.dislikes || [],
      createdAt: question.createdAt,
    })) as Question[]
  },

  async addAnswerToQuestion(questionId: string, answer: Answer) {
    const questions = await getCollection("questions")
    const answerWithId = {
      ...answer,
      id: new ObjectId().toString(),
      createdAt: new Date().toISOString(),
    }

    // Fix the $push operator syntax
    await questions.updateOne({ _id: new ObjectId(questionId) }, { $push: { answers: answerWithId } as any })
    return true
  },

  async likeQuestion(questionId: string, userId: string) {
    const questions = await getCollection("questions")
    // Fix the $addToSet and $pull operator syntax
    await questions.updateOne(
      { _id: new ObjectId(questionId) },
      {
        $addToSet: { likes: userId } as any,
        $pull: { dislikes: userId } as any,
      },
    )
    return true
  },

  async dislikeQuestion(questionId: string, userId: string) {
    const questions = await getCollection("questions")
    // Fix the $addToSet and $pull operator syntax
    await questions.updateOne(
      { _id: new ObjectId(questionId) },
      {
        $addToSet: { dislikes: userId } as any,
        $pull: { likes: userId } as any,
      },
    )
    return true
  },

  // Reviews operations
  async createReview(reviewData: Omit<Review, "id">) {
    const reviews = await getCollection("reviews")
    const result = await reviews.insertOne({
      ...reviewData,
      createdAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  },

  async getReviews() {
    const reviews = await getCollection("reviews")
    const reviewList = await reviews.find({}).sort({ createdAt: -1 }).toArray()

    // Convert MongoDB documents to Review type
    return reviewList.map((review) => ({
      id: review._id.toString(),
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    })) as Review[]
  },

  // Membership assignment operations
  async createMembershipAssignment(assignmentData: any) {
    const assignments = await getCollection("membership_assignments")
    const result = await assignments.insertOne({
      ...assignmentData,
      assignedAt: new Date().toISOString(),
    })
    return result.insertedId.toString()
  },

  async getMembershipAssignments() {
    const assignments = await getCollection("membership_assignments")
    const assignmentList = await assignments.find({}).sort({ assignedAt: -1 }).toArray()
    return assignmentList.map((assignment) => ({
      id: assignment._id.toString(),
      ...assignment,
      _id: undefined,
    }))
  },

  // Clear all data (for testing)
  async clearAllData() {
    try {
      const collection = await getCollection("users")
      const db = collection.dbName
      const client = await collection.db.client
      await client.db(db).dropDatabase()
      console.log("Database cleared")
    } catch (error) {
      console.error("Error clearing database:", error)
    }
  },
}
