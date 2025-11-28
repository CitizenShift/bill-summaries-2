"use client"
import { DataTable } from "@/components/data-table";
import { useQuery } from "@tanstack/react-query";
import { useApiService } from "@/services/api";

export default function HomePage() {
  const apiService = useApiService();

  const getSessions = async () => {
    try {
      const response: any = await apiService.get("/api/sessions");
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

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight">Legislative Feed</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Browse bill summaries from federal, state, and local governments
          </p>
        </div>
        {sessionRows?.length ? (
            <DataTable rows={sessionRows} />
        ) : null}
        {/*<BillFeed bills={enrichedBills} userId="guest" />*/}
      </main>
    </div>
  )
}
