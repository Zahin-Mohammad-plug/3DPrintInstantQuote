"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input"; // Keep for potential future client component
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react"; // Keep for potential future client component
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCatalogData } from "@/services/api"; // Import the API function
import type { Category, Product } from "@/services/api"; // Import types
import type { Metadata } from 'next'; // Import Metadata type

export default function CatalogPage() {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<(Category & { count: number })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const catalogData = await getCatalogData();
        const cats = catalogData.categories || [];
        const prods = catalogData.products || [];
        setProducts(prods);
        const counts: Record<string, number> = {};
        prods.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
        const cwp = cats.filter(c => counts[c.id] > 0).map(c => ({ ...c, count: counts[c.id] }));
        setCategoriesWithProducts(cwp);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
        setFetchError("Could not load catalog data. Please try again later.");
      }
    }
    loadCatalog();
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const recommended = searchQuery ? filtered : products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 pb-12">
        {/* Categories Section */}
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
        {/* Search and Recommended */}
        <div className="container mt-12">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-center">
            {searchQuery ? "Search Results" : "Recommended Products"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map(product => (
              <Link key={product.id} href={`/catalog/product/${product.id}`}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-primary font-bold mb-2">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

