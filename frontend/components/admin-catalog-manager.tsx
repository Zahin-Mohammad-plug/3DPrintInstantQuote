"use client"

import { useState, useEffect, ChangeEvent } from "react" // Import ChangeEvent
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash, Edit, Save, X, Upload, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCatalogData, saveCatalogData } from "@/services/api" // Assuming API service functions

// Define interfaces for Category and Product (can be moved to a types file)
interface Review {
  id: string
  name: string
  rating: number
  date: string
  comment: string
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  description: string
  modelPath: string
  images: string[]
  colors: string[]
  materials: string[]
  features: string[]
  reviews: Review[]
  relatedProducts: string[]
  [key: string]: any // Add index signature
}

interface Category {
  id: string
  name: string
  description: string
  image: string
  [key: string]: any // Add index signature
}

// Helper function to generate slug-based IDs (lowercase with dashes)
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-');          // Replace multiple hyphens with single

// Remove INITIAL_CATEGORIES and INITIAL_PRODUCTS mock data

export function AdminCatalogManager() {
  const [activeTab, setActiveTab] = useState("categories")
  const [categories, setCategories] = useState<Category[]>([]) // Initialize with empty array
  const [products, setProducts] = useState<Product[]>([]) // Initialize with empty array
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [activeProductTab, setActiveProductTab] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  const [error, setError] = useState<string | null>(null) // Add error state

  // ... state for newCategory, newProduct, newReview ...
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: "/placeholder.svg?height=300&width=500",
    // TODO: upload image via input below
  })

  // Handle local file upload for new category image
  const handleCategoryImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setNewCategory(prev => ({ ...prev, image: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }
  // Handle local file upload for editing category image
  const handleEditCategoryImageFile = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleUpdateCategory(id, "image", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handler to choose an existing category image URL
  const handleChooseExistingCategoryImage = (id: string) => {
    const url = window.prompt("Enter URL of an existing image from public folder (e.g., /customTextures/your-image.png):")
    if (url) {
      handleUpdateCategory(id, "image", url)
    }
  }

  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({ // Use Omit for newProduct
    name: "",
    category: "", // Default to empty or a specific category ID if desired
    price: 0,
    description: "",
    modelPath: "/assets/3d/duck.glb", // Default model path
    images: ["/placeholder.svg?height=300&width=300"], // Default image
    colors: ["White", "Black"], // Default colors
    materials: ["PLA"], // Default materials
    features: [""], // Start with one empty feature
    reviews: [],
    relatedProducts: [],
  });

  // Handle local file upload for new product images
  const handleNewProductImageFile = (e: ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setNewProduct(prev => ({
        ...prev,
        images: index !== undefined
          ? prev.images.map((img, i) => i === index ? url : img)
          : [...prev.images, url]
      }))
    }
    reader.readAsDataURL(file)
  }
  // Handle local file upload for editing existing product image
  const handleEditProductImageFile = (e: ChangeEvent<HTMLInputElement>, productId: string, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleUpdateProductImage(productId, index, reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handler to choose an existing product image URL for new product
  const handleNewChooseExistingProductImage = () => {
    const url = window.prompt("Enter URL of an existing image from public folder (e.g., /customTextures/your-image.png):")
    if (url) {
      setNewProduct(prev => ({ ...prev, images: [...prev.images, url] }))
    }
  }

  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  })


  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCatalogData() // Fetch from API
        setCategories(data.categories || [])
        setProducts(data.products || [])
      } catch (err) {
        console.error("Error fetching catalog data:", err)
        setError("Failed to load catalog data. Please try again later.")
        // Keep mock data as fallback? Or show error message.
        // setCategories(INITIAL_CATEGORIES); // Optional: fallback to mock
        // setProducts(INITIAL_PRODUCTS);     // Optional: fallback to mock
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Function to save all data (call after each modification)
  const saveData = async (updatedCategories: Category[], updatedProducts: Product[]) => {
    try {
      await saveCatalogData({ categories: updatedCategories, products: updatedProducts })
      // Optional: Show success toast/message
    } catch (err) {
      console.error("Error saving catalog data:", err)
      setError("Failed to save changes. Please try again.")
      // Optional: Revert state or show error toast/message
    }
  }


  // Category Management
  const handleCategoryChange = (field: string, value: string) => {
    setNewCategory({ ...newCategory, [field]: value })
  }

  const handleEditCategory = (id: string) => {
    setEditingCategoryId(id)
  }

  const handleSaveCategory = (id: string) => {
    setEditingCategoryId(null)
    // Save updated categories list to backend
    saveData(categories, products)
  }

  const handleCancelEditCategory = () => {
    // Optional: Refetch data or reset local changes if needed
    setEditingCategoryId(null)
  }

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter((category) => category.id !== id)
    setCategories(updatedCategories)
    // Also consider removing products associated with this category or re-assigning them?
    // For now, just save the updated categories list
    saveData(updatedCategories, products)
  }

  const handleAddCategory = () => {
    if (!newCategory.name) return

    // Use the same generateSlug function for consistency across products and categories
    const id = generateSlug(newCategory.name);
    
    // Check if ID already exists
    if (categories.some(c => c.id === id)) {
      setError(`Category with ID "${id}" already exists. Please choose a different name.`);
      return;
    }
    
    const newCategoryItem: Category = { // Explicitly type newCategoryItem
      id,
      name: newCategory.name,
      description: newCategory.description,
      image: newCategory.image,
    }

    const updatedCategories = [...categories, newCategoryItem]
    setCategories(updatedCategories)
    setNewCategory({ // Reset form
      name: "",
      description: "",
      image: "/placeholder.svg?height=300&width=500",
    })

    // Save updated categories list to backend
    saveData(updatedCategories, products)
  }

  const handleUpdateCategory = (id: string, field: string, value: string) => {
    const updatedCategories = categories.map((category) => {
        if (category.id === id) {
          return { ...category, [field]: value }
        }
        return category
      })
    setCategories(updatedCategories)
    // Note: Save happens in handleSaveCategory after editing is done
  }

  // Product Management
  const handleProductChange = (field: string, value: any) => {
    setNewProduct({ ...newProduct, [field]: value })
  }

  const handleEditProduct = (id: string) => {
    // setEditingProductId(id) // We don't need this state if using Accordion value
    setActiveProductTab(id) // Use Accordion's value to track editing state
  }

  // No explicit save button per product in this UI, changes are saved on update
  // const handleSaveProduct = (id: string) => {
  //   setActiveProductTab(null)
  //   saveData(categories, products)
  // }

  const handleCancelEditProduct = () => { // Maybe needed if edits are complex
     setActiveProductTab(null)
     // Optional: Refetch data to discard local changes
  }

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id)
    setProducts(updatedProducts)
    saveData(categories, updatedProducts)
  }

  const handleAddProduct = () => {
    // Basic validation
    if (!newProduct.name || !newProduct.category) {
        // Optionally show an error message to the user
        console.error("Product name and category are required.");
        setError("Product name and category are required."); // Use existing error state if suitable
        return;
    }

    // Generate slug-based ID from the name
    const slugId = generateSlug(newProduct.name);

    // Check if ID already exists (optional but recommended)
    if (products.some(p => p.id === slugId)) {
        console.error(`Product ID "${slugId}" already exists.`);
        setError(`A product with a similar name (resulting in ID "${slugId}") already exists. Please choose a different name.`);
        return;
    }


    const newProductItem: Product = {
      id: slugId, // Use the generated slug as the ID
      ...newProduct, // Spread newProduct to include all required fields
    };

    const updatedProducts = [...products, newProductItem];
    setProducts(updatedProducts);
    setNewProduct({ // Reset form
      name: "",
      category: "", // Reset category
      price: 0,
      description: "",
      modelPath: "/assets/3d/duck.glb",
      images: ["/placeholder.svg?height=300&width=300"],
      colors: ["White", "Black"],
      materials: ["PLA"],
      features: [""],
      reviews: [],
      relatedProducts: [],
    });
    setError(null); // Clear any previous error

    saveData(categories, updatedProducts); // Save to backend
  };

  const handleUpdateProduct = (id: string, field: string, value: any) => {
    const updatedProducts = products.map((product) => {
        if (product.id === id) {
          return { ...product, [field]: value }
        }
        return product
      })
    setProducts(updatedProducts)
    saveData(categories, updatedProducts) // Save immediately on field update
  }

  const handleUpdateProductArray = (id: string, field: string, value: string) => {
     const updatedProducts = products.map((product) => {
        if (product.id === id) {
          // Ensure the field exists and is an array before trying to join/split
          const currentArray = Array.isArray(product[field]) ? product[field] : [];
          // Split the input string into an array, trimming whitespace
          const valueArray = value.split(",").map((item) => item.trim()).filter(item => item !== ""); // Filter out empty strings
          return { ...product, [field]: valueArray };
        }
        return product;
      })
    setProducts(updatedProducts)
    saveData(categories, updatedProducts) // Save immediately
  }

  // Handle product images
  const handleAddProductImage = (id: string) => {
    const updatedProducts = products.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            images: [...product.images, "/placeholder.svg?height=300&width=300"], // Add placeholder
          }
        }
        return product
      })
    setProducts(updatedProducts)
    saveData(categories, updatedProducts)
  }

  const handleUpdateProductImage = (productId: string, index: number, value: string) => {
    const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          const updatedImages = [...product.images]
          updatedImages[index] = value
          return { ...product, images: updatedImages }
        }
        return product
      })
    setProducts(updatedProducts)
     saveData(categories, updatedProducts) // Save immediately
  }

  const handleDeleteProductImage = (productId: string, index: number) => {
     const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          // Prevent deleting the last image if needed, or handle accordingly
          if (product.images.length <= 1) return product; // Or show error
          const updatedImages = [...product.images]
          updatedImages.splice(index, 1)
          return { ...product, images: updatedImages }
        }
        return product
      })
     setProducts(updatedProducts)
     saveData(categories, updatedProducts)
  }

  // Handler to choose an existing product image URL for existing products
  const handleChooseExistingProductImage = (productId: string, index: number) => {
    const url = window.prompt("Enter URL of an existing image from public folder (e.g., /customTextures/your-image.png):");
    if (url) {
      handleUpdateProductImage(productId, index, url);
    }
  }

  // Handle product features
  const handleAddProductFeature = (id: string) => {
     const updatedProducts = products.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            // Ensure features is always an array
            features: [...(product.features || []), ""], // Add empty string for new feature
          }
        }
        return product
      })
     setProducts(updatedProducts)
     saveData(categories, updatedProducts)
  }

  const handleUpdateProductFeature = (productId: string, index: number, value: string) => {
     const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          const updatedFeatures = [...(product.features || [])]
          updatedFeatures[index] = value
          return { ...product, features: updatedFeatures }
        }
        return product
      })
     setProducts(updatedProducts)
     saveData(categories, updatedProducts) // Save immediately
  }

  const handleDeleteProductFeature = (productId: string, index: number) => {
     const updatedProducts = products.map((product) => {
        if (product.id === productId) {
           // Prevent deleting the last feature if needed
           if (!product.features || product.features.length <= 1) return product; // Or show error
          const updatedFeatures = [...product.features]
          updatedFeatures.splice(index, 1)
          return { ...product, features: updatedFeatures }
        }
        return product
      })
     setProducts(updatedProducts)
     saveData(categories, updatedProducts)
  }

  // Handle product reviews
  const handleAddReview = (productId: string) => {
    if (!newReview.name || !newReview.comment) return

    const review: Review = { // Explicitly type review
      id: Date.now().toString(), // Simple ID generation
      name: newReview.name,
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0], // Format date as YYYY-MM-DD
      comment: newReview.comment,
    }

    const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            // Ensure reviews is always an array
            reviews: [...(product.reviews || []), review],
          }
        }
        return product
      })

    setProducts(updatedProducts)
    setNewReview({ // Reset form
      name: "",
      rating: 5,
      comment: "",
    })
    saveData(categories, updatedProducts)
  }

  const handleDeleteReview = (productId: string, reviewId: string) => {
    const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            reviews: (product.reviews || []).filter((review) => review.id !== reviewId),
          }
        }
        return product
      })
    setProducts(updatedProducts)
    saveData(categories, updatedProducts)
  }

  // Render Loading State
  if (isLoading) {
    return <div className="p-4 text-center">Loading catalog data...</div>;
  }

  // Render Error State
  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  // Main component render
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
              <CardDescription>Create a new product category for your catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => handleCategoryChange("name", e.target.value)}
                      placeholder="e.g. Home Decor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-image">Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="category-image"
                        value={newCategory.image}
                        onChange={(e) => handleCategoryChange("image", e.target.value)}
                        placeholder="URL to category image"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageFile}
                        className="border p-1"
                      /> {/* TODO: handle file upload */}
                      <Button variant="outline" size="icon" className="flex-shrink-0">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    value={newCategory.description}
                    onChange={(e) => handleCategoryChange("description", e.target.value)}
                    placeholder="Describe this category"
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Edit or remove existing product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {editingCategoryId === category.id ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={category.image}
                                onChange={(e) => handleUpdateCategory(category.id, "image", e.target.value)}
                                placeholder="Image URL"
                              />
                              <Button size="sm" variant="ghost" onClick={() => handleChooseExistingCategoryImage(category.id)} title="Choose Existing">
                                <Star className="h-4 w-4" />
                              </Button>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleEditCategoryImageFile(e, category.id)}
                                className="border p-1"
                                title="Upload local"
                              />
                            </div>
                            <img
                              src={category.image || "/placeholder.svg"}
                              alt={category.name}
                              className="h-10 w-16 rounded object-cover border" // Added border for visibility
                            />
                          </div>
                         ) : (
                            <div className="h-10 w-16 rounded overflow-hidden bg-muted">
                              <img
                                src={category.image || "/placeholder.svg"}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCategoryId === category.id ? (
                          <Input
                            value={category.name}
                            onChange={(e) => handleUpdateCategory(category.id, "name", e.target.value)}
                          />
                        ) : (
                          category.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCategoryId === category.id ? (
                          <Textarea
                            value={category.description}
                            onChange={(e) => handleUpdateCategory(category.id, "description", e.target.value)}
                            rows={2}
                          />
                        ) : (
                          <div className="max-w-md truncate">{category.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingCategoryId === category.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleSaveCategory(category.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEditCategory}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditCategory(category.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>Create a new product for your catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={newProduct.name}
                      onChange={(e) => handleProductChange("name", e.target.value)}
                      placeholder="e.g. Custom Card Holder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => handleProductChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price ($)</Label>
                    <Input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => handleProductChange("price", Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-model">3D Model Path</Label>
                    <div className="flex gap-2">
                      <Input
                        id="product-model"
                        value={newProduct.modelPath}
                        onChange={(e) => handleProductChange("modelPath", e.target.value)}
                        placeholder="Path to 3D model file"
                      />
                      <Button variant="outline" size="icon" className="flex-shrink-0">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={newProduct.description}
                    onChange={(e) => handleProductChange("description", e.target.value)}
                    placeholder="Describe this product"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-colors">Available Colors (comma separated)</Label>
                    <Input
                      id="product-colors"
                      value={newProduct.colors.join(", ")}
                      onChange={(e) =>
                        handleProductChange(
                          "colors",
                          e.target.value.split(",").map((c) => c.trim()),
                        )
                      }
                      placeholder="White, Black, Red, Blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-materials">Available Materials (comma separated)</Label>
                    <Input
                      id="product-materials"
                      value={newProduct.materials.join(", ")}
                      onChange={(e) =>
                        handleProductChange(
                          "materials",
                          e.target.value.split(",").map((m) => m.trim()),
                        )
                      }
                      placeholder="PLA, PETG, ABS"
                    />
                  </div>
                </div> {/* Correct closing div for the grid */}

                <Label htmlFor="new-product-image">Upload Product Image</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleNewProductImageFile(e)}
                  className="block"
                /> {/* TODO: handle upload and add to newProduct.images */}
                <Button variant="ghost" size="icon" onClick={handleNewChooseExistingProductImage} title="Choose Existing">
                  <Star className="h-4 w-4" />
                </Button>
              </div>

                <Button onClick={handleAddProduct} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Products</CardTitle>
              <CardDescription>Edit or remove existing products</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Fix: Provide empty string fallback for null value */}
              <Accordion type="single" collapsible value={activeProductTab || ''} onValueChange={setActiveProductTab}>
                {products.map((product) => (
                  <AccordionItem key={product.id} value={product.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4 text-left">
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${product.price.toFixed(2)} •{" "}
                            {categories.find((c) => c.id === product.category)?.name || product.category}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 pb-2">
                        <Tabs defaultValue="details">
                          <TabsList className="mb-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                            <TabsTrigger value="features">Features</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                          </TabsList>

                          <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-name-${product.id}`}>Product Name</Label>
                                <Input
                                  id={`edit-name-${product.id}`}
                                  value={product.name}
                                  onChange={(e) => handleUpdateProduct(product.id, "name", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-category-${product.id}`}>Category</Label>
                                <Select
                                  value={product.category}
                                  onValueChange={(value) => handleUpdateProduct(product.id, "category", value)}
                                >
                                  <SelectTrigger id={`edit-category-${product.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-price-${product.id}`}>Price ($)</Label>
                                <Input
                                  id={`edit-price-${product.id}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={product.price}
                                  onChange={(e) =>
                                    handleUpdateProduct(product.id, "price", Number.parseFloat(e.target.value))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-model-${product.id}`}>3D Model Path</Label>
                                <Input
                                  id={`edit-model-${product.id}`}
                                  value={product.modelPath}
                                  onChange={(e) => handleUpdateProduct(product.id, "modelPath", e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`edit-desc-${product.id}`}>Description</Label>
                              <Textarea
                                id={`edit-desc-${product.id}`}
                                value={product.description}
                                onChange={(e) => handleUpdateProduct(product.id, "description", e.target.value)}
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-colors-${product.id}`}>Available Colors</Label>
                                <Input
                                  id={`edit-colors-${product.id}`}
                                  value={Array.isArray(product.colors) ? product.colors.join(", ") : ''} // Handle potential non-array
                                  onChange={(e) => handleUpdateProductArray(product.id, "colors", e.target.value)}
                                />
                              </div> {/* Correct closing div for colors */}
                              <div className="space-y-2">
                                <Label htmlFor={`edit-materials-${product.id}`}>Available Materials</Label>
                                <Input
                                  id={`edit-materials-${product.id}`}
                                  value={Array.isArray(product.materials) ? product.materials.join(", ") : ''} // Added check
                                  onChange={(e) => handleUpdateProductArray(product.id, "materials", e.target.value)}
                                />
                              </div> {/* Correct closing div for materials */}
                            </div> {/* Correct closing div for the grid */}
                          </TabsContent>

                          <TabsContent value="images" className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">Product Images</h3>
                                <Button size="sm" variant="outline" onClick={() => handleAddProductImage(product.id)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Image
                                </Button>
                              </div>

                              {product.images.map((image, index) => (
                                <div key={index} className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                                    <img
                                      src={image || "/placeholder.svg"}
                                      alt={`${product.name} - Image ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditProductImageFile(e, product.id, index)}
                                    className="border p-1"
                                    title="Upload local"
                                  />
                                  <Input
                                    value={image}
                                    onChange={(e) => handleUpdateProductImage(product.id, index, e.target.value)}
                                    placeholder="Image URL"
                                    className="flex-1"
                                  />
                                  <Button size="sm" variant="ghost" onClick={() => handleChooseExistingProductImage(product.id, index)} title="Choose Existing">
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteProductImage(product.id, index)}
                                    disabled={product.images.length <= 1}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="features" className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">Product Features</h3>
                                <Button size="sm" variant="outline" onClick={() => handleAddProductFeature(product.id)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Feature
                                </Button>
                              </div>

                              {product.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-4">
                                  <Input
                                    value={feature}
                                    onChange={(e) => handleUpdateProductFeature(product.id, index, e.target.value)}
                                    placeholder="Feature description"
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteProductFeature(product.id, index)}
                                    disabled={!product.features || product.features.length <= 1}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div> // Correct closing div for the flex container
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="reviews" className="space-y-4">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Product Reviews</h3>

                              <div className="space-y-4 border rounded-md p-4">
                                <h4 className="text-sm font-medium">Add New Review</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`review-name-${product.id}`}>Reviewer Name</Label>
                                    <Input
                                      id={`review-name-${product.id}`}
                                      value={newReview.name}
                                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                      placeholder="e.g. John D."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`review-rating-${product.id}`}>Rating (1-5)</Label>
                                    <Select
                                      value={newReview.rating.toString()}
                                      onValueChange={(value) =>
                                        setNewReview({ ...newReview, rating: Number.parseInt(value) })
                                      }
                                    >
                                      <SelectTrigger id={`review-rating-${product.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 Star</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`review-comment-${product.id}`}>Review Comment</Label>
                                  <Textarea
                                    id={`review-comment-${product.id}`}
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    placeholder="Write the review comment here"
                                    rows={3}
                                  />
                                </div>
                                <Button onClick={() => handleAddReview(product.id)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Review
                                </Button>
                              </div>

                              {product.reviews.length === 0 ? (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  No reviews yet for this product.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {product.reviews.map((review) => (
                                    <div key={review.id} className="border rounded-md p-4">
                                      <div className="flex justify-between mb-2">
                                        <div className="font-medium">{review.name}</div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteReview(product.id, review.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(review.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{review.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 pb-4">
                        <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Product
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

