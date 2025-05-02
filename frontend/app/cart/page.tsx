"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Trash, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"

export default function CartPage() {
  const router = useRouter()
  interface CartItem {
    modelName: string;
    name?: string;
    image?: string;
    selectedColor: string;
    selectedSpecialFilament: string;
    selectedMaterial: string;
    selectedQuality: string;
    isMultiColor: boolean;
    multiColorDetails: string;
    quantity: number;
    isMultiPart: boolean;
    price: number;
    jobId?: string;
  }

  // Map hex codes to names
  const colorNameMap: Record<string,string> = {
    '#ffffff':'White','#000000':'Black','#ff0000':'Red','#0000ff':'Blue',
    '#00ff00':'Green','#ffd700':'Gold','#c0c0c0':'Silver'
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Get cart items from session storage
    const storedCart = sessionStorage.getItem("cart")
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      setCartItems(parsedCart)

      // Calculate totals
      const calculatedSubtotal = parsedCart.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
      setSubtotal(calculatedSubtotal)
      setTotal(calculatedSubtotal)
    }
  }, [])

  const removeItem = (index: number) => {
    const newCart = [...cartItems]
    newCart.splice(index, 1)
    setCartItems(newCart)

    // Update session storage
    sessionStorage.setItem("cart", JSON.stringify(newCart))

    // Recalculate totals
    const newSubtotal = newCart.reduce((sum, item) => sum + (item.price || 0), 0)
    setSubtotal(newSubtotal)
    setTotal(newSubtotal)

    // Dispatch event to update cart icon
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const newCart = [...cartItems]
    const item = newCart[index]

    // Calculate new price based on quantity
    const unitPrice = (item.price || 0) / (item.quantity || 1)
    const newPrice = unitPrice * newQuantity

    // Update item
    newCart[index] = {
      ...item,
      quantity: newQuantity,
      price: newPrice,
    }

    setCartItems(newCart)

    // Update session storage
    sessionStorage.setItem("cart", JSON.stringify(newCart))

    // Recalculate totals
    const newSubtotal = newCart.reduce((sum, item) => sum + (item.price || 0), 0)
    setSubtotal(newSubtotal)
    setTotal(newSubtotal)

    // Dispatch event to update cart icon
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-12 max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
                <CardDescription>Your cart is empty</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-center mb-6">You haven't added any items to your cart yet.</p>
                <Button asChild className="button-hover-effect">
                  <Link href="/catalog">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-md">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-16 w-16 rounded overflow-hidden bg-muted">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.modelName || item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="font-medium">{item.modelName || item.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div>Material: {item.selectedMaterial?.toUpperCase()}</div>
                              <div>
                                {item.isMultiColor ? 'Multi-Color' :
                                  item.selectedSpecialFilament ? `Special: ${item.selectedSpecialFilament}` :
                                  `Color: ${colorNameMap[item.selectedColor?.toLowerCase()||''] || item.selectedColor}`
                                }
                              </div>
                              <div>Quality: {item.selectedQuality || "Standard"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-r-none"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="h-7 w-8 flex items-center justify-center border-y">{item.quantity}</div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-l-none"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">${(item.price || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shipping and delivery options will be calculated at checkout
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 button-hover-effect"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  )
}
