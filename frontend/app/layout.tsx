import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Maple Leaf 3D - 3D Printing & Design Services",
    template: "%s | Maple Leaf 3D",
  },
  description: "Maple Leaf 3D provides high-quality 3D printing, modeling, and on-demand print services in Ottawa and beyond.",
  manifest: "/favicon/site.webmanifest", // Link to the manifest file
  icons: {
    icon: "/favicon/favicon.ico", // Standard favicon
    apple: "/favicon/apple-touch-icon.png", // Apple touch icon
    // You can add other sizes or types here if needed
    // shortcut: '/favicon/favicon-16x16.png', // Example for specific sizes
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'