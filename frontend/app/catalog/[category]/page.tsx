"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";
import { getCatalogData } from "@/services/api";
import type { Category, Product } from "@/services/api";

export default function CategoryPage() {
  const { category: categoryId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("featured");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const { categories, products } = await getCatalogData();
        setCategories(categories);
        setAllProducts(products);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
        setFetchError("Could not load catalog data. Please try again later.");
      }
    }
    loadCatalog();
  }, []);

  const category = categories.find(c => c.id === categoryId);

  useEffect(() => {
    if (category) document.title = `${category.name} - Catalog`;
  }, [category]);

  const products = allProducts.filter(p => p.category === categoryId);
  let filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (selectedMaterials.length > 0) {
    filtered = filtered.filter(p => p.materials && Array.isArray(p.materials) && selectedMaterials.some(m => p.materials!.includes(m)));
  }
  if (selectedColors.length > 0) {
    filtered = filtered.filter(p => p.colors && Array.isArray(p.colors) && selectedColors.some(c => p.colors!.includes(c)));
  }
  if (sortOption === "price-low") filtered.sort((a,b) => (a.price || 0) - (b.price || 0));
  if (sortOption === "price-high") filtered.sort((a,b) => (b.price || 0) - (a.price || 0));
  if (sortOption === "name") filtered.sort((a,b) => a.name.localeCompare(b.name));

  const toggleMaterial = (mat: string) => setSelectedMaterials(prev => prev.includes(mat) ? prev.filter(m=>m!==mat) : [...prev,mat]);
  const toggleColor = (col: string) => setSelectedColors(prev => prev.includes(col) ? prev.filter(c=>c!==col) : [...prev,col]);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <Link href="/catalog" className="text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
            </Link>
          </div>

          {category ? (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
              <p className="mb-6">The category you're looking for doesn't exist.</p>
              <Button asChild><Link href="/catalog">Back to Catalog</Link></Button>
            </div>
          )}

          {category && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters */}
              <div className="hidden lg:block w-64 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Materials</h3>
                  <div className="space-y-2">
                    {["PLA", "PETG", "ABS"].map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={`material-${material}`}
                          checked={selectedMaterials.includes(material)}
                          onCheckedChange={() => toggleMaterial(material)}
                        />
                        <Label htmlFor={`material-${material}`}>{material}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Colors</h3>
                  <div className="space-y-2">
                    {["White", "Black", "Red", "Blue", "Green", "Gold", "Silver"].map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={selectedColors.includes(color)}
                          onCheckedChange={() => toggleColor(color)}
                        />
                        <Label htmlFor={`color-${color}`}>{color}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>

                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filters - Mobile */}
                {showFilters && (
                  <div className="lg:hidden mb-6 p-4 border rounded-md space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Materials</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {["PLA", "PETG", "ABS"].map((material) => (
                          <div key={material} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-material-${material}`}
                              checked={selectedMaterials.includes(material)}
                              onCheckedChange={() => toggleMaterial(material)}
                            />
                            <Label htmlFor={`mobile-material-${material}`}>{material}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Colors</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {["White", "Black", "Red", "Blue", "Green", "Gold", "Silver"].map((color) => (
                          <div key={color} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-color-${color}`}
                              checked={selectedColors.includes(color)}
                              onCheckedChange={() => toggleColor(color)}
                            />
                            <Label htmlFor={`mobile-color-${color}`}>{color}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedMaterials([]);
                        setSelectedColors([]);
                        setSortOption("featured");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(product => (
                      <Link key={product.id} href={`/catalog/product/${product.id}`}>
                        <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                          <div className="h-48 w-full overflow-hidden">
                            <img
                              src={product.images && product.images[0] ? product.images[0] : (product.image || "/placeholder.svg")}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-1">{product.name}</h3>
                            <p className="text-primary font-bold mb-2">${(product.price || 0).toFixed(2)}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {product.colors && product.colors.slice(0, 3).map((color) => (
                                <span key={color} className="text-xs bg-muted px-2 py-1 rounded">
                                  {color}
                                </span>
                              ))}
                              {product.colors && product.colors.length > 3 && (
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                  +{product.colors.length - 3} more
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Available in: {product.materials ? product.materials.join(", ") : "N/A"}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

