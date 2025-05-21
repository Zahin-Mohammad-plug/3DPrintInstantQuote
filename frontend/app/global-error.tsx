'use client';

import Image from "next/image";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
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
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Something Went Wrong</h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            We're experiencing some technical difficulties. Our team has been notified.
          </p>
          
          <div className="bg-red-50 dark:bg-slate-800 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Ottawa 3D Printing Services Still Available</h2>
            <p className="mb-4">While we're fixing this issue, you can:</p>
            
            <ul className="list-disc list-inside text-left mb-4 space-y-2">
              <li>Try again by clicking the button below</li>
              <li>Return to the home page</li>
              <li>Email us directly at contact@mapleleaf3d.ca</li>
              <li>Call us at +1-613-608-1430</li>
            </ul>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <button
              onClick={() => reset()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition duration-300"
            >
              Try Again
            </button>
            
            <Link href="/" className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition duration-300">
              Return to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
