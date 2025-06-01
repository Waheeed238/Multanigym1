"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MessageCircleQuestion,
  Plus,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Answer {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

interface Question {
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

export default function QuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})

  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
  })

  const [newAnswer, setNewAnswer] = useState("")

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await fetch("/api/questions")
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error("Error loading questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newQuestion.title.trim() || !newQuestion.content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          title: newQuestion.title.trim(),
          content: newQuestion.content.trim(),
        }),
      })

      if (response.ok) {
        setNewQuestion({ title: "", content: "" })
        setDialogOpen(false)
        loadQuestions()
      } else {
        alert("Failed to submit question")
      }
    } catch (error) {
      console.error("Error submitting question:", error)
      alert("Error submitting question")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedQuestion || !newAnswer.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          userId: user.id,
          userName: user.name,
          content: newAnswer.trim(),
        }),
      })

      if (response.ok) {
        setNewAnswer("")
        setAnswerDialogOpen(false)
        setSelectedQuestion(null)
        loadQuestions()
      } else {
        alert("Failed to submit answer")
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      alert("Error submitting answer")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (questionId: string) => {
    if (!user) return

    try {
      const response = await fetch("/api/questions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, userId: user.id }),
      })

      if (response.ok) {
        loadQuestions()
      }
    } catch (error) {
      console.error("Error liking question:", error)
    }
  }

  const handleDislike = async (questionId: string) => {
    if (!user) return

    try {
      const response = await fetch("/api/questions/dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, userId: user.id }),
      })

      if (response.ok) {
        loadQuestions()
      }
    } catch (error) {
      console.error("Error disliking question:", error)
    }
  }

  const openAnswerDialog = (question: Question) => {
    setSelectedQuestion(question)
    setAnswerDialogOpen(true)
  }

  const toggleAnswers = (questionId: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask Questions</h1>
        <p className="text-gray-600">Get answers from the community and fitness experts</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircleQuestion className="h-5 w-5" />
                  <CardTitle>Community Questions</CardTitle>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ask Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95%] max-w-2xl p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle>Ask a Question</DialogTitle>
                      <DialogDescription>Share your fitness question with the community</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitQuestion} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Question Title</Label>
                        <Input
                          id="title"
                          value={newQuestion.title}
                          onChange={(e) => setNewQuestion((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="What's your question about?"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Question Details</Label>
                        <Textarea
                          id="content"
                          value={newQuestion.content}
                          onChange={(e) => setNewQuestion((prev) => ({ ...prev, content: e.target.value }))}
                          placeholder="Provide more details about your question..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Question"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Browse questions from the community</CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircleQuestion className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
                  <p>Be the first to ask a question!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question) => {
                    const isLiked = question.likes?.includes(user?.id || "")
                    const isDisliked = question.dislikes?.includes(user?.id || "")
                    const answersVisible = showAnswers[question.id]

                    return (
                      <Card key={question.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{question.userName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-base sm:text-lg break-words">{question.title}</h3>
                                <p className="text-sm text-gray-600">
                                  by {question.userName} •{" "}
                                  {format(new Date(question.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{question.answers?.length || 0}</span>
                            </Badge>
                          </div>

                          <p className="text-gray-700 mb-4 text-sm sm:text-base break-words">{question.content}</p>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(question.id)}
                              className={cn(
                                "flex items-center space-x-1 text-xs sm:text-sm",
                                isLiked && "text-green-600 bg-green-50",
                              )}
                            >
                              <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{question.likes?.length || 0}</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDislike(question.id)}
                              className={cn(
                                "flex items-center space-x-1 text-xs sm:text-sm",
                                isDisliked && "text-red-600 bg-red-50",
                              )}
                            >
                              <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{question.dislikes?.length || 0}</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAnswerDialog(question)}
                              className="flex items-center space-x-1 text-xs sm:text-sm"
                            >
                              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Answer</span>
                            </Button>
                          </div>

                          {question.answers && question.answers.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAnswers(question.id)}
                              className="flex items-center space-x-1 text-xs sm:text-sm w-full justify-center sm:w-auto sm:justify-start"
                            >
                              {answersVisible ? (
                                <>
                                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">Hide Answers</span>
                                  <span className="inline sm:hidden">Hide</span>
                                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">Show Answers ({question.answers.length})</span>
                                  <span className="inline sm:hidden">Show ({question.answers.length})</span>
                                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                </>
                              )}
                            </Button>
                          )}
                          {/* Answers Section */}
                          {answersVisible && question.answers && question.answers.length > 0 && (
                            <div className="space-y-3">
                              <Separator />
                              <h4 className="font-medium text-sm text-gray-600">Answers:</h4>
                              {question.answers.map((answer) => (
                                <div
                                  key={answer.id}
                                  className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-2 border-l-blue-400 text-sm"
                                >
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {answer.userName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{answer.userName}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(answer.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{answer.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Before asking:</h4>
                <ul className="text-gray-600 space-y-1 mt-1">
                  <li>• Search existing questions</li>
                  <li>• Be specific and clear</li>
                  <li>• Include relevant details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">When answering:</h4>
                <ul className="text-gray-600 space-y-1 mt-1">
                  <li>• Be helpful and respectful</li>
                  <li>• Share your experience</li>
                  <li>• Provide actionable advice</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Community features:</h4>
                <ul className="text-gray-600 space-y-1 mt-1">
                  <li>• Like helpful questions</li>
                  <li>• Answer questions you know</li>
                  <li>• Show/hide answers as needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Answer Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="w-[95%] max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
            <DialogDescription>{selectedQuestion?.title}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea
                id="answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Share your knowledge and help the community..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setAnswerDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
