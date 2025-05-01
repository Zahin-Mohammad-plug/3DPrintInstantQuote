"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Added Textarea
import { ModelViewer } from "@/components/model-viewer"
import { ArrowLeft, ShoppingCart, Share2, Heart, Star, StarHalf } from "lucide-react"
import Link from "next/link"
import { getCatalogData } from "@/services/api"
import type { Product, Review } from "@/services/api"

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
  const [newReviewName, setNewReviewName] = useState<string>("")
  const [newReviewRating, setNewReviewRating] = useState<number>(0)
  const [newReviewComment, setNewReviewComment] = useState<string>("")
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)
  const [reviews, setReviews] = useState<Review[]>([])

  // Load product and reviews
  useEffect(() => {
    async function loadProduct() {
      const { products } = await getCatalogData()
      const found = products.find(p => p.id === productId)
      if (found) {
        setProduct(found)
        setSelectedColor(found.colors[0]||"")
        setSelectedMaterial(found.materials[0]||"")
        // fetch reviews
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/product/${productId}/reviews`)
        if (resp.ok) setReviews(await resp.json())
        // related products
        if (found.relatedProducts) {
          const related = products.filter(p => found.relatedProducts.includes(p.id) && p.id!==found.id).slice(0,3)
          setRelatedProducts(related)
        }
      } else {
        document.title = 'Product Not Found'
      }
    }
    loadProduct()
  }, [productId])

  useEffect(() => {
    if (product) document.title = `${product.name} - Product Details`;
    // Cleanup function to reset title (optional)
    // return () => { document.title = 'Default Title'; };
  }, [product])

  const handleAddToCart = () => {
    if (!product) return

    // Create cart item
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price * quantity,
      quantity,
      color: selectedColor,
      material: selectedMaterial,
      image: product.images[0]
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
  const getAverageRating = (rs: Review[]) => rs.length ? rs.reduce((sum,r)=>sum+r.rating,0)/rs.length : 0

  const handleReviewRatingChange = (rating: number) => setNewReviewRating(rating)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewName.trim() || newReviewRating===0 || !newReviewComment.trim()) {
      return
    }
    setIsSubmittingReview(true);

    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/product/${productId}/reviews`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({name:newReviewName,rating:newReviewRating,comment:newReviewComment})
      })
      const newRev = await resp.json()
      if (resp.ok) setReviews(prev=>[...prev,newRev])
    } catch(err){ console.error(err) }

    setNewReviewName(''); setNewReviewRating(0); setNewReviewComment('')
    setIsSubmittingReview(false);
  }

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
                  <div className="flex">{renderStars(getAverageRating(reviews))}</div>
                  <span className="text-sm text-muted-foreground">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
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

            {reviews.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg mb-8"> {/* Added mb-8 */}
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6 mb-8"> {/* Added mb-8 */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold">{getAverageRating(reviews).toFixed(1)}</div>
                    <div className="flex mt-1">{renderStars(getAverageRating(reviews))}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
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
                    <Label htmlFor="review-name">Name</Label>
                    <input
                      id="review-name"
                      type="text"
                      className="w-full p-2 border rounded"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      required
                    />
                  </div>
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

