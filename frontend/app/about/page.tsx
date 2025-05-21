import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                About MapleLeaf3D
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                MapleLeaf3D is Ottawa’s premier 3D printing studio, delivering fast,
                precise, and cost-effective 3D printing and design services to hobbyists,
                entrepreneurs, and businesses across Canada.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="mb-4">
                  Founded in 2018 in Ottawa, MapleLeaf3D started as a one-man workshop
                  with a simple mission: make professional-grade 3D printing accessible
                  to everyone. Over the years, we’ve grown into a full-service studio
                  serving individual creators, local businesses, and nationwide clients.
                </p>
                <p className="mb-4">
                  Our team of designers, engineers, and printing specialists work together to deliver exceptional
                  quality and service. We believe that 3D printing is revolutionizing how products are designed,
                  prototyped, and manufactured, and we're excited to be part of this transformation.
                </p>
                <p>
                  Today, MapleLeaf3D is proud to be Ottawa’s trusted partner for 3D printing,
                  helping Canadians coast-to-coast innovate, iterate, and build with confidence.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/assets/printer.png"
                  alt="MapleLeaf3D printer in action"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Quality */}
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  {/* shield icon */}
                </div>
                <h3 className="text-lg font-bold mb-2">Exceptional Quality</h3>
                <p className="text-muted-foreground">
                  Every print undergoes strict quality checks. We fine-tune printer
                  settings, inspect layer adhesion, and verify dimensional accuracy
                  before delivery.
                </p>
              </div>

              {/* Innovation */}
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  {/* innovation icon */}
                </div>
                <h3 className="text-lg font-bold mb-2">Continuous Innovation</h3>
                <p className="text-muted-foreground">
                  We stay at the forefront of 3D printing. From new materials like
                  carbon-fiber composites to specialty filaments, we test and adopt
                  the latest advances so you get the best results.
                </p>
              </div>

              {/* Customer Focus */}
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  {/* user icon */}
                </div>
                <h3 className="text-lg font-bold mb-2">Customer First</h3>
                <p className="text-muted-foreground">
                  Your success drives us. We collaborate closely on design files,
                  offer fast turnarounds, and provide clear pricing so you can plan
                  with confidence.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
                  <img
                    src="/assets/headshots/z.png?height=200&width=200"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">Zahin Mohammod</h3>
                <p className="text-sm text-muted-foreground">Lead & 3D Printing Specialist</p>
              </div>
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
                  <img
                    src="/assets/headshots/m.png?height=200&width=200"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">Mehboob Kareem</h3>
                <p className="text-sm text-muted-foreground">Materials Engineer</p>
              </div>
              <div className="text-center">
                <div className="rounded-full overflow-hidden w-32 h-32 mx-auto mb-4">
                  <img
                    src="/assets/headshots/ashley.png?height=200&width=200"
                    alt="Team Member"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold">Ashley Ross</h3>
                <p className="text-sm text-muted-foreground">Customer Success Manager</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Bring Your Idea to Life?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-muted-foreground">
              From one-off prototypes to full production runs, MapleLeaf3D is Ottawa’s
              trusted 3D printing partner. Get a fast quote and start your project today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/upload">Start a Project</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
