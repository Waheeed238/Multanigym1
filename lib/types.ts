export interface User {
  id: string
  name: string
  username?: string
  email: string
  password: string
  phone: string
  age?: number
  dateOfBirth?: string
  gender?: string
  weight: number
  height: number
  goals: string[]
  experienceLevel?: string
  profilePic?: string
  role: "admin" | "user"
  isAdmin: boolean
  membershipId?: string
  membershipType?: string
  membershipStartDate?: string
  membershipExpiry?: string
  createdAt: string
}

export interface Membership {
  id: string
  name: string
  duration: number
  price: number
  pricePerMonth?: number
  features: string[]
  category: string
  eligibility?: string
  description?: string
  badge?: string
  bestFor?: string
  createdAt: string
}

export interface Question {
  id: string
  userId: string
  userName: string
  title: string
  content: string
  answers: Answer[]
  likes: string[]
  dislikes: string[]
  createdAt: string
}

export interface Answer {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface Reminder {
  id: string
  userId?: string
  userName?: string
  type: string
  message: string
  sentAt: string
  expiryDate: string
  createdBy?: string
  createdByName?: string
  priority?: string
  isBroadcast?: boolean
  userCount?: number
  read?: boolean
  createdAt: string
}
