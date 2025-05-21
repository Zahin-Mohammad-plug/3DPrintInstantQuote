import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceContactForm } from "@/components/service-contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Ottawa 3D Printing Services | Fast & Affordable Local 3D Prints",
  description: "Professional 3D printing services in Ottawa. We offer high-quality, fast turnaround 3D printing with a variety of materials for prototypes, custom parts, and production runs. Locally owned and operated.",
  keywords: "3D printing Ottawa, Ottawa 3D printing service, local 3D printing Ottawa, custom 3D prints Ottawa, 3D prototyping Ottawa, 3D printing company Ottawa, professional 3D printing Ottawa, rapid prototyping Ottawa, PLA printing Ottawa, PETG printing Ottawa",
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/ottawa-3d-printing",
  }
}

export default function OttawaThreeDPrintingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Ottawa 3D Printing Service</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional 3D printing with fast turnaround times, serving Ottawa and the surrounding areas with high-quality prints and exceptional service.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Local 3D Printing Solutions in Ottawa</h2>
                <p className="mb-4">
                  Maple Leaf 3D provides professional 3D printing services right here in Ottawa. We use high-quality materials and state-of-the-art equipment to deliver exceptional prints for all your projects.
                </p>
                <p className="mb-6">
                  Whether you need prototypes, custom parts, educational models, or production runs, our Ottawa-based 3D printing service offers fast turnaround times and competitive pricing.
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
                    <p>Local Ottawa service with convenient pickup options</p>
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
                    <p>Fast turnaround times for Ottawa businesses and residents</p>
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
                    <p>Premium PLA, PETG, ABS, TPU and specialty filaments materials with wide selection</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="/assets/x1c.png" 
                  alt="3D Printing Service in Ottawa" 
                  className="w-full h-auto" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Ottawa 3D Printing Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
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
                      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
                      <polygon points="12 15 17 21 7 21 12 15"></polygon>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Custom Prototyping</h3>
                  <p className="text-muted-foreground">
                    Rapid prototyping for Ottawa businesses and entrepreneurs. Turn your ideas into physical products quickly and affordably.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
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
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Production Parts</h3>
                  <p className="text-muted-foreground">
                    Small to medium run production for functional parts. Serving Ottawa businesses with reliable, consistent quality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
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
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Custom Models</h3>
                  <p className="text-muted-foreground">
                    Architectural models, educational props, art pieces, and more. Let us bring your creative ideas to life in Ottawa.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-lg overflow-hidden mb-6">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d179138.62602289335!2d-75.95501497143555!3d45.25028035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce05b25f5113af%3A0x8a6a51e131dd15ed!2sOttawa%2C%20ON!5e0!3m2!1sen!2sca!4v1716303245682!5m2!1sen!2sca" 
                    width="100%" 
                    height="300" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Maple Leaf 3D - Ottawa 3D Printing Services Location"
                  ></iframe>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Our Ottawa Location</h3>
                  <p className="text-muted-foreground mb-4">
                    Conveniently located in Ottawa to serve the entire National Capital Region, including Kanata, Nepean, Orleans, and Gatineau.
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
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <p>1165 Beaverwood Rd, Ottawa, ON K4M 1L6</p>
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
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <p>(613) 608-1430</p>
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
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </div>
                      <p>info@mapleleaf3d.ca</p>
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <p>Monday-Friday: 9am-6pm • Saturday: 10am-4pm • Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl font-bold mb-4">Ottawa's Premier 3D Printing Service</h2>
                <p className="mb-4">
                  At Maple Leaf 3D, we provide Ottawa residents and businesses with access to professional-grade 3D printing without the high costs of purchasing and maintaining your own equipment.
                </p>
                <p className="mb-4">
                  Our Ottawa-based team of experts will help you through every step of the process, from file preparation to material selection and final finishing.
                </p>
                <p className="mb-6">
                  Whether you're looking to create a prototype for your startup, educational models for your classroom, or custom parts for your project, we're your local 3D printing solution in Ottawa.
                </p>
                <div className="space-y-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/upload">Get an Instant Quote</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/services/3d-printing">Learn More About Our Services</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-2">How much does 3D printing cost in Ottawa?</h3>
                <p className="text-muted-foreground mb-4">
                  Our 3D printing costs in Ottawa are based on material usage, print time, and complexity. We offer competitive rates starting at just $5 for small prints, with instant quotes available through our online system.
                </p>

                <h3 className="text-lg font-bold mb-2">What areas of Ottawa do you serve?</h3>
                <p className="text-muted-foreground mb-4">
                  We serve all areas of Ottawa including downtown, Kanata, Nepean, Orleans, Barrhaven, and surrounding areas. We offer convenient pickup options and delivery throughout the National Capital Region.
                </p>

                <h3 className="text-lg font-bold mb-2">What materials can you print with in Ottawa?</h3>
                <p className="text-muted-foreground mb-4">
                  We offer a wide range of materials including PLA, PETG, ABS, TPU, and specialty filaments. Each material has different properties suitable for various applications, from decorative models to functional parts.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">How long does 3D printing take in Ottawa?</h3>
                <p className="text-muted-foreground mb-4">
                  Turnaround times depend on the size and complexity of your project, but most orders are completed within 1-3 business days. We also offer rush services for Ottawa clients who need their prints faster.
                </p>

                <h3 className="text-lg font-bold mb-2">Do you offer 3D printing for businesses in Ottawa?</h3>
                <p className="text-muted-foreground mb-4">
                  Yes! We work with many Ottawa businesses for prototyping, small-batch production, and custom parts. We offer volume discounts and can establish ongoing relationships for regular printing needs.
                </p>

                <h3 className="text-lg font-bold mb-2">What file formats do you accept?</h3>
                <p className="text-muted-foreground mb-4">
                  We accept STL, OBJ, 3MF, and other common 3D file formats. If you have a different format or need help preparing your file for printing, our Ottawa team is happy to assist.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-4">Contact Our Ottawa 3D Printing Team</h2>
                <p className="mb-6">
                  Have questions about our 3D printing services in Ottawa? Fill out the form and our local team will get back to you quickly with the information you need.
                </p>
                <ServiceContactForm service="Ottawa 3D Printing" />
              </div>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src="/assets/contac.png?height=300&width=500"
                    alt="Ottawa 3D Printing Examples"
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Why Choose Our Ottawa 3D Printing Service?</h3>
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
                      <p>Locally owned and operated in Ottawa</p>
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
                      <p>Professional-grade equipment for consistent quality</p>
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
                      <p>Fast turnaround times for Ottawa clients</p>
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
                      <p>Competitive pricing with no hidden fees</p>
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
                      <p>Expert advice and support throughout your project</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* JSON-LD structured data for Local Business */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Maple Leaf 3D",
            "image": "https://www.mapleleaf3d.ca/logo.png",
            "url": "https://www.mapleleaf3d.ca/",
            "telephone": "(613) 555-0123",
            "email": "info@mapleleaf3d.ca",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Printing Avenue",
              "addressLocality": "Ottawa",
              "addressRegion": "ON",
              "postalCode": "K2P 1Y6",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 45.4215,
              "longitude": -75.6972
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
            "priceRange": "$$",
            "description": "Professional 3D printing services in Ottawa and the surrounding region. We offer high-quality, fast turnaround 3D printing with a variety of materials for prototypes, custom parts, and production runs.",
            "sameAs": [
              "https://www.facebook.com/mapleleaf3d",
              "https://www.instagram.com/mapleleaf3d",
              "https://twitter.com/mapleleaf3d"
            ]
          })
        }}
      />
      
      {/* FAQ schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How much does 3D printing cost in Ottawa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our 3D printing costs in Ottawa are based on material usage, print time, and complexity. We offer competitive rates starting at just $5 for small prints, with instant quotes available through our online system."
                }
              },
              {
                "@type": "Question",
                "name": "What areas of Ottawa do you serve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We serve all areas of Ottawa including downtown, Kanata, Nepean, Orleans, Barrhaven, and surrounding areas. We offer convenient pickup options and delivery throughout the National Capital Region."
                }
              },
              {
                "@type": "Question",
                "name": "What materials can you print with in Ottawa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer a wide range of materials including PLA, PETG, ABS, TPU, and specialty filaments. Each material has different properties suitable for various applications, from decorative models to functional parts."
                }
              },
              {
                "@type": "Question",
                "name": "How long does 3D printing take in Ottawa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Turnaround times depend on the size and complexity of your project, but most orders are completed within 1-3 business days. We also offer rush services for Ottawa clients who need their prints faster."
                }
              },
              {
                "@type": "Question",
                "name": "Do you offer 3D printing for businesses in Ottawa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We work with many Ottawa businesses for prototyping, small-batch production, and custom parts. We offer volume discounts and can establish ongoing relationships for regular printing needs."
                }
              },
              {
                "@type": "Question",
                "name": "What file formats do you accept?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We accept STL, OBJ, 3MF, and other common 3D file formats. If you have a different format or need help preparing your file for printing, our Ottawa team is happy to assist."
                }
              }
            ]
          })
        }}
      />
      
      <SiteFooter />
    </div>
  )
}
