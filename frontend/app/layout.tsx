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
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
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
    countryName: "Canada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ottawa 3D Printing Services | Maple Leaf 3D",
    description: "Professional 3D printing services in Ottawa. Fast, high-quality prints for prototypes, custom parts, and production runs.",
    images: ["https://www.mapleleaf3d.ca/banner-logo.png"],
    creator: "@mapleleaf3d",
    site: "@mapleleaf3d",
  },
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/",
    languages: {
      'en': 'https://www.mapleleaf3d.ca/',
      'fr-CA': 'https://www.mapleleaf3d.ca/fr/',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Web Vitals & Analytics script */}
        <script 
          defer 
          src="https://static.cloudflareinsights.com/beacon.min.js" 
          data-cf-beacon='{"token": "364601feec634747bd09b78bd5779978"}'
        />

        {/* Organization Schema for All Pages */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Maple Leaf 3D",
              "url": "https://www.mapleleaf3d.ca",
              "logo": "https://www.mapleleaf3d.ca/logo.png",
              "slogan": "Ottawa's Premier 3D Printing Service",
              "description": "Professional 3D printing services in Ottawa, Canada. We provide high-quality prints, 3D modeling, and print-on-demand services for businesses and individuals in the Ottawa region.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1165 Beaverwood Rd",
                "addressLocality": "Ottawa",
                "addressRegion": "ON",
                "postalCode": "K4M 1L6",
                "addressCountry": "CA"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-613-608-1430",
                "contactType": "customer service",
                "areaServed": "Ottawa",
                "availableLanguage": ["English", "French"]
              },
              "sameAs": [
                "https://www.facebook.com/mapleleaf3d",
                "https://www.instagram.com/mapleleaf3d",
                "https://twitter.com/mapleleaf3d"
              ]
            })
          }}
        />
      </head>
      
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}