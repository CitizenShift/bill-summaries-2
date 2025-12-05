"use client"
import { DataTable } from "@/components/data-table";
import { useQuery } from "@tanstack/react-query";
import { useApiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomePage() {
  const apiService = useApiService();
  const { user } = useAuth();
  const state = user?.user_metadata?.state || "FL";
  const [billLevel, setBillLevel] = useState<string>("federal");

  const getFederalBills = async () => {
    try {
      const response: any = await apiService.get(`/api/sessions?state=US`);
      return response?.data?.sessions;
    } catch (error) {
      console.log(error);
    }
  }

  const { data: federalBills } = useQuery({
    queryKey: ["federalBills"],
    queryFn: getFederalBills,
  });

  const getSessions = async () => {
    try {
      const response: any = await apiService.get(`/api/sessions?state=${state}`);
      return response?.data?.sessions;
    } catch (error: any) {
      console.error(error);
    }
  }

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
  });

  const sessionRows = sessions?.map((session: any) => ({
    session_id: session?.session_id,
    state_abbr: session?.state_abbr,
    session_tag: session?.session_tag,
    name: session?.name,
  })) || [];

  const federalRows = federalBills?.map((session: any) => ({
    session_id: session?.session_id,
    state_abbr: session?.state_abbr,
    session_tag: session?.session_tag,
    name: session?.name,
  })) || [];

  const rows = billLevel === "federal" ? federalRows : sessionRows;
  const level = billLevel === "federal" ? "Federal" : "State";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight">Legislative Feed</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Browse bill summaries from federal, state, and local governments
          </p>
        </div>
        <div className="w-full flex items-center justify-center gap-x-2">
          <Button onClick={() => setBillLevel("federal")} className="cursor-pointer">
            Federal
          </Button>
          <Button variant="outline" onClick={() => setBillLevel("state")} className="cursor-pointer">
            State
          </Button>
        </div>
        {rows?.length ? (
            <DataTable rows={rows} level={level} />
        ) : null}
        {/*<BillFeed bills={enrichedBills} userId="guest" />*/}
      </main>
    </div>
  )
}
