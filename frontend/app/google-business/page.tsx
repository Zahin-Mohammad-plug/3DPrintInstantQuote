import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Maple Leaf 3D Google Business | Ottawa 3D Printing Reviews & Directions",
  description: "Find Maple Leaf 3D on Google Maps, leave a review for our Ottawa 3D printing service, or get directions to our location. Ottawa's most trusted 3D printing service with 5-star customer ratings.",
  keywords: "Maple Leaf 3D Google Business, Ottawa 3D printing reviews, 3D printing Ottawa directions, Ottawa 3D printing ratings, Ottawa 3D printing location, 3D printing shop Ottawa, contact 3D printing Ottawa",
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/google-business",
  },
}

export default function GoogleBusinessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Us on Google</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect with Maple Leaf 3D on Google to find directions, leave a review, or contact us directly.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Maple Leaf 3D on Google</h2>
                <p className="mb-4">
                  Maple Leaf 3D is Ottawa's premier 3D printing service, providing high-quality prints, fast turnaround times, and exceptional customer service.
                </p>
                <p className="mb-6">
                  We appreciate your support! If you've had a positive experience with our 3D printing services in Ottawa, please consider leaving us a review on Google.
                </p>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="https://g.page/r/your-google-id/review" target="_blank" rel="noopener noreferrer">
                      Leave a Google Review
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href="https://g.page/your-google-id" target="_blank" rel="noopener noreferrer">
                      Get Directions
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href="/contact">
                      Contact Us Directly
                    </Link>
                  </Button>
                </div>
              </div>              <div className="rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2803.951731299547!2d-75.72727372326146!3d45.32012154266707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce01080c6d15e5%3A0x5e9a74f03c878917!2s1165%20Beaverwood%20Rd%2C%20Manotick%2C%20ON%20K4M%201E2!5e0!3m2!1sen!2sca!4v1716347231368!5m2!1sen!2sca" 
                  width="100%" 
                  height="450" 
                  style={{ border: 0 }}
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Maple Leaf 3D Ottawa Location"
                  aria-label="Google Maps showing Maple Leaf 3D location in Ottawa"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Why Choose Maple Leaf 3D in Ottawa?</h2>
              <p className="mb-6">
                As Ottawa's trusted 3D printing service, we pride ourselves on delivering exceptional quality, fast turnaround times, and personalized service for all your 3D printing needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-8">
                <div>
                  <h3 className="text-lg font-bold mb-2">Local Expertise</h3>
                  <p className="text-muted-foreground">
                    Based in Ottawa, we understand the local market and provide personalized service with fast local delivery or pickup options.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Quality Guaranteed</h3>
                  <p className="text-muted-foreground">
                    We use professional-grade equipment and premium materials to ensure exceptional print quality every time.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Fast Turnaround</h3>
                  <p className="text-muted-foreground">
                    Most orders are completed within 1-3 business days, with rush services available for urgent projects.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/ottawa-3d-printing">
                    Explore Our Ottawa Services
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* JSON-LD for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Maple Leaf 3D - Ottawa 3D Printing Services",
              "image": "https://www.mapleleaf3d.ca/logo.png",
              "url": "https://www.mapleleaf3d.ca/",
              "telephone": "(613) 608-1430",
              "email": "info@mapleleaf3d.ca",
              "description": "Ottawa's premier 3D printing service offering high-quality prints, rapid prototyping, and custom 3D modeling for businesses and individuals.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1165 Beaverwood Rd",
                "addressLocality": "Ottawa",
                "addressRegion": "ON",
                "postalCode": "K4M 1L6",
                "addressCountry": "CA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 45.4215,
                "longitude": -75.6972
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "47",
                "bestRating": "5",
                "worstRating": "1"
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "10:00",
                  "closes": "16:00"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/mapleleaf3d",
                "https://www.instagram.com/mapleleaf3d",
                "https://g.page/your-google-id"
              ]
            })
          }}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
