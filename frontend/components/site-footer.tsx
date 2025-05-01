import Link from "next/link"
import Image from "next/image"; // Import Image component

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-8 bg-background">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          {/* Replace text with Image component and matching text */}
          <span className="bg-primary text-primary-foreground p-1 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
            <Image src="/logo.png" alt="Print3D Ottawa Logo" width={20} height={20} className="h-5 w-5" />
          </span>
          <span className="text-primary group-hover:text-primary/80 transition-colors">Print3D</span>
          <span className="group-hover:text-primary transition-colors">Ottawa</span>
        </Link>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Link
            href="/services/3d-printing"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            3D Printing
          </Link>
          <Link
            href="/services/print-on-demand"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Print on Demand
          </Link>
          <Link
            href="/services/3d-modeling"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            3D Modeling
          </Link>
          <Link href="/catalog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Catalog
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Print3D Ottawa. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

