import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SWRProvider } from "@/components/swr-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/app/providers";

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bill Summaries",
  description: "Stay informed on legislation that matters",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <header className="border-b">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <h1 className="text-xl font-bold">Bill Summaries</h1>
            <p className="text-sm text-muted-foreground">Stay informed on legislation that matters</p>
          </div>
        </header>
        <SWRProvider>
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </SWRProvider>
        <Analytics />
      </body>
    </html>
  )
}
