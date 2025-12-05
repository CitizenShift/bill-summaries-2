"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown, MessageSquare, Mail, Bookmark, Bell, Lock, Share2 } from "lucide-react"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { CommentsSection } from "@/components/comments-section"
import { ContactLegislatorDialog } from "@/components/contact-legislator-dialog"
import { BillDetailsDialog } from "@/components/bill-details-dialog"
import { ShareDialog } from "@/components/share-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useApiService } from "@/services/api";

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
  isPremium?: boolean
}

export function BillCard({ bill, userId, isPremium = false }: BillCardProps) {
  const { user } = useAuth();
  const apiService = useApiService();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(bill.userVote)
  const [showComments, setShowComments] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isTracked, setIsTracked] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const getBillVotes = async () => {
    try {
      const response: any = await apiService.get(`/api/vote?billId=${bill.id}`);
      return response?.votes;
    } catch (error) {
      console.log(error);
    }
  }

  const { data: votes } = useQuery({
    queryKey: ["getVotes", bill.id],
    queryFn: getBillVotes,
  });

  const upvotes = votes?.filter((vote: any) => vote?.voteType === "upvote")?.length || 0;
  const downvotes = (votes?.length - upvotes) || 0;

  const handleVote = async (voteType: string) => {
    try {
      const vote = await apiService.post(`/api/vote?billId=${bill.id}`, { voteType });
      return vote;
    } catch (error) {
      console.log(error);
    }
  }

  const makeVoteMutation = useMutation({
    mutationFn: handleVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getVotes", bill.id] });
    }
  });

  const handleSave = () => {
    setIsSaved(!isSaved)
    toast({
      title: isSaved ? "Bill unsaved" : "Bill saved",
      description: isSaved ? "Removed from your saved bills" : "Added to your saved bills",
    })
  }

  const handleTrack = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to track bills and get notifications on updates",
        variant: "destructive",
      })
      return
    }
    setIsTracked(!isTracked)
    toast({
      title: isTracked ? "Stopped tracking" : "Now tracking",
      description: isTracked
          ? "You will no longer receive updates on this bill"
          : "You will receive notifications when this bill is updated",
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
              <h3
                  className="text-balance text-lg font-semibold leading-tight cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowDetailsDialog(true)}
              >
                {bill.title}
              </h3>
              <p
                  className="mt-1 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowDetailsDialog(true)}
              >
                {bill.bill_number}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <p className="text-pretty leading-relaxed text-muted-foreground">{bill.summary}</p>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            {user ? (<div className="flex items-center gap-1">
              <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-1", userVote === "upvote" && "text-green-600 dark:text-green-400")}
                  onClick={() => makeVoteMutation.mutate("upvote")}
                  disabled={isPending}
              >
                <ArrowBigUp className={cn("h-5 w-5", userVote === "upvote" && "fill-current")}/>
                <span className="text-sm font-medium">{upvotes}</span>
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-1", userVote === "downvote" && "text-red-600 dark:text-red-400")}
                  onClick={() => makeVoteMutation.mutate("downvote")}
                  disabled={isPending}
              >
                <ArrowBigDown className={cn("h-5 w-5", userVote === "downvote" && "fill-current")}/>
                <span className="text-sm font-medium">{downvotes}</span>
              </Button>
            </div>) : null}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{bill.commentCount}</span>
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", isSaved && "text-amber-600 dark:text-amber-400")}
                  onClick={handleSave}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                <span className="text-sm">Save</span>
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                      "gap-2",
                      isTracked && isPremium && "text-blue-600 dark:text-blue-400",
                      !isPremium && "opacity-70",
                  )}
                  onClick={handleTrack}
              >
                {!isPremium ? (
                    <Lock className="h-4 w-4" />
                ) : (
                    <Bell className={cn("h-4 w-4", isTracked && "fill-current")} />
                )}
                <span className="text-sm">Track</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowShareDialog(true)}>
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowContactDialog(true)}>
                <Mail className="h-4 w-4" />
                <span className="text-sm">Contact</span>
              </Button>
            </div>
          </CardFooter>

          {showComments && <CommentsSection billId={bill.id} userId={userId} />}
        </Card>

        <BillDetailsDialog bill={bill} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />

        <ShareDialog bill={bill} open={showShareDialog} onOpenChange={setShowShareDialog} />

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
