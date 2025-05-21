import { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "3D Printing Blog | Ottawa 3D Printing Resources & News",
  description: "Expert insights on 3D printing in Ottawa. Tips, tricks, industry news, and resources for beginners and professionals alike. Ottawa's premier 3D printing blog.",
  keywords: "3D printing blog Ottawa, 3D printing tips Ottawa, 3D printing resources, Ottawa 3D printing news, 3D printing guide Ottawa",
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/blog",
  },
}

export default function BlogPage() {
  const blogPosts = [
    {
      id: "materials-guide-2025",
      title: "The Ultimate Guide to 3D Printing Materials in 2025",
      excerpt: "Explore the latest 3D printing materials available in Ottawa. From standard PLA to advanced composite filaments, we cover everything you need to know.",
      date: "May 19, 2025",
      author: "Michael Chen",
      image: "/assets/blog/materials-guide.jpg",
      category: "Materials"
    },
    {
      id: "ottawa-3d-printing-business",
      title: "How Ottawa Businesses Are Leveraging 3D Printing",
      excerpt: "Discover how local Ottawa businesses are using 3D printing technology to innovate, reduce costs, and gain a competitive edge in various industries.",
      date: "May 15, 2025",
      author: "Sarah Johnson",
      image: "/assets/blog/ottawa-business.jpg",
      category: "Business"
    },
    {
      id: "beginners-guide-3d-printing",
      title: "Beginner's Guide to 3D Printing in Ottawa",
      excerpt: "New to 3D printing? This comprehensive guide will walk you through everything you need to know to get started with 3D printing in Ottawa.",
      date: "May 10, 2025",
      author: "David Williams",
      image: "/assets/blog/beginners-guide.jpg",
      category: "Guides"
    },
    {
      id: "3d-printing-sustainability",
      title: "Sustainable 3D Printing Practices in Ottawa",
      excerpt: "Learn about eco-friendly 3D printing materials and practices that Ottawa businesses and hobbyists are adopting to reduce environmental impact.",
      date: "May 5, 2025",
      author: "Emma Roberts",
      image: "/assets/blog/sustainability.jpg",
      category: "Sustainability"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                3D Printing Blog
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Expert insights, tips, and news about 3D printing in Ottawa and beyond.
                Stay up-to-date with the latest industry trends and technologies.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {/* Featured Post */}
            <div className="mb-16 bg-card rounded-lg overflow-hidden shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="aspect-video overflow-hidden">
                  <img
                    src="/assets/blog/featured-post.jpg" 
                    alt="The Future of 3D Printing in Ottawa: Trends to Watch in 2025"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="text-sm text-primary font-medium mb-2">Featured • May 20, 2025</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    <Link href="/blog/future-of-3d-printing-ottawa-2025" className="hover:text-primary transition-colors">
                      The Future of 3D Printing in Ottawa: Trends to Watch in 2025
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    From industrial applications to healthcare innovations, discover the emerging 3D printing trends that are shaping Ottawa's tech landscape in 2025 and beyond.
                  </p>
                  <Button className="w-fit" asChild>
                    <Link href="/blog/future-of-3d-printing-ottawa-2025">
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-card rounded-lg overflow-hidden shadow-sm border">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg?height=200&width=400"}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        By {post.author}
                      </span>
                      <Button variant="ghost" size="sm" className="text-primary" asChild>
                        <Link href={`/blog/${post.id}`}>
                          Read More
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-16 bg-muted/30 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Stay updated with the latest 3D printing news, tips, and special offers from Ottawa's premier 3D printing service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </section>

        {/* JSON-LD for Blog */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "Ottawa 3D Printing Blog | Maple Leaf 3D",
              "description": "Expert insights on 3D printing in Ottawa. Tips, tricks, industry news, and resources for Ottawa businesses and 3D printing enthusiasts.",
              "url": "https://www.mapleleaf3d.ca/blog",
              "publisher": {
                "@type": "Organization",
                "name": "Maple Leaf 3D",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.mapleleaf3d.ca/logo.png"
                },
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "1165 Beaverwood Rd",
                  "addressLocality": "Ottawa",
                  "addressRegion": "ON",
                  "postalCode": "K4M 1L6",
                  "addressCountry": "CA"
                }
              },
              "blogPost": [
                {
                  "@type": "BlogPosting",
                  "headline": "The Future of 3D Printing in Ottawa: Trends to Watch in 2025",
                  "description": "From industrial applications to healthcare innovations, discover the emerging 3D printing trends that are shaping Ottawa's tech landscape in 2025 and beyond.",
                  "datePublished": "2025-05-20",
                  "author": {
                    "@type": "Person",
                    "name": "Jason Taylor"
                  },
                  "url": "https://www.mapleleaf3d.ca/blog/future-of-3d-printing-ottawa-2025"
                },
                {
                  "@type": "BlogPosting",
                  "headline": "The Ultimate Guide to 3D Printing Materials in 2025",
                  "description": "Explore the latest 3D printing materials available in Ottawa. From standard PLA to advanced composite filaments, we cover everything you need to know.",
                  "datePublished": "2025-05-19",
                  "author": {
                    "@type": "Person",
                    "name": "Michael Chen"
                  },
                  "url": "https://www.mapleleaf3d.ca/blog/materials-guide-2025"
                }
              ]
            })
          }}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
