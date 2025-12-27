"use client"
import { useQuery } from "@tanstack/react-query";
import { useApiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { shuffle } from "@/app/utils/constants/constants";
import { BillFeed } from "@/components/bill-feed"

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

  const { data: allBills } = useQuery({
    queryKey: ["masterlist"],
    queryFn: getMasterList,
  });

  const enrichedBills = useMemo(() => {
    const federalBillsRaw = Object.values(allBills?.federal?.masterlist || []);
    const federalBillsMapped = federalBillsRaw.map((bill: any) => ({
      id: bill?.bill_id,
      bill_number: bill?.number,
      title: bill?.title,
      summary: bill?.description,
      level: "Federal",
      jurisdiction: "United States",
      status: bill?.status,
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
      status: bill?.status,
      policy_area: "Unknown",
      introduced_date: bill?.status_date,
    }));

    const combinedBills = [...federalBillsMapped, ...stateBillsMapped];

    return shuffle(combinedBills);
  }, [allBills]);

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
