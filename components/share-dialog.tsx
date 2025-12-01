"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Mail, MessageCircle, Facebook, Twitter, Instagram } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bill {
    id: string
    bill_number: string
    title: string
    summary: string
    level: string
    jurisdiction: string
}

interface ShareDialogProps {
    bill: Bill
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ShareDialog({ bill, open, onOpenChange }: ShareDialogProps) {
    const [email, setEmail] = useState("")
    const { toast } = useToast()

    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}?bill=${bill.id}` : ""

    const shareText = `Check out ${bill.bill_number}: ${bill.title}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            toast({
                title: "Link copied!",
                description: "Share link copied to clipboard",
            })
        } catch (error) {
            toast({
                title: "Failed to copy",
                description: "Could not copy link to clipboard",
                variant: "destructive",
            })
        }
    }

    const handleEmailShare = () => {
        if (!email) {
            toast({
                title: "Email required",
                description: "Please enter an email address",
                variant: "destructive",
            })
            return
        }

        // In a real app, this would send to your backend API
        toast({
            title: "Shared via email",
            description: `Bill shared with ${email}`,
        })
        setEmail("")
    }

    const handleExternalShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl)
        const encodedText = encodeURIComponent(shareText)

        let url = ""

        switch (platform) {
            case "twitter":
                url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
                break
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                break
            case "instagram":
                navigator.clipboard.writeText(shareUrl)
                toast({
                    title: "Link copied for Instagram",
                    description: "Open Instagram and paste the link in your story or post",
                })
                return
            case "sms":
                url = `sms:?body=${encodedText} ${encodedUrl}`
                break
            case "email":
                url = `mailto:?subject=${encodeURIComponent(bill.bill_number)}&body=${encodedText}%0A%0A${encodedUrl}`
                break
        }

        if (url) {
            window.open(url, "_blank", "noopener,noreferrer")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Bill</DialogTitle>
                    <DialogDescription>Share {bill.bill_number} with friends or on social media</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Share with app users */}
                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Share with app users
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="friend@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleEmailShare()
                                    }
                                }}
                            />
                            <Button onClick={handleEmailShare}>Send</Button>
                        </div>
                    </div>

                    {/* Copy link */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Copy link</Label>
                        <div className="flex gap-2">
                            <Input value={shareUrl} readOnly className="flex-1" />
                            <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* External sharing */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Share externally</Label>
                        <div className="grid grid-cols-5 gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex flex-col gap-2 h-auto py-3 bg-transparent"
                                onClick={() => handleExternalShare("email")}
                            >
                                <Mail className="h-5 w-5" />
                                <span className="text-xs">Email</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex flex-col gap-2 h-auto py-3 bg-transparent"
                                onClick={() => handleExternalShare("sms")}
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span className="text-xs">Text</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex flex-col gap-2 h-auto py-3 bg-transparent"
                                onClick={() => handleExternalShare("twitter")}
                            >
                                <Twitter className="h-5 w-5" />
                                <span className="text-xs">Twitter</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex flex-col gap-2 h-auto py-3 bg-transparent"
                                onClick={() => handleExternalShare("facebook")}
                            >
                                <Facebook className="h-5 w-5" />
                                <span className="text-xs">Facebook</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex flex-col gap-2 h-auto py-3 bg-transparent"
                                onClick={() => handleExternalShare("instagram")}
                            >
                                <Instagram className="h-5 w-5" />
                                <span className="text-xs">Instagram</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}