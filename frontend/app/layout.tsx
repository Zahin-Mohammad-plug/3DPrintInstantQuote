import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Ottawa 3D Printing Services | Maple Leaf 3D",
    template: "%s | Ottawa 3D Printing - Maple Leaf 3D",
  },
  description: "Professional 3D printing services in Ottawa. Fast, high-quality prints for prototypes, custom parts, and production runs. Local service with city-wide delivery.",
  manifest: "/favicon/site.webmanifest", // Link to the manifest file
  icons: {
    icon: "/favicon/favicon.ico", // Standard favicon
    apple: "/favicon/apple-touch-icon.png", // Apple touch icon
    // You can add other sizes or types here if needed
    // shortcut: '/favicon/favicon-16x16.png', // Example for specific sizes
  },
  keywords: "3D printing Ottawa, Ottawa 3D printing service, custom 3D prints Ottawa, 3D printed prototypes Ottawa, rapid prototyping Ottawa, 3D model printing, PLA printing Ottawa, PETG printing Ottawa, ABS printing, local 3D printing service Ottawa",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://www.mapleleaf3d.ca/",
    title: "Ottawa 3D Printing Services | Maple Leaf 3D",
    description: "Professional 3D printing services in Ottawa. Fast, high-quality prints for prototypes, custom parts, and production runs. Local service with city-wide delivery.",
    siteName: "Maple Leaf 3D",
    images: [
      {
        url: "https://www.mapleleaf3d.ca/banner-logo.png", 
        width: 1200,
        height: 630,
        alt: "Maple Leaf 3D - Ottawa 3D Printing Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ottawa 3D Printing Services | Maple Leaf 3D",
    description: "Professional 3D printing services in Ottawa. Fast, high-quality prints for prototypes, custom parts, and production runs.",
    images: ["https://www.mapleleaf3d.ca/banner-logo.png"],
  },
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/",
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