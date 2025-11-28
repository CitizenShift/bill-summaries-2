"use client"
import { useApiService} from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { BillFeed } from "@/components/bill-feed"
import { useParams } from "next/navigation";
import {mockComments, mockVotes} from "@/lib/mock-data";

export default function SessionPage() {
    const params = useParams();
    const session_id = params?.session_id;
    const apiService = useApiService();

    const getSessionMasterList = async () => {
        try {
            if (!session_id) return;
            const response: any = await apiService.get(`/api/sessions/${session_id}`);
            return Object.values(response?.data?.masterlist);
        } catch (error) {
            console.error(error);
        }
    }

    const { data: sessionMasterList, isLoading, error } = useQuery({
        queryKey: ["sessionMasterList"],
        queryFn: getSessionMasterList,
        enabled: !!session_id,
    });

    const bills = sessionMasterList?.map((bill: any) => ({
        id: bill?.bill_id,
        bill_number: bill?.number,
        title: bill?.title,
        summary: bill?.description,
        level: "state",
        jurisdiction: "United States",
        status: bill?.status,
        policy_area: "Unknown",
        introduced_date: bill?.status_date,
    })) || [];

    const enrichedBills = bills?.map((bill) => {
        const billVotes = mockVotes.filter((v) => v.bill_id === bill.id)
        const upvotes = billVotes.filter((v) => v.vote_type === "upvote").length
        const downvotes = billVotes.filter((v) => v.vote_type === "downvote").length
        const userVote = billVotes.find((v) => v.user_id === "guest")?.vote_type || null
        const commentCount = mockComments.filter((c) => c.bill_id === bill.id).length

        return {
            ...bill,
            upvotes,
            downvotes,
            userVote,
            commentCount,
        }
    });

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-2xl px-4 py-6">
                <div className="mb-6 text-center">
                    <h2 className="text-balance text-3xl font-bold tracking-tight">Bills</h2>
                    <p className="mt-2 text-pretty text-muted-foreground">
                        View Bills by session
                    </p>
                </div>
                {enrichedBills?.length ? <BillFeed bills={enrichedBills} userId="guest"  /> : null}
            </main>
        </div>
    )
}