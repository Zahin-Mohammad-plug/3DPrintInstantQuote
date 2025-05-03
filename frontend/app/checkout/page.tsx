"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Truck, Home, CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"
import { submitOrder } from "@/services/api" // Import the submitOrder function
import { useToast } from "@/hooks/use-toast" // Import useToast

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast() // Initialize toast
  const [cartItems, setCartItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState("pickup")
  const [shippingCost, setShippingCost] = useState(0)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Add loading state

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "", // Street address
    street2: "", // Optional street address line 2
    city: "",
    postalCode: "",
    province: "", // State/Province
    country: "Canada", // Default or make it an input
    notes: "",
  })

  useEffect(() => {
    setIsClient(true)
    // Get cart items from session storage
    const storedCart = sessionStorage.getItem("cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        console.log("CheckoutPage useEffect - Read from sessionStorage:", parsedCart); // <-- ADDED Log
        if (!Array.isArray(parsedCart)) {
          console.error("CheckoutPage useEffect - Parsed cart is not an array:", parsedCart);
          setCartItems([]); // Set to empty array if not valid
          // Optionally redirect or show error
          router.push("/cart");
          return;
        }
        setCartItems(parsedCart)

        // Calculate totals
        const calculatedSubtotal = parsedCart.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
        setSubtotal(calculatedSubtotal)
        setTotal(calculatedSubtotal) // Shipping cost added later
      } catch (error) {
        console.error("CheckoutPage useEffect - Error parsing cart from sessionStorage:", error);
        sessionStorage.removeItem("cart"); // Clear potentially corrupted cart data
        setCartItems([]);
        router.push("/cart"); // Redirect to cart page
      }
    } else {
      // Redirect to cart if empty
      console.log("CheckoutPage useEffect - Cart empty in sessionStorage, redirecting."); // <-- ADDED Log
      router.push("/cart")
    }
  }, [router])

  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value)

    // Update shipping cost based on delivery method
    if (value === "shipping") {
      setShippingCost(15) // Example shipping cost
      setTotal(subtotal + 15)
    } else {
      setShippingCost(0)
      setTotal(subtotal)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    console.log("handleSubmitOrder called"); // LOG 1
    e.preventDefault()
    setIsLoading(true) // LOG 2
    console.log("Loading state set to true");

    if (cartItems.length === 0) {
      console.log("Validation failed: Cart is empty"); // LOG 3a
      // ... toast ...
      setIsLoading(false)
      return
    }
    console.log("Cart is not empty, proceeding..."); // LOG 3b

    const firstCartItem = cartItems[0];

    // --- MODIFIED VALIDATION ---
    // Check if it looks like a custom upload (has modelName) AND lacks jobId
    // Catalog items usually have 'name' but might lack 'modelName' initially
    const isCustomUpload = !!firstCartItem.modelName;
    if (isCustomUpload && !firstCartItem.job_id) {
        console.log("Validation failed: Custom upload item missing job_id", firstCartItem); // LOG 4a
        toast({
            title: "Error",
            description: "Cart item is missing necessary job information. Please try adding it again from the quote page.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    // If it's not a custom upload OR if it is and has a job_id, proceed
    console.log("Item validation passed. Item:", firstCartItem); // LOG 4b (modified)


    // --- Prepare Order Data (Needs Backend Update Later) ---
    // This still assumes a single item order based on the first item.
    // The backend currently expects 'job_id' at the top level.
    // We will need to refactor both frontend and backend to handle arrays of items
    // with either job_id or product_id.
    // For now, we send job_id if available, otherwise null (backend will likely fail for catalog items).

    // Combine multi-color details with general notes if applicable
    let combinedNotes = formData.notes;
    if (firstCartItem.isMultiColor && firstCartItem.multiColorDetails) {
      combinedNotes = `Multi-Color Details: ${firstCartItem.multiColorDetails}\n\n${formData.notes}`;
    }

    const orderData = {
      job_id: firstCartItem.job_id || null, // Send job_id if it exists
      product_id: !isCustomUpload ? firstCartItem.id : null, // Send product id if it's likely a catalog item
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      delivery_method: deliveryMethod as 'pickup' | 'shipping',
      // IMPORTANT: Quantity and price might need adjustment if backend expects item array
      quantity: firstCartItem.quantity || 1,
      notes: combinedNotes, // Use the combined notes
      shipping_address: deliveryMethod === "shipping" ? {
        street: formData.address,
        street2: formData.street2,
        city: formData.city,
        postal_code: formData.postalCode,
        province: formData.province,
        country: formData.country,
      } : undefined,
      shipping_cost: shippingCost,
      tax_amount: 0, // Placeholder for tax calculation
      // Include item details directly in the order for backend processing
      // This helps the backend identify the item even without a job_id/product_id lookup initially
      // (Backend logic will still need refinement)
      item_details: {
        name: firstCartItem.modelName || firstCartItem.name, // Use modelName or name
        price: firstCartItem.price,
        quantity: firstCartItem.quantity,
        material: firstCartItem.selectedMaterial,
        color: firstCartItem.selectedColor,
        quality: firstCartItem.selectedQuality,
        is_multi_color: firstCartItem.isMultiColor,
        multi_color_details: firstCartItem.multiColorDetails,
        special_filament: firstCartItem.selectedSpecialFilament,
        image: firstCartItem.image
      }
    };
    console.log("Order data prepared:", orderData); // LOG 5


    try {
      console.log("Attempting to call submitOrder API..."); // LOG 6
      const result = await submitOrder(orderData); // Call API
      console.log("API call result:", result); // LOG 7

      // --- ADDED: Handle successful order placement ---
      if (result && result.success) { // Check if the API call was successful
        console.log("Order placed successfully, clearing cart and showing thank you page."); // LOG 8
        sessionStorage.removeItem("cart"); // Clear the cart
        setCartItems([]); // Clear local cart state
        setOrderPlaced(true); // Set state to show the thank you page
      } else {
        // Handle API error response (e.g., validation error from backend)
        console.error("API call failed or returned error:", result?.message || "Unknown error"); // LOG 9
        toast({
          title: "Order Failed",
          description: result?.message || "Could not place the order. Please try again.",
          variant: "destructive",
        });
      }
      // --- END ADDED ---

    } catch (error) {
      console.error("Error submitting order:", error); // LOG 10
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Setting loading state back to false"); // LOG 11
      setIsLoading(false); // Ensure loading is turned off regardless of success/failure
    }
  }

  if (!isClient) {
    return <div className="container py-12 text-center">Loading...</div>
  }

  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Order Placed!</CardTitle>
                  <CardDescription>Thank you for your order</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="mb-4">
                    We've received your order and will be in touch shortly via email at{" "}
                    <strong>{formData.email}</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {deliveryMethod === "pickup"
                      ? "We'll contact you when your order is ready for pickup in Ottawa."
                      : "We'll send you tracking information once your order ships."}
                  </p>
                  <Button onClick={() => router.push("/")} className="w-full">
                    Return to Home
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  console.log("Rendering CheckoutPage component"); // <-- ADDED: Basic render log

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <Link href="/cart" className="text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmitOrder}>
                <Card className="mb-6 shadow-md">
                  <CardHeader className="bg-muted/50">
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>We'll use this information to contact you about your order</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6 shadow-md">
                  <CardHeader className="bg-muted/50">
                    <CardTitle>Delivery Method</CardTitle>
                    <CardDescription>Choose how you'd like to receive your order</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange} className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="pickup" className="flex items-center gap-2 text-base font-medium">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            Local Pickup (Ottawa)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Pick up your order at our Ottawa location. We'll contact you when it's ready.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="shipping" id="shipping" className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="shipping" className="flex items-center gap-2 text-base font-medium">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            Standard Shipping
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Delivery in 5-7 business days. Shipping cost: $15.00
                          </p>
                        </div>
                      </div>
                    </RadioGroup>

                    {deliveryMethod === "shipping" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 space-y-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Street Address */}
                          <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              required={deliveryMethod === "shipping"}
                              autoComplete="street-address"
                            />
                          </div>
                           {/* Street Address Line 2 (Optional) */}
                           <div className="space-y-2">
                            <Label htmlFor="street2">Address Line 2 (Optional)</Label>
                            <Input
                              id="street2"
                              name="street2"
                              value={formData.street2}
                              onChange={handleInputChange}
                              autoComplete="address-line2"
                            />
                          </div>
                          {/* City */}
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required={deliveryMethod === "shipping"}
                              autoComplete="address-level2"
                            />
                          </div>
                          {/* Postal Code */}
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              required={deliveryMethod === "shipping"}
                              autoComplete="postal-code"
                            />
                          </div>
                          {/* Province/State */}
                          <div className="space-y-2">
                            <Label htmlFor="province">Province / State</Label>
                            <Input
                              id="province"
                              name="province"
                              value={formData.province}
                              onChange={handleInputChange}
                              required={deliveryMethod === "shipping"}
                              autoComplete="address-level1"
                            />
                          </div>
                           {/* Country */}
                           <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              required={deliveryMethod === "shipping"}
                              autoComplete="country-name"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mb-6 shadow-md">
                  <CardHeader className="bg-muted/50">
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Any special instructions or notes for your order</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or instructions for your order"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 button-hover-effect"
                  disabled={isLoading}
                  onClick={() => console.log("Place Order BUTTON CLICKED")} // <-- ADDED: Direct button click log
                >
                  {isLoading ? (
                     <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Place Order
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div>
              <Card className="shadow-md sticky top-20">
                <CardHeader className="bg-muted/50">
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="max-h-80 overflow-y-auto pr-2">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 mb-4">
                          <div className="h-12 w-12 bg-muted rounded-md flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.modelName}</p>
                            <div className="text-xs text-muted-foreground">
                              <p>Material: {item.selectedMaterial}</p>
                              <p>
                                {item.isMultiColor
                                  ? "Multi-Color"
                                  : item.selectedSpecialFilament
                                    ? `Special: ${item.selectedSpecialFilament}`
                                    : `Color: ${item.selectedColor}`}
                              </p>
                              <p>Quality: {item.selectedQuality}</p>
                              <p>Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="font-medium">${item.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>

                      {deliveryMethod === "shipping" && (
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>${shippingCost.toFixed(2)}</span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

