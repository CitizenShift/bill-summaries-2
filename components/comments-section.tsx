"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import useSWR from "swr"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    full_name: string
    email: string
  }
}

interface CommentsSectionProps {
  billId: string
  userId: string
}

export function CommentsSection({ billId, userId }: CommentsSectionProps) {
  const { data, mutate, isLoading } = useSWR(`/api/comments?billId=${billId}`)
  const comments = data?.comments || []

  const [newComment, setNewComment] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    startTransition(async () => {
      try {
        const response = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billId, content: newComment }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to add comment")
        }

        setNewComment("")
        mutate()
        toast({
          title: "Success",
          description: "Comment added successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add comment",
          variant: "destructive",
        })
      }
    })
  }

  const handleDeleteComment = async (commentId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/comments?commentId=${commentId}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete comment")
        }

        mutate()
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete comment",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="border-t bg-muted/20 p-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isPending}
          />
          <Button onClick={handleAddComment} disabled={isPending || !newComment.trim()} className="self-end">
            Post
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment: Comment) => {
              const initials =
                comment.user.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || comment.user.email[0].toUpperCase()

              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.user.full_name || comment.user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {comment.user_id === userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
