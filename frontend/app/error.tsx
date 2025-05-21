'use client';

import Image from "next/image";
import Link from "next/link";

// Note: Metadata can't be exported from client components
// The metadata will be inherited from the parent layout instead

export default function Custom500() {
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
      
      <h1 className="text-4xl md:text-6xl font-bold mb-4">500 - Server Error</h1>
      
      <p className="text-xl md:text-2xl mb-8 max-w-2xl">
        We're experiencing some technical difficulties. Please try again later.
        Our team has been notified and is working to fix the issue.
      </p>
      
      <div className="bg-red-50 dark:bg-slate-800 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Ottawa 3D Printing Services Still Available</h2>
        <p className="mb-4">While we're fixing this issue, our 3D printing services across Ottawa region are still available. You can:</p>
        
        <ul className="list-disc list-inside text-left mb-4 space-y-2">
          <li>Email us directly at contact@mapleleaf3d.ca</li>
          <li>Call us at +1-613-608-1430</li>
          <li>Try refreshing the page or returning to the home page</li>
          <li>Visit our Google Business profile for more contact options</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-4xl">
        <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition duration-300">
          Return to Home Page
        </Link>
        
        <Link href="/contact" className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition duration-300">
          Contact Support
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
                "name": "Server Error",
                "item": "https://www.mapleleaf3d.ca/500"
              }
            ]
          })
        }}
      />
    </div>
  );
}
