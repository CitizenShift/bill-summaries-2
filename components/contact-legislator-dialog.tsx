"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Globe, MapPin, ExternalLink } from "lucide-react"
import useSWR from "swr"

interface Legislator {
  id: string
  name: string
  title: string
  level: string
  jurisdiction: string
  contact_email: string | null
  contact_phone: string | null
  office_address: string | null
  website_url: string | null
  role: string
}

interface ContactLegislatorDialogProps {
  billId: string
  billTitle: string
  billNumber: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactLegislatorDialog({
  billId,
  billTitle,
  billNumber,
  open,
  onOpenChange,
}: ContactLegislatorDialogProps) {
  const { data, isLoading } = useSWR(open ? `/api/legislators?billId=${billId}` : null)
  const legislators = data?.legislators || []

  const generateEmailBody = (legislatorName: string) => {
    return encodeURIComponent(
      `Dear ${legislatorName},\n\nI am writing to express my views on ${billNumber}: ${billTitle}.\n\n[Your message here]\n\nThank you for your consideration.\n\nSincerely,\n[Your name]`,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact Your Legislators</DialogTitle>
          <DialogDescription>Reach out to the legislators associated with {billNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium">{billTitle}</h4>
            <p className="text-sm text-muted-foreground">{billNumber}</p>
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground">Loading legislators...</p>
          ) : legislators.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No legislator contact information available for this bill.
            </p>
          ) : (
            <div className="space-y-4">
              {legislators.map((legislator: Legislator, index: number) => {
                return (
                  <div key={legislator.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{legislator.name}</h4>
                          <span className="text-xs text-muted-foreground capitalize">{legislator.role}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{legislator.title}</p>
                        <p className="text-xs text-muted-foreground">{legislator.jurisdiction}</p>
                      </div>

                      <div className="space-y-2">
                        {legislator.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Button variant="link" className="h-auto p-0 text-sm" asChild>
                              <a
                                href={`mailto:${legislator.contact_email}?subject=${encodeURIComponent(`Regarding ${billNumber}`)}&body=${generateEmailBody(legislator.name)}`}
                              >
                                {legislator.contact_email}
                              </a>
                            </Button>
                          </div>
                        )}

                        {legislator.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <Button variant="link" className="h-auto p-0 text-sm" asChild>
                              <a href={`tel:${legislator.contact_phone}`}>{legislator.contact_phone}</a>
                            </Button>
                          </div>
                        )}

                        {legislator.office_address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{legislator.office_address}</span>
                          </div>
                        )}

                        {legislator.website_url && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Button variant="link" className="h-auto p-0 text-sm" asChild>
                              <a href={legislator.website_url} target="_blank" rel="noopener noreferrer">
                                Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
