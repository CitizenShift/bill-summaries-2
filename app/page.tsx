"use client"
import { useQuery } from "@tanstack/react-query";
import { useApiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { shuffle, LEGISCAN_STATUS_LABELS } from "@/app/utils/constants/constants";
import { BillFeed } from "@/components/bill-feed"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const apiService = useApiService();
  const { user } = useAuth();
  const state = user?.user_metadata?.state || "FL";

  const getMasterList = async () => {
    try {
      const response: any = await apiService.get(`/api/masterlist?state=${state}`);
      return response?.data;
    } catch (error) {
      console.log(error);
    }
  }

  const { data: allBills, isLoading } = useQuery({
    queryKey: ["masterlist"],
    queryFn: getMasterList,
  });

  const enrichedBills = useMemo(() => {
    const convertStatus = (status: any): string => {
      if (!status) return "Unknown";
      const statusNumber = typeof status === 'number' ? status : parseInt(status);
      return LEGISCAN_STATUS_LABELS[statusNumber] ?? "Unknown";
    };

    const federalBillsRaw = Object.values(allBills?.federal?.masterlist || []);
    const federalBillsMapped = federalBillsRaw.map((bill: any) => ({
      id: bill?.bill_id,
      bill_number: bill?.number,
      title: bill?.title,
      summary: bill?.description,
      level: "Federal",
      jurisdiction: "United States",
      status: convertStatus(bill?.status),
      policy_area: "Unknown",
      introduced_date: bill?.status_date,
    }));

    const stateBillsRaw = Object.values(allBills?.state?.masterlist || []);
    const stateBillsMapped = stateBillsRaw.map((bill: any) => ({
      id: bill?.bill_id,
      bill_number: bill?.number,
      title: bill?.title,
      summary: bill?.description,
      level: "State",
      jurisdiction: "United States",
      status: convertStatus(bill?.status),
      policy_area: "Unknown",
      introduced_date: bill?.status_date,
    }));

    const combinedBills = [...federalBillsMapped, ...stateBillsMapped];

    return shuffle(combinedBills);
  }, [allBills]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight">Legislative Feed</h2>
            <p className="mt-2 text-pretty text-muted-foreground">
              Browse bill summaries from federal, state, and local governments
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner className="h-8 w-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading bills...</p>
          </div>
          {/* Skeleton loaders for better UX */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight">Legislative Feed</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Browse bill summaries from federal, state, and local governments
          </p>
        </div>
        <BillFeed bills={enrichedBills} />
      </main>
    </div>
  )
}
