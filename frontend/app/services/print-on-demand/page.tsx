import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceContactForm } from "@/components/service-contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Print on Demand Services Ottawa | Maple Leaf 3D",
  description:
    "Professional print on demand services in Ottawa. We handle your 3D printing production and fulfillment needs, so you can focus on design and sales. Ottawa's trusted 3D printing partner.",
  keywords:
    "print on demand Ottawa, 3D print fulfillment Ottawa, 3D printing production Ottawa, 3D printing business services Ottawa, POD services Ottawa, 3D printing partner Ottawa",
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/services/print-on-demand",
  },
}

export default function PrintOnDemandPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        {/* JSON-LD Schema for LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Maple Leaf 3D - Ottawa 3D Printing Services",
              "description": "Professional 3D printing services in Ottawa, Canada. We provide high-quality prints in various materials including PLA, PETG, and ABS.",
              "url": "https://www.mapleleaf3d.ca/services/3d-printing",
              "telephone": "+1-613-608-1430",
              "email": "contact@mapleleaf3d.ca",
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
                "latitude": 45.3200,
                "longitude": -75.7247
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                  ],
                  "opens": "09:00",
                  "closes": "17:00"
                }
              ],
              "priceRange": "$$",
              "image": "https://www.mapleleaf3d.ca/banner-logo.png",
              "sameAs": [
                "https://www.facebook.com/mapleleaf3d",
                "https://www.instagram.com/mapleleaf3d"
              ],
              "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": 45.4215,
                  "longitude": -75.6972
                },
                "geoRadius": "50000"
              },
              "makesOffer": {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Print on Demand 3D Printing Services",
                  "description": "Professional 3D printing production and fulfillment services for businesses in Ottawa."
                }
              }
            })
          }}
        />
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Print on Demand Service</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Scalable production services for businesses. We handle inventory, printing, and fulfillment so you can
                focus on design and sales.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>                <h2 className="text-2xl font-bold mb-4">Streamline Your Production Process</h2>
                <p className="mb-4">
                  Our Ottawa-based Print on Demand service is designed for businesses and creators who need reliable, scalable
                  production without the hassle of managing inventory or equipment.
                </p>
                <p className="mb-6">
                  We handle everything from printing to packaging and shipping, allowing you to focus on design,
                  marketing, and growing your business in the Ottawa region and beyond.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p>No minimum order quantities</p>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p>Consistent quality and fast turnaround</p>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p>White-label packaging and branding options</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">                <img
                  src="/assets/pod.png?height=400&width=600"
                  alt="Ottawa Print on Demand Service - 3D Printing Production Services"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">How Our Print on Demand Service Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Upload Your Designs</h3>
                  <p className="text-muted-foreground">
                    Provide your 3D model files and specifications for your products.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Set Up Your Store</h3>
                  <p className="text-muted-foreground">
                    Connect your e-commerce platform or use our API for seamless integration.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Sell Your Products</h3>
                  <p className="text-muted-foreground">Focus on marketing and sales while we handle production.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">We Fulfill Orders</h3>
                  <p className="text-muted-foreground">We print, package, and ship directly to your customers.</p>
                </CardContent>
              </Card>
            </div>            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link href="/contact">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary/5">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Ottawa's Premier 3D Print on Demand Service</h2>
                <p className="mb-4">
                  Based in the heart of Ottawa, Maple Leaf 3D provides local businesses with reliable, high-quality 3D print on demand services with the convenience of local support and faster delivery times.
                </p>
                <p className="mb-6">
                  Partner with us to reduce shipping costs, support the local economy, and benefit from our personalized service that understands the unique needs of Ottawa businesses.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p>Local pickup options for Ottawa businesses</p>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p>Faster delivery within the Ottawa area</p>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p>Local customer support and consultations</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d179484.57493256403!2d-75.89455232226638!3d45.25019105557196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce05b25f5113af%3A0x8a6a51e131dd15ed!2sOttawa%2C%20ON!5e0!3m2!1sen!2sca!4v1653052855704!5m2!1sen!2sca" 
                  width="100%" 
                  height="400" 
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

        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Perfect For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                    <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                    <line x1="12" y1="22" x2="12" y2="13"></line>
                    <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">E-commerce Businesses</h3>
                <p className="text-muted-foreground">
                  Expand your product line without inventory risk or upfront investment.
                </p>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9z"></path>
                    <path d="M12 7v5l3 3"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Artists & Designers</h3>
                <p className="text-muted-foreground">
                  Turn your designs into physical products without managing production.
                </p>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Small Businesses</h3>
                <p className="text-muted-foreground">
                  Scale your production capacity without investing in equipment or staff.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-4">Ready to Scale Your Business?</h2>
                <p className="mb-6">
                  Contact us to discuss your print on demand needs. We'll create a custom solution that fits your
                  business model and helps you grow.
                </p>
                <ServiceContactForm service="Print on Demand" />
              </div>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden">                  <img
                    src="/assets/podcont.png?height=300&width=500"
                    alt="Phone-shot desk view with shipping labels, 3D printed parts, and form on laptop"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Our Print on Demand Advantages</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p>No inventory costs or risks</p>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p>Seamless integration with major e-commerce platforms</p>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p>Automated order processing and fulfillment</p>
                    </div>
                    <div className="flex items-start">
                      <div className="rounded-full bg-primary/10 p-1 mr-3 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p>Volume discounts for growing businesses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>        </section>
      </main>

      {/* FAQ Section with Structured Data */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions About Ottawa Print on Demand</h2>

          {/* FAQ Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How does print on demand work in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our Ottawa-based print on demand service allows businesses to sell 3D printed products without maintaining inventory. When your customer orders, we print, package, and ship the item directly to them. This reduces costs and eliminates inventory risk while providing local, fast service."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What are the advantages of using a local Ottawa 3D print on demand service?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Working with a local Ottawa 3D printing service provides faster delivery times to local customers, reduced shipping costs, local support and consultation, and the ability to easily check quality in person. It also helps support the local Ottawa economy."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do you offer pickup options for Ottawa businesses?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, we offer convenient local pickup options for Ottawa businesses, which can help reduce shipping costs and provide even faster access to your printed products."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What types of businesses in Ottawa use your print on demand services?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our print on demand services are used by Ottawa e-commerce businesses, artists and designers, manufacturing companies, architects, educational institutions, and many other organizations that need scalable 3D printing production."
                    }
                  }
                ]
              })
            }}
          />

          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">How does print on demand work in Ottawa?</h3>
              <p className="text-muted-foreground">
                Our Ottawa-based print on demand service allows businesses to sell 3D printed products without maintaining inventory. When your customer orders, we print, package, and ship the item directly to them. This reduces costs and eliminates inventory risk while providing local, fast service.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">What are the advantages of using a local Ottawa 3D print on demand service?</h3>
              <p className="text-muted-foreground">
                Working with a local Ottawa 3D printing service provides faster delivery times to local customers, reduced shipping costs, local support and consultation, and the ability to easily check quality in person. It also helps support the local Ottawa economy.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Do you offer pickup options for Ottawa businesses?</h3>
              <p className="text-muted-foreground">
                Yes, we offer convenient local pickup options for Ottawa businesses, which can help reduce shipping costs and provide even faster access to your printed products.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">What types of businesses in Ottawa use your print on demand services?</h3>
              <p className="text-muted-foreground">
                Our print on demand services are used by Ottawa e-commerce businesses, artists and designers, manufacturing companies, architects, educational institutions, and many other organizations that need scalable 3D printing production.
              </p>
            </div>          </div>
        </div>
      </section>
      
      {/* Related Ottawa Services */}
      <section className="py-12 bg-muted/10">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Related Ottawa 3D Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background shadow-sm rounded-lg overflow-hidden border">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/assets/printServ.png??height=250&width=450" 
                  alt="Ottawa 3D Printing Services" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">3D Printing Services</h3>
                <p className="text-muted-foreground mb-4">
                  High-quality 3D printing in Ottawa with multiple materials and finishes for all your project needs.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/services/3d-printing">Learn More</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-background shadow-sm rounded-lg overflow-hidden border">
              <div className="aspect-video relative overflow-hidden">
                  <img 
                    src="/assets/printService.png?height=250&width=450" 
                    alt="Hands using CAD software for 3D modeling in a studio" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">3D Modeling Services</h3>
                <p className="text-muted-foreground mb-4">
                  Professional 3D design and modeling services in Ottawa for all your creative and technical needs.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/services/3d-modeling">Learn More</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-background shadow-sm rounded-lg overflow-hidden border">
              <div className="aspect-video relative overflow-hidden">
                  <img 
                    src="/assets/ottService.png?height=250&width=450" 
                    alt="Ottawa Dedicated 3D Printing Services" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Ottawa 3D Services</h3>
                <p className="text-muted-foreground mb-4">
                  Specialized 3D printing and design services tailored for Ottawa businesses and individuals.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/ottawa-3d-printing">Explore</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  )
}

