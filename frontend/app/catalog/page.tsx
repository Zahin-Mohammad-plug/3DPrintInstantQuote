"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input"; // Keep for potential future client component
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react"; // Keep for potential future client component
import Link from "next/link";
import { getCatalogData } from "@/services/api"; // Import the API function
import type { Category, Product } from "@/services/api"; // Import types
import type { Metadata } from 'next'; // Import Metadata type



// This is now an async Server Component
export default async function CatalogPage() {
  let categories: Category[] = [];
  let products: Product[] = [];
  let fetchError: string | null = null;
  let categoriesWithProducts: (Category & { count: number })[] = []; // Add count property

  try {
    const catalogData = await getCatalogData();
    categories = catalogData.categories || [];
    products = catalogData.products || [];

    // Create a map of category IDs to their product counts
    const productCounts: Record<string, number> = {};
    for (const product of products) {
      if (product.category) {
        productCounts[product.category] = (productCounts[product.category] || 0) + 1;
      }
    }

    // Filter categories to include only those with products and add the count
    categoriesWithProducts = categories
      .filter(category => productCounts[category.id] > 0)
      .map(category => ({
        ...category,
        count: productCounts[category.id]
      }));

  } catch (error) {
    console.error("Failed to load catalog data:", error);
    fetchError = "Could not load catalog data. Please try again later.";
    // categoriesWithProducts will remain empty
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Catalog</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse our collection of 3D printed products or upload your own design for a custom quote.
              </p>
            </div>

            {fetchError && (
              <div className="text-center text-red-600 mb-8">{fetchError}</div>
            )}

            {categoriesWithProducts.length === 0 && !fetchError && (
                 <div className="text-center text-muted-foreground">No product categories found.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithProducts.map((category) => (
                <Link key={category.id} href={`/catalog/${category.id}`}>
                  <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                    <div className="relative h-48 w-full overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${category.image || '/placeholder.svg'})` }}
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{category.count} items</span>
                        <Button variant="outline" size="sm">
                          Browse
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="mb-4 text-muted-foreground">Don't see what you're looking for?</p>
              <Button asChild>
                <Link href="/upload">Upload Your Own Design</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

