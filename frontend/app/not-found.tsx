import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Ottawa 3D Printing - Maple Leaf 3D",
  description: "The page you're looking for doesn't exist. Explore our Ottawa 3D printing services, including prototyping, custom parts, and 3D modeling.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/404",
  }
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Maple Leaf 3D Ottawa Logo"
          width={180}
          height={60}
          priority
        />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold mb-4">404 - Page Not Found</h1>
      
      <p className="text-xl md:text-2xl mb-8 max-w-2xl">
        The page you're looking for doesn't exist or has been moved. 
        Sorry for the inconvenience.
      </p>
      
      <div className="bg-red-50 dark:bg-slate-800 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Looking for Ottawa 3D Printing Services?</h2>
        <p className="mb-4">We offer professional 3D printing services across Ottawa region, including:</p>
        
        <ul className="list-disc list-inside text-left mb-4 space-y-2">
          <li>3D Printing in PLA, PETG, ABS, and specialty materials</li>
          <li>Custom 3D modeling and design services</li>
          <li>Print-on-demand for businesses in Ottawa</li>
          <li>Rapid prototyping and functional parts</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition duration-300">
          Home Page
        </Link>
        
        <Link href="/services/3d-printing" className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition duration-300">
          3D Printing Services
        </Link>
        
        <Link href="/ottawa-3d-printing" className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition duration-300">
          Ottawa 3D Printing
        </Link>
      </div>
      
      <div className="border-t pt-8 text-center">
        <p className="mb-4">Can't find what you're looking for?</p>
        <Link 
          href="/contact" 
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition duration-300"
        >
          Contact Us
        </Link>
      </div>
      
      {/* Additional Local Schema for Ottawa targeting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.mapleleaf3d.ca/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Page Not Found",
                "item": "https://www.mapleleaf3d.ca/404"
              }
            ]
          })
        }}
      />
    </div>
  );
}
