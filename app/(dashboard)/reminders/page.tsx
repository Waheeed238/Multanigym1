"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Bell,
  Clock,
  AlertTriangle,
  Users,
  User,
  Plus,
  Edit,
  Trash2,
  Send,
  Calendar,
  MessageSquare,
  Timer,
  Activity,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Reminder {
  id: string
  userId?: string
  userName?: string
  type: string
  message: string
  sentAt: string
  expiryDate?: string
  createdBy?: string
  createdByName?: string
  priority?: string
  isBroadcast?: boolean
  userCount?: number
  read?: boolean
  createdAt: string
}

interface UserWithExpiry {
  id: string
  name: string
  email: string
  phone?: string
  membershipType?: string
  membershipExpiry?: string
  daysUntilExpiry?: number
  createdAt: string
}

// Safe date formatting function
const formatDate = (dateString: string | undefined, formatStr = "MMM dd, yyyy") => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"

    // Simple date formatting without external library
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }

    if (formatStr.includes("h:mm a")) {
      options.hour = "2-digit"
      options.minute = "2-digit"
      options.hour12 = true
    }

    return date.toLocaleDateString("en-US", options)
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid Date"
  }
}

export default function RemindersPage() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [broadcastReminders, setBroadcastReminders] = useState<Reminder[]>([])
  const [expiringUsers, setExpiringUsers] = useState<UserWithExpiry[]>([])
  const [reminderDays, setReminderDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [allUsers, setAllUsers] = useState<UserWithExpiry[]>([])

  const [newReminder, setNewReminder] = useState({
    type: "general",
    message: "",
    priority: "normal",
    expiryDays: 1,
  })

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        if (user?.role === "admin" || user?.isAdmin) {
          // Admin loads all users and broadcast reminders
          try {
            const usersResponse = await fetch("/api/admin/users")
            if (usersResponse.ok) {
              const users = await usersResponse.json()
              setAllUsers(users || [])

              // Filter expiring users with safe date handling
              const expiring = (users || [])
                .filter((u: any) => {
                  if (!u.membershipExpiry) return false
                  try {
                    const expiryDate = new Date(u.membershipExpiry)
                    if (isNaN(expiryDate.getTime())) return false
                    const today = new Date()
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    return daysUntilExpiry <= reminderDays && daysUntilExpiry >= 0
                  } catch (error) {
                    console.error("Error processing user expiry:", error)
                    return false
                  }
                })
                .map((u: any) => {
                  try {
                    const expiryDate = new Date(u.membershipExpiry!)
                    const today = new Date()
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    return { ...u, daysUntilExpiry }
                  } catch (error) {
                    console.error("Error calculating days until expiry:", error)
                    return { ...u, daysUntilExpiry: 0 }
                  }
                })
                .sort((a: any, b: any) => (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0))

              setExpiringUsers(expiring)
            }
          } catch (error) {
            console.error("Error fetching users:", error)
          }

          try {
            const broadcastRemindersResponse = await fetch("/api/admin/broadcast-reminders")
            if (broadcastRemindersResponse.ok) {
              const adminReminders = await broadcastRemindersResponse.json()
              setBroadcastReminders(adminReminders || [])
            }
          } catch (error) {
            console.error("Error fetching broadcast reminders:", error)
          }
        } else {
          // Regular users see only their own reminders
          try {
            const remindersResponse = await fetch(`/api/reminders?userId=${user.id}`)
            if (remindersResponse.ok) {
              const userReminders = await remindersResponse.json()
              setReminders(userReminders || [])
            }
          } catch (error) {
            console.error("Error fetching user reminders:", error)
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load reminder data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, reminderDays])

  const createReminder = async () => {
    if (!newReminder.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReminder,
          createdBy: user?.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message || "Reminder sent to all users successfully!",
        })
        setCreateDialogOpen(false)
        setNewReminder({ type: "general", message: "", priority: "normal", expiryDays: 1 })

        // Reload reminders
        try {
          const broadcastRemindersResponse = await fetch("/api/admin/broadcast-reminders")
          if (broadcastRemindersResponse.ok) {
            const adminReminders = await broadcastRemindersResponse.json()
            setBroadcastReminders(adminReminders || [])
          }
        } catch (error) {
          console.error("Error reloading reminders:", error)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: errorData.error || "Failed to create reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      toast({
        title: "Error",
        description: "Error creating reminder",
        variant: "destructive",
      })
    }
  }

  const updateReminder = async () => {
    if (!selectedReminder) return

    try {
      const response = await fetch(`/api/broadcast-reminders/${selectedReminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedReminder.type,
          message: selectedReminder.message,
          priority: selectedReminder.priority,
          expiryDate: selectedReminder.expiryDate,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reminder updated successfully!",
        })
        setEditDialogOpen(false)
        setSelectedReminder(null)

        // Reload reminders
        try {
          const broadcastRemindersResponse = await fetch("/api/admin/broadcast-reminders")
          if (broadcastRemindersResponse.ok) {
            const adminReminders = await broadcastRemindersResponse.json()
            setBroadcastReminders(adminReminders || [])
          }
        } catch (error) {
          console.error("Error reloading reminders:", error)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating reminder:", error)
      toast({
        title: "Error",
        description: "Error updating reminder",
        variant: "destructive",
      })
    }
  }

  const deleteReminder = async (reminderId: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return

    try {
      const response = await fetch(`/api/broadcast-reminders/${reminderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reminder deleted successfully!",
        })

        // Reload reminders
        try {
          const broadcastRemindersResponse = await fetch("/api/admin/broadcast-reminders")
          if (broadcastRemindersResponse.ok) {
            const adminReminders = await broadcastRemindersResponse.json()
            setBroadcastReminders(adminReminders || [])
          }
        } catch (error) {
          console.error("Error reloading reminders:", error)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast({
        title: "Error",
        description: "Error deleting reminder",
        variant: "destructive",
      })
    }
  }

  const isAdmin = user?.role === "admin" || user?.isAdmin

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 border-b pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {isAdmin ? "Reminder Management" : "My Notifications"}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {isAdmin
                ? "Manage reminders and membership notifications for all users"
                : "Stay updated with your membership and important notifications"}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2 text-white" />
                  Create Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Create Broadcast Reminder
                  </DialogTitle>
                  <DialogDescription>Send a notification to all users in the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Reminder Type</Label>
                    <Select
                      value={newReminder.type}
                      onValueChange={(value) => setNewReminder((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="membership_expiry">Membership Expiry</SelectItem>
                        <SelectItem value="payment_due">Payment Due</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select
                      value={newReminder.priority}
                      onValueChange={(value) => setNewReminder((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Expiry (Days)</Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      min="1"
                      max="365"
                      value={newReminder.expiryDays}
                      onChange={(e) =>
                        setNewReminder((prev) => ({ ...prev, expiryDays: Number.parseInt(e.target.value) || 1 }))
                      }
                      placeholder="Number of days until reminder expires"
                    />
                    <p className="text-xs text-gray-500">Reminder will be automatically deleted after this many days</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newReminder.message}
                      onChange={(e) => setNewReminder((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your reminder message here..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createReminder}>
                      <Send className="h-4 w-4 mr-2" />
                      Send to All Users
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isAdmin ? (
        // Admin Dashboard
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold">{allUsers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                    <p className="text-3xl font-bold">{expiringUsers.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Reminders</p>
                    <p className="text-3xl font-bold">{broadcastReminders.length}</p>
                  </div>
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Plans</p>
                    <p className="text-3xl font-bold">
                      {
                        allUsers.filter((u) => {
                          if (!u.membershipExpiry) return false
                          try {
                            return new Date(u.membershipExpiry) > new Date()
                          } catch {
                            return false
                          }
                        }).length
                      }
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Timer className="h-6 w-6" />
                <span>Expiring Memberships</span>
              </CardTitle>
              <CardDescription>Members requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <label htmlFor="reminderDays" className="text-sm font-medium whitespace-nowrap">
                  Show memberships expiring within:
                </label>
                <Select
                  value={reminderDays.toString()}
                  onValueChange={(value) => setReminderDays(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">2 months</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {expiringUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Expiring Memberships</h3>
                    <p>No memberships are expiring within {reminderDays} days</p>
                  </div>
                ) : (
                  expiringUsers.map((user) => (
                    <Card key={user.id} className="transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="text-lg font-bold">
                                {user.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{user.name || "Unknown User"}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Badge className="bg-purple-600 text-white">{user.membershipType || "Basic"}</Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Joined: {formatDate(user.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row lg:flex-col items-center gap-4">
                            <div className="text-center p-4 rounded-lg border">
                              <div className="text-3xl font-bold">{user.daysUntilExpiry || 0}</div>
                              <div className="text-sm text-gray-500 font-medium">
                                {(user.daysUntilExpiry || 0) === 0
                                  ? "Expires today!"
                                  : (user.daysUntilExpiry || 0) === 1
                                    ? "day left"
                                    : "days left"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Broadcast Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6" />
                <span>Active Reminders</span>
              </CardTitle>
              <CardDescription>Manage all broadcast notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {broadcastReminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No active reminders found</p>
                  </div>
                ) : (
                  broadcastReminders.map((reminder) => (
                    <Card key={reminder.id} className="transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge variant="outline">
                                {(reminder.type || "general").replace("_", " ").toUpperCase()}
                              </Badge>
                              <Badge className="bg-purple-600 text-white">
                                {(reminder.priority || "normal").toUpperCase()}
                              </Badge>
                              {reminder.userCount && (
                                <Badge variant="outline">
                                  <Users className="h-3 w-3 mr-1" />
                                  {reminder.userCount} recipients
                                </Badge>
                              )}
                            </div>
                            <p className="mb-3 leading-relaxed">{reminder.message || "No message"}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Created: {formatDate(reminder.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                By: {reminder.createdByName || "System"}
                              </span>
                              {reminder.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  Expires: {formatDate(reminder.expiryDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReminder(reminder)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteReminder(reminder.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // User Dashboard
        <div className="space-y-8">
          {user?.membershipExpiry && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span>Your Membership Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold mb-1 capitalize">{user.membershipType || "Active"} Plan</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expires on {formatDate(user.membershipExpiry, "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      try {
                        const expiryDate = new Date(user.membershipExpiry)
                        const today = new Date()
                        const daysUntilExpiry = Math.ceil(
                          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                        )

                        return (
                          <>
                            <div className="text-center p-4 rounded-lg border">
                              <div className="text-3xl font-bold">{daysUntilExpiry}</div>
                              <div className="text-sm text-gray-500">
                                {daysUntilExpiry === 0
                                  ? "Expires today!"
                                  : daysUntilExpiry === 1
                                    ? "day left"
                                    : "days left"}
                              </div>
                            </div>
                            {daysUntilExpiry < 0 ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : daysUntilExpiry <= 7 ? (
                              <Badge className="bg-purple-600 text-white">Expires Soon</Badge>
                            ) : (
                              <Badge variant="outline">Active</Badge>
                            )}
                          </>
                        )
                      } catch (error) {
                        console.error("Error calculating expiry:", error)
                        return <Badge variant="outline">Active</Badge>
                      }
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-6 w-6" />
                <span>Your Notifications</span>
              </CardTitle>
              <CardDescription>Stay updated with important information</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications at this time</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <Card key={reminder.id} className="transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {reminder.type === "membership_expiry" ? (
                              <div className="p-2 rounded-full border">
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-full border">
                                <Bell className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {(reminder.type || "general").replace("_", " ").toUpperCase()}
                              </Badge>
                              <Badge className="bg-purple-600 text-white">
                                {(reminder.priority || "normal").toUpperCase()}
                              </Badge>
                            </div>
                            <p className="mb-2 leading-relaxed">{reminder.message || "No message"}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(reminder.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                From: {reminder.createdByName || "System"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Reminder Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>Update reminder details</DialogDescription>
          </DialogHeader>
          {selectedReminder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Reminder Type</Label>
                <Select
                  value={selectedReminder.type}
                  onValueChange={(value) => setSelectedReminder((prev) => (prev ? { ...prev, type: value } : null))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="membership_expiry">Membership Expiry</SelectItem>
                    <SelectItem value="payment_due">Payment Due</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={selectedReminder.priority}
                  onValueChange={(value) => setSelectedReminder((prev) => (prev ? { ...prev, priority: value } : null))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-expiry">Expiry Date</Label>
                <Input
                  id="edit-expiry"
                  type="datetime-local"
                  value={
                    selectedReminder.expiryDate
                      ? (() => {
                          try {
                            return new Date(selectedReminder.expiryDate).toISOString().slice(0, 16)
                          } catch {
                            return ""
                          }
                        })()
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      const newDate = new Date(e.target.value).toISOString()
                      setSelectedReminder((prev) => (prev ? { ...prev, expiryDate: newDate } : null))
                    } catch (error) {
                      console.error("Invalid date:", error)
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="edit-message">Message</Label>
                <Textarea
                  id="edit-message"
                  value={selectedReminder.message}
                  onChange={(e) => setSelectedReminder((prev) => (prev ? { ...prev, message: e.target.value } : null))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateReminder}>Update Reminder</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
