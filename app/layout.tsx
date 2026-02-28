import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Quick Diagram v2 - JSON-Driven Diagramming",
  description: "Create interactive diagrams from JSON with AI generation support. Powered by React Flow.",
}

export const viewport = {
  themeColor: "#1e293b",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <link rel="icon" type="image/x-icon" href="https://jidef.github.io/favicon/favicon.ico"></link>
      <body>{children}</body>
    </html>
  )
}
