import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceContactForm } from "@/components/service-contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "3D Modeling Services Ottawa | Professional 3D Design",
  description:
    "Expert 3D modeling and design services in Ottawa. We transform your ideas into high-quality, printable 3D models for any application. Ottawa's trusted 3D design professionals.",
  keywords:
    "3D modeling Ottawa, 3D design Ottawa, CAD design Ottawa, 3D modeling service Ottawa, professional 3D designer Ottawa, 3D model creation Ottawa, custom 3D models Ottawa",
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/services/3d-modeling",
  },
}

export default function ThreeDModelingPage() {
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
              "name": "Maple Leaf 3D - Ottawa 3D Modeling Services",
              "description":
                "Professional 3D modeling and design services in Ottawa, Canada. We transform your ideas into high-quality, printable 3D models for any application.",
              "url": "https://www.mapleleaf3d.ca/services/3d-modeling",
              "telephone": "+1-613-608-1430",
              "email": "info@mapleleaf3d.ca",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1165 Beaverwood Rd",
                "addressLocality": "Ottawa",
                "addressRegion": "ON",
                "postalCode": "K4M 1L6",
                "addressCountry": "CA",
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 45.3200,
                "longitude": -75.7247,
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  "opens": "09:00",
                  "closes": "17:00",
                },
              ],
              "priceRange": "$$",
              "image": "https://www.mapleleaf3d.ca/banner-logo.png",
              "sameAs": [
                "https://www.facebook.com/mapleleaf3d",
                "https://www.instagram.com/mapleleaf3d",
              ],
              "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": 45.4215,
                  "longitude": -75.6972,
                },
                "geoRadius": "50000",
              },
              "makesOffer": {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "3D Modeling Services",
                  "description":
                    "Professional 3D modeling and design services in Ottawa for custom products, prototypes, artistic pieces, and technical parts.",
                },
              },
            }),
          }}
        />
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                3D Modeling & Design Services
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional 3D modeling services to bring your ideas to life. From
                concept to printable file, our designers create exactly what you need.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Expert 3D Modeling Services
                </h2>
                <p className="mb-4">
                  Our team of experienced 3D designers can transform your ideas,
                  sketches, or concepts into high-quality, printable 3D models ready
                  for production.
                </p>
                <p className="mb-6">
                  Whether you need a simple prototype, a complex mechanical part, or a
                  detailed artistic model, we have the expertise to deliver exceptional
                  results.
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
                    <p>Custom 3D modeling for any application</p>
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
                    <p>Optimization for 3D printing</p>
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
                    <p>Revisions until you're completely satisfied</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">                <img
                  src="/assets/modelService.png?height=400&width=600"
                  alt="Ottawa 3D Modeling Service - Professional 3D Design"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Our 3D Modeling Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Consultation</h3>
                  <p className="text-muted-foreground">
                    We discuss your needs, requirements, and specifications to
                    understand your vision.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Design & Modeling</h3>
                  <p className="text-muted-foreground">
                    Our designers create your 3D model with attention to detail and
                    functionality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Refinement & Delivery</h3>
                  <p className="text-muted-foreground">
                    We refine the model based on your feedback and deliver the final
                    files ready for printing.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link href="/contact">Request a Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg overflow-hidden border">                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Ottawa 3D Model Example 1 - Custom Game Piece"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">Custom Game Piece</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed character model for tabletop gaming
                  </p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border">                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Ottawa 3D Model Example 2 - Mechanical Part"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">Mechanical Part</h3>
                  <p className="text-sm text-muted-foreground">
                    Precision-engineered replacement component
                  </p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border">                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Ottawa 3D Model Example 3 - Architectural Model"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">Architectural Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed scale model of building concept
                  </p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border">                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Ottawa 3D Model Example 4 - Product Prototype"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">Product Prototype</h3>
                  <p className="text-sm text-muted-foreground">
                    Consumer product design for manufacturing
                  </p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border">                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Ottawa 3D Model Example 5 - Custom Jewelry"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">Custom Jewelry</h3>
                  <p className="text-sm text-muted-foreground">
                    Intricate design for lost wax casting
                  </p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border">                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Ottawa 3D Model Example 6 - Character Figurine"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">Character Figurine</h3>
                  <p className="text-sm text-muted-foreground">
                    Custom collectible based on client artwork
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Let's Bring Your Ideas to Life
                </h2>
                <p className="mb-6">
                  Contact us to discuss your 3D modeling project. We'll provide a free
                  consultation and quote based on your specific requirements.
                </p>
                <ServiceContactForm service="3D Modeling" />
              </div>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden">                  <img
                    src="/assets/printService.png?height=250&width=450" 
                    alt="Ottawa 3D Modeling Process - Professional Design Services"
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Our 3D Modeling Expertise</h3>
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
                      <p>Character and figurine design</p>
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
                      <p>Mechanical and functional parts</p>
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
                      <p>Architectural and product visualization</p>
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
                      <p>Jewelry and artistic designs</p>
                    </div>
                  </div>
                </div>
              </div>            </div>
          </div>
        </section>

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
                    src="/assets/podService.png?height=250&width=450" 
                    alt="Ottawa 3D printed parts packaged in clear bags for print on demand" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Print on Demand</h3>
                  <p className="text-muted-foreground mb-4">
                    Scalable production services for Ottawa businesses, with local support and fast delivery.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/services/print-on-demand">Learn More</Link>
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
      </main>

      {/* FAQ Section with Structured Data */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions About 3D Modeling in Ottawa</h2>

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
                    "name": "What 3D modeling services do you offer in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our Ottawa-based 3D modeling services include custom character design, mechanical parts modeling, architectural visualization, product prototyping, jewelry design, and technical CAD modeling. We cater to both creative and functional projects, with expertise in creating print-ready 3D models for any application."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How much does 3D modeling cost in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "3D modeling costs in Ottawa typically range from $50-$150 per hour depending on complexity, detail level, and technical requirements. We provide custom quotes based on your specific project needs, and our Ottawa team works efficiently to deliver high-quality models at competitive rates."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do I need to have a design ready for 3D modeling in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, you don't need a finished design. Our Ottawa 3D modeling team can work from concept sketches, reference images, verbal descriptions, or even rough ideas. We guide you through the entire process, from concept to finished 3D model, providing consultations to understand your vision and requirements."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How long does 3D modeling take in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Typical turnaround times for 3D modeling in Ottawa range from 2-7 business days, depending on complexity and detail level. Simple projects may be completed faster, while highly detailed or technical models may require more time. Our Ottawa team can provide a specific timeline estimate after understanding your project scope."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Which file formats do you deliver for 3D models in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We deliver 3D models in any format you need, including STL, OBJ, 3MF, STEP, FBX, and BLEND. For Ottawa clients requiring multiple formats for different applications, we provide all necessary conversions with your order. Our team ensures that files are optimized for your specific use case, whether for 3D printing, animation, or manufacturing."
                    }
                  }
                ]
              })
            }}
          />

          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">What 3D modeling services do you offer in Ottawa?</h3>
              <p className="text-muted-foreground">
                Our Ottawa-based 3D modeling services include custom character design, mechanical parts modeling, architectural visualization, product prototyping, jewelry design, and technical CAD modeling. We cater to both creative and functional projects, with expertise in creating print-ready 3D models for any application.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">How much does 3D modeling cost in Ottawa?</h3>
              <p className="text-muted-foreground">
                3D modeling costs in Ottawa typically range from $50-$150 per hour depending on complexity, detail level, and technical requirements. We provide custom quotes based on your specific project needs, and our Ottawa team works efficiently to deliver high-quality models at competitive rates.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Do I need to have a design ready for 3D modeling in Ottawa?</h3>
              <p className="text-muted-foreground">
                No, you don't need a finished design. Our Ottawa 3D modeling team can work from concept sketches, reference images, verbal descriptions, or even rough ideas. We guide you through the entire process, from concept to finished 3D model, providing consultations to understand your vision and requirements.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">How long does 3D modeling take in Ottawa?</h3>
              <p className="text-muted-foreground">
                Typical turnaround times for 3D modeling in Ottawa range from 2-7 business days, depending on complexity and detail level. Simple projects may be completed faster, while highly detailed or technical models may require more time. Our Ottawa team can provide a specific timeline estimate after understanding your project scope.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Which file formats do you deliver for 3D models in Ottawa?</h3>
              <p className="text-muted-foreground">
                We deliver 3D models in any format you need, including STL, OBJ, 3MF, STEP, FBX, and BLEND. For Ottawa clients requiring multiple formats for different applications, we provide all necessary conversions with your order. Our team ensures that files are optimized for your specific use case, whether for 3D printing, animation, or manufacturing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

