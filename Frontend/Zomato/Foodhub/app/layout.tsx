import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { Navbar } from "@/components/navbar"
import { ApiAnomalyProvider } from "./providers/apiAnomalyContext"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
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
        <ApiAnomalyProvider>
          <CartProvider>
            <Navbar />
            {children}
          </CartProvider>
        </ApiAnomalyProvider>
        <Analytics />
      </body>
    </html>
  )
}
