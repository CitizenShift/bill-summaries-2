"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns"
import { useApiService } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string
  content: string
  createdAt: string
  userId: string
  user: {
    full_name: string
    email: string
  }
}

interface CommentsSectionProps {
  billId: string
  userId: string,
  comments: any,
  isLoading: boolean,
}

export function CommentsSection({ billId, userId, comments, isLoading }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const apiService = useApiService();
  const { user } = useAuth();
  const { toast } = useToast();

  const [newComment, setNewComment] = useState("")

  const handleAddComment = async (content: string) => {
    if (!newComment.trim() || !user) return;
    try {
      const response = await apiService.post(`/api/comments?billId=${billId}`, { content });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  const createCommentMutation = useMutation({
    mutationFn: handleAddComment,
    onSuccess: () => {
      toast({
        description: "Successfully created comment",
      })
      queryClient.invalidateQueries({ queryKey: ["getAllComments", billId] });
      setNewComment("");
    }
  });

  const handleDeleteComment = async (comment: any) => {
    try {
      const commentUserId = comment?.userId;
      if (commentUserId !== user?.id) {
        return;
      }

      const response = await apiService.delete(`/api/comments/${comment.id}`);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  const deleteCommentMutation = useMutation({
    mutationFn: handleDeleteComment,
    onSuccess: () => {
      toast({
        description: "Comment deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["getAllComments", billId] });
    }
  });

  return (
    <div className="border-t bg-muted/20 p-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={createCommentMutation?.isPending}
          />
          <Button onClick={() => createCommentMutation.mutate(newComment)} disabled={createCommentMutation?.isPending || !newComment.trim()} className="self-end">
            Post
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading comments...</p>
        ) : comments?.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-3">
            {comments?.map((comment: Comment) => {
              const initials =
                comment?.user?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || comment?.user?.email?.[0].toUpperCase()

              return (
                <div key={comment?.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment?.user?.full_name || comment?.user?.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment?.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {comment?.userId === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCommentMutation.mutate(comment)}
                          disabled={deleteCommentMutation?.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{comment?.content}</p>
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
