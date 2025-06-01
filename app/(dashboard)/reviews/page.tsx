"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Plus, StarIcon } from "lucide-react"
import { format } from "date-fns"

interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export default function ReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const response = await fetch("/api/reviews")
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || newReview.rating === 0 || !newReview.comment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          rating: newReview.rating,
          comment: newReview.comment.trim(),
        }),
      })

      if (response.ok) {
        setNewReview({ rating: 0, comment: "" })
        setDialogOpen(false)
        loadReviews()
      } else {
        alert("Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Error submitting review")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            disabled={!interactive}
          >
            <StarIcon
              className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          </button>
        ))}
      </div>
    )
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review Us</h1>
        <p className="text-sm sm:text-base text-gray-600">Share your experience and help us improve</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <CardTitle className="text-lg sm:text-xl">Member Reviews</CardTitle>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Write Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95%] max-w-lg p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                      <DialogDescription>Share your experience with Multani Gym</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="mt-2">
                          {renderStars(newReview.rating, true, (rating) =>
                            setNewReview((prev) => ({ ...prev, rating })),
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment">Your Review</Label>
                        <Textarea
                          id="comment"
                          value={newReview.comment}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                          placeholder="Tell us about your experience..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting || newReview.rating === 0}
                          className="w-full sm:w-auto"
                        >
                          {submitting ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>See what other members are saying</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">No Reviews Yet</h3>
                  <p className="text-sm sm:text-base">Be the first to leave a review!</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto sm:mx-0">
                            <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-sm sm:text-base">{review.userName}</h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {format(new Date(review.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                              <div className="mt-2 sm:mt-0 flex justify-center sm:justify-end">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Overall Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Overall Rating</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-xs sm:text-sm text-gray-600">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </CardContent>
          </Card>

          {/* Rating Breakdown */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter((r) => r.rating === rating).length
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center space-x-2 text-xs sm:text-sm">
                      <span className="w-4 sm:w-8">{rating}</span>
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-4 sm:w-8 text-gray-600">{count}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
