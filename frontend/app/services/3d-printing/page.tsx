import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceContactForm } from "@/components/service-contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Professional 3D Printing Services Ottawa | Maple Leaf 3D",
  description:
    "High-quality 3D printing services in Ottawa with a wide range of materials including PLA, PETG, and ABS. Perfect for prototypes, custom parts, and small production runs.",
  keywords:
    "3D printing Ottawa, 3D printing service Ottawa, 3D printer Ottawa, PLA printing Ottawa, PETG printing Ottawa, ABS printing Ottawa, custom 3D prints Ottawa",
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/services/3d-printing",
  },
}

export default function ThreeDPrintingPage() {
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
                  "name": "3D Printing Services",
                  "description": "Professional 3D printing services using PLA, PETG, ABS and specialty materials in Ottawa."
                }
              }
            })
          }}
        />
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">3D Printing Service</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                High-quality 3D printing with a variety of materials and finishes. Perfect for prototypes, custom parts,
                and small production runs.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Professional 3D Printing Solutions</h2>
                <p className="mb-4">
                  Our 3D printing service offers high-quality prints using the latest technology and premium materials.
                  Whether you need a prototype, custom part, or small production run, we can help bring your ideas to
                  life.
                </p>
                <p className="mb-6">
                  We offer a wide range of materials including PLA, PETG, ABS, and specialty filaments, with multiple
                  color options to suit your specific needs.
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
                    <p>High-quality prints with precise details</p>
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
                    <p>Multiple material options for different applications</p>
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
                    <p>Fast turnaround times and competitive pricing</p>
                  </div>
                </div>
              </div>              <div className="rounded-lg overflow-hidden">
                <img src="/assets/X1Carbon-1.jpg?height=400&width=600" alt="3D Printing Service in Ottawa" className="w-full h-auto" loading = "lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Our 3D Printing Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Upload Your Model</h3>
                  <p className="text-muted-foreground">
                    Upload your 3D model file in STL, OBJ, 3MF, or STEP format. We'll check it for printability.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Choose Materials & Options</h3>
                  <p className="text-muted-foreground">
                    Select your preferred material, color, and print settings. Get an instant quote for your project.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Receive Your Print</h3>
                  <p className="text-muted-foreground">
                    We'll print your model with precision and care, then ship it directly to your door.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link href="/upload">Start Your 3D Print</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Materials We Offer</h2>
            <Tabs defaultValue="pla">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="pla">PLA</TabsTrigger>
                <TabsTrigger value="petg">PETG</TabsTrigger>
                <TabsTrigger value="abs">ABS</TabsTrigger>
              </TabsList>
              <TabsContent value="pla">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-bold mb-3">PLA (Polylactic Acid)</h3>
                    <p className="mb-4">
                      PLA is our most popular material for decorative prints. It's biodegradable, easy to print with,
                      and comes in the widest range of colors.
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="font-medium">Best for:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Decorative items</li>
                        <li>Low-stress applications</li>
                        <li>Detailed models</li>
                        <li>Indoor use</li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available in 12+ colors including White, Black, Red, Blue, Green, Yellow, Orange, Purple, Pink,
                      Teal, Gold, and Silver.
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden">                    <img
                      src="/assets/pla.png?height=300&width=500"
                      alt="PLA 3D Printing Material Ottawa"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="petg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-bold mb-3">PETG (Polyethylene Terephthalate Glycol)</h3>
                    <p className="mb-4">
                      PETG offers excellent durability and weather resistance, making it perfect for outdoor
                      applications and functional parts.
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="font-medium">Best for:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Outdoor use</li>
                        <li>Water-resistant applications</li>
                        <li>Functional parts</li>
                        <li>UV-resistant items</li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available in multiple colors.
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden">                    <img
                      src="/assets/petg.png?height=300&width=500"
                      alt="3D-printed multi-color PETG gear assembly on concrete in Ottawa"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="abs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-bold mb-3">ABS (Acrylonitrile Butadiene Styrene)</h3>
                    <p className="mb-4">
                      ABS is our most durable material, ideal for commercial and industrial applications that require
                      strength and heat resistance.
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="font-medium">Best for:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Structural components</li>
                        <li>High-stress applications</li>
                        <li>Heat-resistant parts</li>
                        <li>Commercial/industrial use</li>
                      </ul>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available in 4 colors including White, Black, Red, and Blue.
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src="/assets/abs.png?height=300&width=500"
                      alt="ABS 3D-printed engine bracket installed inside car engine bay in Ottawa"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-4">Contact Us About Your Project</h2>
                <p className="mb-6">
                  Have questions about our 3D printing service or need help with a specific project? Fill out the form
                  and we'll get back to you as soon as possible.
                </p>
                <ServiceContactForm service="3D Printing" />
              </div>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src="/assets/printer.png?height=300&width=500"
                    alt="Ottawa 3D Printing Process - Professional Printing Results"
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Why Choose Our 3D Printing Service?</h3>
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
                      <p>Expert technicians who review every model before printing</p>
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
                      <p>Competitive pricing with volume discounts available</p>
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
                      <p>Fast turnaround times with rush options available</p>
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
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions About 3D Printing in Ottawa</h2>

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
                    "name": "What materials do you offer for 3D printing in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We offer a wide range of materials for 3D printing in Ottawa, including PLA (for decorative prints), PETG (for outdoor and functional parts), and ABS (for durable components). Each material has unique properties suitable for different applications, and our Ottawa team can help you select the right one for your project."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How long does 3D printing take in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Typical turnaround times for 3D printing in Ottawa range from 1-3 business days for standard orders, depending on complexity and size. We also offer expedited printing services for urgent projects, with same-day or next-day options available for Ottawa customers."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What is the printing resolution you offer in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We offer multiple printing resolutions in Ottawa: Standard (0.2mm layer height), High (0.1mm layer height), and Ultra (0.05mm layer height). The finer the resolution, the smoother the surface finish, though print time increases. Our Ottawa experts can recommend the best resolution for your specific project needs."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do you offer color 3D printing in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, we offer a wide variety of colors for 3D printing in Ottawa. We stock many popular colors and can also handle multi-color prints through various techniques. For businesses in Ottawa requiring specific brand colors, we can match or closely approximate your color requirements."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can you help with 3D model design in Ottawa?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Absolutely! Our Ottawa team includes experienced 3D designers who can help create, modify, or optimize your 3D models. Whether you have a rough sketch, a concept, or need modifications to an existing file, our Ottawa-based design team can assist with professional 3D modeling services."
                    }
                  }
                ]
              })
            }}
          />

          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">What materials do you offer for 3D printing in Ottawa?</h3>
              <p className="text-muted-foreground">
                We offer a wide range of materials for 3D printing in Ottawa, including PLA (for decorative prints), PETG (for outdoor and functional parts), and ABS (for durable components). Each material has unique properties suitable for different applications, and our Ottawa team can help you select the right one for your project.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">How long does 3D printing take in Ottawa?</h3>
              <p className="text-muted-foreground">
                Typical turnaround times for 3D printing in Ottawa range from 1-3 business days for standard orders, depending on complexity and size. We also offer expedited printing services for urgent projects, with same-day or next-day options available for Ottawa customers.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">What is the printing resolution you offer in Ottawa?</h3>
              <p className="text-muted-foreground">
                We offer multiple printing resolutions in Ottawa: Standard (0.2mm layer height), High (0.1mm layer height), and Ultra (0.05mm layer height). The finer the resolution, the smoother the surface finish, though print time increases. Our Ottawa experts can recommend the best resolution for your specific project needs.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Do you offer color 3D printing in Ottawa?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a wide variety of colors for 3D printing in Ottawa. We stock many popular colors and can also handle multi-color prints through various techniques. For businesses in Ottawa requiring specific brand colors, we can match or closely approximate your color requirements.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Can you help with 3D model design in Ottawa?</h3>
              <p className="text-muted-foreground">
                Absolutely! Our Ottawa team includes experienced 3D designers who can help create, modify, or optimize your 3D models. Whether you have a rough sketch, a concept, or need modifications to an existing file, our Ottawa-based design team can assist with professional 3D modeling services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

