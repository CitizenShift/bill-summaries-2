"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, ArrowBigDown, MessageSquare, Mail, Bookmark, Bell, Lock, Share2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { CommentsSection } from "@/components/comments-section"
import { ContactLegislatorDialog } from "@/components/contact-legislator-dialog"
import { ShareDialog } from "@/components/share-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useApiService } from "@/services/api";
import { useInView } from "@/hooks/use-in-view";
import { useRouter } from "next/navigation";
import { LEGISCAN_STATUS_LABELS } from "@/app/utils/constants/constants";

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
}

interface BillCardProps {
  bill: Bill
  isPremium?: boolean
}

export function BillCard({ bill, isPremium = false }: BillCardProps) {
  const { ref, isInView } = useInView({ rootMargin: "300px" });
  const { user } = useAuth();
  const apiService = useApiService();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [showComments, setShowComments] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isTracked, setIsTracked] = useState(false)
  const { toast } = useToast()

  const getAllComments = async () => {
    try {
      if (!user) {
        return []
      }
      const response: any = await apiService.get(`/api/comments?billId=${bill.id}`);
      return response?.comments || [];
    } catch (error) {
      console.log(error)
    }
  }

  const { data: comments, isLoading, error } = useQuery({
    queryKey: ["getAllComments", bill.id],
    queryFn: getAllComments,
    enabled: isInView,
    staleTime: 60_000,
  });

  const getBillVotes = async () => {
    try {
      if (!user) {
        return [];
      }
      const response: any = await apiService.get(`/api/vote?billId=${bill.id}`);
      return response?.votes;
    } catch (error) {
      console.log(error);
    }
  }

  const { data: votes } = useQuery({
    queryKey: ["getVotes", bill.id],
    queryFn: getBillVotes,
    enabled: isInView,
    staleTime: 60_000
  });

  const upvotes = votes?.filter((vote: any) => vote?.voteType === "upvote")?.length || 0;
  const downvotes = (votes?.length - upvotes) || 0;

  const handleVote = async (voteType: string) => {
    try {
      const existingVote = votes?.find((vote: any) => vote?.userId === user?.id);
      if (existingVote) {
        toast({
          description: "You can only vote once on a bill!"
        });
        return;
      }

      setUserVote(voteType as "upvote" | "downvote" | null);
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

  const getSavedStatus = async () => {
    try {
      const response: any = await apiService.get(`/api/saved_bills/${bill.id}`);
      return response?.saved;
    } catch (error) {
      console.log(error)
    }
  }

  const { data: isSaved } = useQuery({
    queryKey: ["getSavedStatus", bill.id],
    queryFn: getSavedStatus,
    enabled: isInView && !!user,
    staleTime: 60_000
  });

  const handleSave = async () => {
    if (!isSaved) {
      const response: any = await apiService.post(`/api/saved_bills?billId=${bill.id}`, {});
      return { saved: true };
    } else {
      const response: any = await apiService.delete(`/api/saved_bills/${bill.id}`);
      return { saved: false };
    }
  }

  const saveMutation = useMutation({
    mutationFn: handleSave,
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["getSavedStatus", bill.id] });

      // Snapshot the previous value
      const previousSavedStatus = queryClient.getQueryData(["getSavedStatus", bill.id]);
      const wasSaved = previousSavedStatus ?? isSaved;

      // Optimistically update to the new value
      queryClient.setQueryData(["getSavedStatus", bill.id], !wasSaved);

      // Return context with the snapshotted value
      return { previousSavedStatus, wasSaved };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSavedStatus !== undefined) {
        queryClient.setQueryData(["getSavedStatus", bill.id], context.previousSavedStatus);
      }
      const wasSaved = context?.wasSaved ?? isSaved;
      toast({
        variant: "destructive",
        description: `Failed to ${wasSaved ? "unsave" : "save"} bill. Please try again.`,
      });
    },
    onSuccess: () => {
      // Invalidate to refetch and ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["getSavedStatus", bill.id] });
    },
  });

  // const handleTrack = () => {
  //   if (!isPremium) {
  //     toast({
  //       title: "Premium Feature",
  //       description: "Upgrade to premium to track bills and get notifications on updates",
  //       variant: "destructive",
  //     })
  //     return
  //   }
  //   setIsTracked(!isTracked)
  //   toast({
  //     title: isTracked ? "Stopped tracking" : "Now tracking",
  //     description: isTracked
  //         ? "You will no longer receive updates on this bill"
  //         : "You will receive notifications when this bill is updated",
  //   })
  // }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Federal":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "State":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "municipal":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Convert status to string label if it's a number
  const getStatusLabel = (status: string | number): string => {
    if (typeof status === 'number') {
      return LEGISCAN_STATUS_LABELS[status] ?? "Unknown"
    }
    // If it's already a string but might be a number string, try to convert
    const statusNumber = parseInt(status as string)
    if (!isNaN(statusNumber) && LEGISCAN_STATUS_LABELS[statusNumber]) {
      return LEGISCAN_STATUS_LABELS[statusNumber]
    }
    return status as string
  }

  const statusLabel = getStatusLabel(bill.status)

  return (
      <div ref={ref}>
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getLevelColor(bill.level)}>
                  {bill.level}
                </Badge>
                <Badge variant="secondary">{bill.policy_area}</Badge>
                <Badge variant="outline">{statusLabel}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{bill.jurisdiction}</span>
            </div>
            <div>
              <h3
                  className="text-balance text-lg font-semibold leading-tight cursor-pointer hover:text-primary transition-colors"
                  onClick={() => router.push(`/bills/${bill.id}`)}
              >
                {bill.title}
              </h3>
              <p
                  className="mt-1 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => router.push(`/bills/${bill.id}`)}
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
                  disabled={makeVoteMutation?.isPending}
              >
                <ArrowBigUp className={cn("h-5 w-5", userVote === "upvote" && "fill-current")}/>
                <span className="text-sm font-medium">{upvotes}</span>
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-1", userVote === "downvote" && "text-red-600 dark:text-red-400")}
                  onClick={() => makeVoteMutation.mutate("downvote")}
                  disabled={makeVoteMutation?.isPending}
              >
                <ArrowBigDown className={cn("h-5 w-5", userVote === "downvote" && "fill-current")}/>
                <span className="text-sm font-medium">{downvotes}</span>
              </Button>
            </div>) : null}

            <div className="flex items-center gap-2">
              {user ? (<Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
                <MessageSquare className="h-4 w-4"/>
                <span className="text-sm">{comments?.length}</span>
              </Button>) : null}
              {user ? (
                  <Button
                      variant="ghost"
                      size="sm"
                      className={cn("gap-2", isSaved && "text-amber-600 dark:text-amber-400")}
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation?.isPending}
                  >
                    <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                    <span className="text-sm">Save</span>
                  </Button>
              ) : null}
              {/*<Button*/}
              {/*    variant="ghost"*/}
              {/*    size="sm"*/}
              {/*    className={cn(*/}
              {/*        "gap-2",*/}
              {/*        isTracked && isPremium && "text-blue-600 dark:text-blue-400",*/}
              {/*        !isPremium && "opacity-70",*/}
              {/*    )}*/}
              {/*    onClick={handleTrack}*/}
              {/*>*/}
              {/*  {!isPremium ? (*/}
              {/*      <Lock className="h-4 w-4" />*/}
              {/*  ) : (*/}
              {/*      <Bell className={cn("h-4 w-4", isTracked && "fill-current")} />*/}
              {/*  )}*/}
              {/*  <span className="text-sm">Track</span>*/}
              {/*</Button>*/}
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

          {showComments && user && <CommentsSection billId={bill.id} userId={user?.id} comments={comments} isLoading={isLoading} />}
        </Card>

        <ShareDialog bill={bill} open={showShareDialog} onOpenChange={setShowShareDialog} />

        <ContactLegislatorDialog
            billId={bill.id}
            billTitle={bill.title}
            billNumber={bill.bill_number}
            open={showContactDialog}
            onOpenChange={setShowContactDialog}
        />
      </div>
  )
}
