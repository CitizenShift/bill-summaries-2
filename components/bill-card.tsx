"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown, MessageSquare, Mail } from "lucide-react"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { CommentsSection } from "@/components/comments-section"
import { ContactLegislatorDialog } from "@/components/contact-legislator-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Bill {
  id: string
  bill_number: string
  title: string
  summary: string
  level: string
  jurisdiction: string
  status: string
  policy_area: string
  introduced_date: string
  upvotes: number
  downvotes: number
  userVote: "upvote" | "downvote" | null
  commentCount: number
}

interface BillCardProps {
  bill: Bill
  userId: string
}

export function BillCard({ bill, userId }: BillCardProps) {
  const [upvotes, setUpvotes] = useState(bill.upvotes)
  const [downvotes, setDownvotes] = useState(bill.downvotes)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(bill.userVote)
  const [showComments, setShowComments] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const handleVote = async (voteType: "upvote" | "downvote") => {
    const previousVote = userVote
    const previousUpvotes = upvotes
    const previousDownvotes = downvotes

    // Optimistic update
    if (userVote === voteType) {
      setUserVote(null)
      if (voteType === "upvote") {
        setUpvotes((prev) => prev - 1)
      } else {
        setDownvotes((prev) => prev - 1)
      }
    } else if (userVote) {
      setUserVote(voteType)
      if (voteType === "upvote") {
        setUpvotes((prev) => prev + 1)
        setDownvotes((prev) => prev - 1)
      } else {
        setDownvotes((prev) => prev + 1)
        setUpvotes((prev) => prev - 1)
      }
    } else {
      setUserVote(voteType)
      if (voteType === "upvote") {
        setUpvotes((prev) => prev + 1)
      } else {
        setDownvotes((prev) => prev + 1)
      }
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billId: bill.id, voteType }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to vote")
        }

        router.refresh()
      } catch (error) {
        // Revert optimistic update on error
        setUserVote(previousVote)
        setUpvotes(previousUpvotes)
        setDownvotes(previousDownvotes)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to vote",
          variant: "destructive",
        })
      }
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "federal":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "state":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "municipal":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getLevelColor(bill.level)}>
                {bill.level}
              </Badge>
              <Badge variant="secondary">{bill.policy_area}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{bill.jurisdiction}</span>
          </div>
          <div>
            <h3 className="text-balance text-lg font-semibold leading-tight">{bill.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{bill.bill_number}</p>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-pretty leading-relaxed text-muted-foreground">{bill.summary}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1", userVote === "upvote" && "text-green-600 dark:text-green-400")}
              onClick={() => handleVote("upvote")}
              disabled={isPending}
            >
              <ArrowBigUp className={cn("h-5 w-5", userVote === "upvote" && "fill-current")} />
              <span className="text-sm font-medium">{upvotes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1", userVote === "downvote" && "text-red-600 dark:text-red-400")}
              onClick={() => handleVote("downvote")}
              disabled={isPending}
            >
              <ArrowBigDown className={cn("h-5 w-5", userVote === "downvote" && "fill-current")} />
              <span className="text-sm font-medium">{downvotes}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{bill.commentCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowContactDialog(true)}>
              <Mail className="h-4 w-4" />
              <span className="text-sm">Contact</span>
            </Button>
          </div>
        </CardFooter>

        {showComments && <CommentsSection billId={bill.id} userId={userId} />}
      </Card>

      <ContactLegislatorDialog
        billId={bill.id}
        billTitle={bill.title}
        billNumber={bill.bill_number}
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
      />
    </>
  )
}
