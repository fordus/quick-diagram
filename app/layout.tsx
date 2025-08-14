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
  title: "Diagram Builder",
  description: "Create interactive diagrams with auto-layout and manual positioning"
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
