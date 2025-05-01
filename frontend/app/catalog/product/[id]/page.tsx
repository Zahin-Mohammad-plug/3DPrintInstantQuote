"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card" // Added CardHeader, Title, Description, Footer
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Added Textarea
import { ModelViewer } from "@/components/model-viewer"
import { ArrowLeft, ShoppingCart, Share2, Heart, Star, StarHalf } from "lucide-react"
import Link from "next/link"

// Mock data for products
const allProducts = [
  {
    id: "1",
    name: "Custom Card Holder",
    category: "tcg-accessories",
    price: 24.99,
    description: "A customizable card holder perfect for trading card games. Holds up to 60 sleeved cards securely.",
    features: [
      "Holds up to 60 sleeved cards",
      "Customizable design",
      "Durable construction",
      "Available in multiple colors",
    ],
    modelPath: "/assets/3d/duck.glb", // In a real app, this would be the path to the actual 3D model
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    colors: ["White", "Black", "Red", "Blue"],
    materials: ["PLA", "PETG"],
    reviews: [
      {
        id: "r1",
        name: "John D.",
        rating: 5,
        date: "2023-10-15",
        comment: "Perfect fit for my cards. The quality is excellent and it looks great on my shelf.",
      },
      {
        id: "r2",
        name: "Sarah M.",
        rating: 4,
        date: "2023-09-22",
        comment: "Good quality and design. Would be perfect if it had a locking mechanism.",
      },
      {
        id: "r3",
        name: "Mike T.",
        rating: 5,
        date: "2023-08-30",
        comment: "Exactly what I needed for my TCG collection. Highly recommended!",
      },
    ],
    relatedProducts: ["2", "3", "4"],
  },
  {
    id: "2",
    name: "Dice Tower",
    category: "tcg-accessories",
    price: 34.99,
    description: "An elegant dice tower for tabletop gaming with a smooth rolling surface.",
    features: ["Smooth dice rolling", "Compact design", "Noise reduction", "Non-slip base"],
    modelPath: "/assets/3d/duck.glb",
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    colors: ["White", "Black", "Green", "Purple"],
    materials: ["PLA", "PETG", "ABS"],
    reviews: [
      {
        id: "r1",
        name: "Alex P.",
        rating: 5,
        date: "2023-11-05",
        comment: "Great dice tower! Rolls are truly random and it looks fantastic.",
      },
    ],
    relatedProducts: ["1", "3"],
  },
  {
    id: "3",
    name: "Desk Organizer",
    category: "office-addons",
    price: 29.99,
    description: "Keep your desk tidy with this customizable organizer.",
    features: ["Multiple compartments", "Customizable layout", "Space-saving design", "Durable construction"],
    modelPath: "/assets/3d/duck.glb",
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    colors: ["White", "Black", "Blue", "Red"],
    materials: ["PLA", "PETG"],
    reviews: [
      {
        id: "r1",
        name: "Emily R.",
        rating: 4,
        date: "2023-10-28",
        comment: "Perfect for organizing my small office supplies. Sturdy and well-designed.",
      },
    ],
    relatedProducts: ["4", "1"],
  },
  {
    id: "4",
    name: "Phone Stand",
    category: "office-addons",
    price: 14.99,
    description: "A sleek and adjustable phone stand for your desk.",
    features: ["Adjustable viewing angle", "Compatible with most phones", "Stable base", "Cable management"],
    modelPath: "/assets/3d/duck.glb",
    images: ["/placeholder.svg?height=600&width=600"],
    colors: ["White", "Black", "Red", "Blue", "Green"],
    materials: ["PLA", "PETG", "ABS"],
    reviews: [
      {
        id: "r1",
        name: "David K.",
        rating: 5,
        date: "2023-11-10",
        comment: "Simple but effective. Holds my phone at the perfect angle for video calls.",
      },
    ],
    relatedProducts: ["3", "5"],
  },
  {
    id: "5",
    name: "Decorative Vase",
    category: "home-decor",
    price: 39.99,
    description: "A beautiful decorative vase for your home.",
    features: ["Unique geometric design", "Watertight construction", "Elegant finish", "Multiple size options"],
    modelPath: "/assets/3d/duck.glb",
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    colors: ["White", "Black", "Gold", "Silver"],
    materials: ["PLA", "PETG"],
    reviews: [],
    relatedProducts: ["6", "4"],
  },
  {
    id: "6",
    name: "Wall Planter",
    category: "home-decor",
    price: 19.99,
    description: "A modern wall-mounted planter for small plants and succulents.",
    features: ["Wall-mounting hardware included", "Drainage system", "UV-resistant materials", "Indoor/outdoor use"],
    modelPath: "/assets/3d/duck.glb",
    images: ["/placeholder.svg?height=600&width=600"],
    colors: ["White", "Black", "Green", "Blue"],
    materials: ["PLA", "PETG"],
    reviews: [],
    relatedProducts: ["5", "3"],
  },
]

// Interface for Review (good practice)
interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

// Interface for Product (good practice)
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  modelPath: string;
  images: string[];
  colors: string[];
  materials: string[];
  reviews: Review[];
  relatedProducts: string[];
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedMaterial, setSelectedMaterial] = useState<string>("")
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState("photos")
  const [quantity, setQuantity] = useState(1)

  // State for new review form
  const [newReviewRating, setNewReviewRating] = useState<number>(0)
  const [newReviewComment, setNewReviewComment] = useState<string>("")
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  useEffect(() => {
    // In a real app, you would fetch the product from an API
    const foundProduct = allProducts.find((p) => p.id === productId) as Product | undefined;
    if (foundProduct) {
      setProduct(foundProduct)
      setSelectedColor(foundProduct.colors[0])
      setSelectedMaterial(foundProduct.materials[0])

      // Update document title
      document.title = `${foundProduct.name} - Product Details`;

      // Get related products
      if (foundProduct.relatedProducts && foundProduct.relatedProducts.length > 0) {
        const related = allProducts
          .filter((p) => foundProduct.relatedProducts.includes(p.id) && p.id !== foundProduct.id)
          .slice(0, 3) as Product[];
        setRelatedProducts(related)
      }
    } else {
      // Handle product not found - set title
      document.title = 'Product Not Found';
    }

    // Cleanup function to reset title (optional)
    // return () => { document.title = 'Default Title'; };
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return

    // Create cart item
    const cartItem = {
      id: product.id, // This will be the lowercase-with-dashes format
      name: product.name,
      price: product.price * quantity,
      quantity: quantity,
      color: selectedColor,
      material: selectedMaterial,
      image: product.images[0],
    }

    // Add to cart in session storage
    const existingCart = sessionStorage.getItem("cart")
    const cart = existingCart ? JSON.parse(existingCart) : []
    cart.push(cartItem)
    sessionStorage.setItem("cart", JSON.stringify(cart))

    // Dispatch event to update cart icon
    window.dispatchEvent(new Event("cartUpdated"))

    // Show confirmation
    alert(`Added ${product.name} to cart!`)
  }

  const handleCustomize = () => {
    // Store product info in session storage
    sessionStorage.setItem("uploadedModel", product.name)
    sessionStorage.setItem("uploadedModelUrl", product.modelPath)

    // Redirect to customization page
    router.push("/customize")
  }

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-primary text-primary" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-primary text-primary" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />)
    }

    return stars
  }

  // Calculate average rating
  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((total, review) => total + review.rating, 0)
    return sum / reviews.length
  }

  const handleReviewRatingChange = (rating: number) => {
    setNewReviewRating(rating);
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product || newReviewRating === 0 || !newReviewComment.trim()) {
      alert("Please provide a rating and comment.");
      return;
    }
    setIsSubmittingReview(true);

    // Simulate API call
    console.log("Submitting review:", { productId: product.id, rating: newReviewRating, comment: newReviewComment });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // In a real app, you would send this data to your backend API
    // and likely refresh the reviews or add the new one optimistically.

    // For now, just log and reset the form
    alert("Review submitted (logged to console)!");
    setNewReviewRating(0);
    setNewReviewComment("");
    setIsSubmittingReview(false);

    // Add the new review to the state locally (for demo purposes)
    const newReview: Review = {
        id: `r${Date.now()}`, // Temporary unique ID
        name: "You", // Placeholder name
        rating: newReviewRating,
        date: new Date().toISOString().split('T')[0], // Current date
        comment: newReviewComment,
    };
    setProduct(prevProduct => prevProduct ? { ...prevProduct, reviews: [...prevProduct.reviews, newReview] } : null);
  };

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="mb-6">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/catalog">Back to Catalog</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <Link href={`/catalog/${product.category}`} className="text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to{" "}
              {product.category
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="aspect-square overflow-hidden rounded-md border">
                {activeTab === "3d-model" ? (
                  <div className="h-full">
                    <ModelViewer
                      modelPath={product.modelPath}
                      color={
                        selectedColor === "White"
                          ? "#ffffff"
                          : selectedColor === "Black"
                            ? "#000000"
                            : selectedColor === "Red"
                              ? "#ff0000"
                              : selectedColor === "Blue"
                                ? "#0000ff"
                                : selectedColor === "Green"
                                  ? "#00ff00"
                                  : selectedColor === "Gold"
                                    ? "#ffd700"
                                    : selectedColor === "Silver"
                                      ? "#c0c0c0"
                                      : "#cccccc"
                      }
                      material={selectedMaterial}
                    />
                  </div>
                ) : (
                  <img
                    src={product.images[activeImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <Tabs defaultValue="photos" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="3d-model">3D Model</TabsTrigger>
                </TabsList>
                <TabsContent value="photos" className="pt-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        className={`h-16 w-16 rounded-md border overflow-hidden ${
                          activeImage === index ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setActiveImage(index)}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{renderStars(getAverageRating(product.reviews))}</div>
                  <span className="text-sm text-muted-foreground">
                    {product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Select Color</h3>
                  <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="grid grid-cols-2 gap-2">
                    {product.colors.map((color) => (
                      <div key={color}>
                        <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor:
                                  color === "White"
                                    ? "#ffffff"
                                    : color === "Black"
                                      ? "#000000"
                                      : color === "Red"
                                        ? "#ff0000"
                                        : color === "Blue"
                                          ? "#0000ff"
                                          : color === "Green"
                                            ? "#00ff00"
                                            : color === "Gold"
                                              ? "#ffd700"
                                              : color === "Silver"
                                                ? "#c0c0c0"
                                                : "#cccccc",
                              }}
                            />
                            {color}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Select Material</h3>
                  <RadioGroup
                    value={selectedMaterial}
                    onValueChange={setSelectedMaterial}
                    className="grid grid-cols-2 gap-2"
                  >
                    {product.materials.map((material) => (
                      <div key={material}>
                        <RadioGroupItem value={material} id={`material-${material}`} className="peer sr-only" />
                        <Label
                          htmlFor={`material-${material}`}
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          {material}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Quantity</h3>
                  <div className="flex items-center w-32">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center border-y border-x-0 h-10 flex items-center justify-center">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button size="lg" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>

                  <Button variant="outline" size="lg" onClick={handleCustomize}>
                    Customize This Design
                  </Button>

                  <div className="flex gap-4">
                    <Button variant="outline" size="icon" className="flex-1">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Card className="mt-6 p-4">
                  <h3 className="font-medium mb-2">Features</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {product.reviews.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg mb-8"> {/* Added mb-8 */}
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6 mb-8"> {/* Added mb-8 */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold">{getAverageRating(product.reviews).toFixed(1)}</div>
                    <div className="flex mt-1">{renderStars(getAverageRating(product.reviews))}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Based on {product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">{review.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex mb-2">{renderStars(review.rating)}</div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Review Form */}
            <Card>
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>Share your thoughts about this product.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitReview}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${newReviewRating >= star ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                          onClick={() => handleReviewRatingChange(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Comment</Label>
                    <Textarea
                      id="review-comment"
                      placeholder="Tell us what you think..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmittingReview || newReviewRating === 0 || !newReviewComment.trim()}>
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/catalog/product/${relatedProduct.id}`}>
                    <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                      <div className="h-48 w-full overflow-hidden">
                        <img
                          src={relatedProduct.images[0] || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1">{relatedProduct.name}</h3>
                        <p className="text-primary font-bold mb-2">${relatedProduct.price.toFixed(2)}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {relatedProduct.colors.slice(0, 3).map((color) => (
                            <span key={color} className="text-xs bg-muted px-2 py-1 rounded">
                              {color}
                            </span>
                          ))}
                          {relatedProduct.colors.length > 3 && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              +{relatedProduct.colors.length - 3} more
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

