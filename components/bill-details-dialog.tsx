"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, FileText, MapPin, Scale } from "lucide-react"

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
}

interface BillDetailsDialogProps {
    bill: Bill
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BillDetailsDialog({ bill, open, onOpenChange }: BillDetailsDialogProps) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh]">
                <DialogHeader>
                    <div className="flex items-start gap-3 mb-2">
                        <Badge variant="outline" className={getLevelColor(bill.level)}>
                            {bill.level}
                        </Badge>
                        <Badge variant="secondary">{bill.policy_area}</Badge>
                        <Badge variant="outline" className="ml-auto">
                            {bill.status}
                        </Badge>
                    </div>
                    <DialogTitle className="text-2xl leading-tight text-balance pr-6">{bill.title}</DialogTitle>
                    <DialogDescription className="text-base font-medium">{bill.bill_number}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6 py-4">
                        {/* Bill Information */}
                        <div className="grid gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Jurisdiction</p>
                                    <p className="text-muted-foreground">{bill.jurisdiction}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Introduced</p>
                                    <p className="text-muted-foreground">{formatDate(bill.introduced_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Scale className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Current Status</p>
                                    <p className="text-muted-foreground">{bill.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold">Summary</h4>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{bill.summary}</p>
                        </div>

                        {/* Full Description */}
                        <div>
                            <h4 className="font-semibold mb-3">Detailed Description</h4>
                            <div className="text-sm leading-relaxed space-y-3 text-muted-foreground">
                                {bill.full_description ? (
                                    bill.full_description.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)
                                ) : (
                                    <p className="italic">
                                        This bill {bill.level === "federal" ? "would " : ""}
                                        {bill.summary.toLowerCase()} The legislation aims to address key concerns in the{" "}
                                        {bill.policy_area.toLowerCase()} sector and has been referred to committee for further review and
                                        potential amendments. Stakeholders from various organizations have expressed both support and
                                        concerns regarding the bill's provisions and potential impact on affected communities.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Key Provisions */}
                        <div>
                            <h4 className="font-semibold mb-3">Key Provisions</h4>
                            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Implementation timeline and effective dates for all provisions</li>
                                <li>Funding allocations and budgetary considerations</li>
                                <li>Oversight and reporting requirements for accountability</li>
                                <li>Enforcement mechanisms and penalty structures</li>
                                <li>Impact assessments for affected communities and stakeholders</li>
                            </ul>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
