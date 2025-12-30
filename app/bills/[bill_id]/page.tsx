"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useApiService } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, FileText, MapPin, Scale, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LEGISCAN_STATUS_LABELS } from "@/app/utils/constants/constants"
import { stateCodeToName } from "@/app/utils/constants/constants"

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
    full_description?: string
    billPdfUrl?: string
}

export default function BillDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const apiService = useApiService()
    const bill_id = params?.bill_id as string

    const getBillDetails = async () => {
        try {
            const response: any = await apiService.get(`/api/bills/${bill_id}`)
            const billData = response?.data?.bill
            const billPdfUrl = billData?.texts?.[0]?.url

            if (!billData) {
                throw new Error("Bill not found")
            }

            // Map the API response to our Bill interface
            const statusNumber = typeof billData.status === 'number' 
                ? billData.status 
                : (billData.status ? parseInt(billData.status) : null);
            const statusLabel = (statusNumber !== null && !isNaN(statusNumber))
                ? (LEGISCAN_STATUS_LABELS[statusNumber] ?? "Unknown")
                : "Unknown";

            return {
                id: billData.bill_id || bill_id,
                bill_number: billData.number || "",
                title: billData.title || "",
                summary: billData.description || "",
                level: billData?.state ? "State" : "Federal",
                jurisdiction: billData?.state ? stateCodeToName[billData.state] : "United States",
                status: statusLabel,
                policy_area: billData.subject || "Unknown",
                introduced_date: billData.status_date || new Date().toISOString(),
                full_description: billData.texts?.[0]?.text || billData.description || "",
                billPdfUrl: billPdfUrl || undefined,
            } as Bill
        } catch (error) {
            console.error("Error fetching bill details:", error)
            throw error
        }
    }

    const { data: bill, isLoading, error } = useQuery({
        queryKey: ["billDetails", bill_id],
        queryFn: getBillDetails,
        enabled: !!bill_id,
    })

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

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch {
            return dateString
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="mx-auto max-w-4xl px-4 py-8">
                    <div className="mb-6">
                        <Skeleton className="h-10 w-32 mb-4" />
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    if (error || !bill) {
        return (
            <div className="min-h-screen bg-background">
                <main className="mx-auto max-w-4xl px-4 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="mb-6 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Feed
                    </Button>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-lg font-medium text-muted-foreground">
                                {error ? "Error loading bill details" : "Bill not found"}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Please try again later or return to the feed.
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-4xl px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="mb-6 gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Feed
                </Button>

                {/* Bill Header */}
                <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4 flex-wrap">
                        <Badge variant="outline" className={getLevelColor(bill.level)}>
                            {bill.level}
                        </Badge>
                        <Badge variant="secondary">{bill.policy_area}</Badge>
                        <Badge variant="outline" className="ml-auto">
                            {bill.status}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold leading-tight text-balance mb-2">
                        {bill.title}
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        {bill.bill_number}
                    </p>
                </div>

                {/* Bill Information Card */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid gap-6 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Jurisdiction</p>
                                    <p className="text-muted-foreground">{bill.jurisdiction}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Introduced</p>
                                    <p className="text-muted-foreground">{formatDate(bill.introduced_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Scale className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Current Status</p>
                                    <p className="text-muted-foreground">{bill.status}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold">Summary</h2>
                        </div>
                        <p className="text-base leading-relaxed text-muted-foreground">
                            {bill.summary}
                        </p>
                    </CardContent>
                </Card>

                {/* Detailed Description Card */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Detailed Description</h2>
                        <div className="text-base leading-relaxed space-y-4 text-muted-foreground">
                            {bill.full_description ? (
                                bill.full_description.split("\n\n").map((paragraph, index) => (
                                    <p key={index} className="text-pretty">
                                        {paragraph}
                                    </p>
                                ))
                            ) : (
                                <p className="italic text-pretty">
                                    This bill {bill.level === "Federal" ? "would " : ""}
                                    {bill.summary.toLowerCase()} The legislation aims to address key concerns in the{" "}
                                    {bill.policy_area.toLowerCase()} sector and has been referred to committee for further review and
                                    potential amendments. Stakeholders from various organizations have expressed both support and
                                    concerns regarding the bill&apos;s provisions and potential impact on affected communities.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* PDF Viewer Card */}
                {bill.billPdfUrl && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Full Bill Document</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a
                                        href={bill.billPdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Open in New Tab
                                    </a>
                                </Button>
                            </div>
                            <div className="w-full border rounded-lg overflow-hidden bg-muted/30">
                                <object
                                    data={bill.billPdfUrl}
                                    type="application/pdf"
                                    className="w-full h-[800px]"
                                    aria-label="Bill PDF Document"
                                >
                                    <div className="flex flex-col items-center justify-center h-[800px] p-8 text-center">
                                        <p className="text-muted-foreground mb-4">
                                            Unable to display PDF in browser.
                                        </p>
                                        <Button
                                            variant="default"
                                            asChild
                                        >
                                            <a
                                                href={bill.billPdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="gap-2"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Download PDF
                                            </a>
                                        </Button>
                                    </div>
                                </object>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Key Provisions Card */}
                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Key Provisions</h2>
                        <ul className="text-base space-y-3 text-muted-foreground list-disc list-inside">
                            <li>Implementation timeline and effective dates for all provisions</li>
                            <li>Funding allocations and budgetary considerations</li>
                            <li>Oversight and reporting requirements for accountability</li>
                            <li>Enforcement mechanisms and penalty structures</li>
                            <li>Impact assessments for affected communities and stakeholders</li>
                        </ul>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

