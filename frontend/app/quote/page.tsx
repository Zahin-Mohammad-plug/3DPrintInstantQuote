"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ModelViewer } from "@/components/model-viewer"
import { ArrowLeft, Download, ShoppingCart, Share2, Plus, Minus, AlertCircle, Loader2, Sun, Moon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"
import { getJobStatus, getMaterials, addJobToCart, calculateJobPrice } from "@/services/api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define API base URL for model files
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface QuoteDetails {
  basePrice: number
  colorModifier: number
  materialModifier: number
  multiColorModifier: number
  qualityModifier: number
  total: number
  totalWithQuantity: number
  filamentUsed?: number
  estimatedTime?: string
  hasSupports?: boolean
  size?: {
    x: number
    y: number
    z: number
  }
  volumeCm3?: number
}

interface CartItem {
  modelName: string
  selectedColor: string
  selectedSpecialFilament: string
  selectedMaterial: string
  selectedQuality: string
  isMultiColor: boolean
  multiColorDetails: string
  quantity: number
  isMultiPart: boolean
  price: number
  job_id: string // Add preview image URL
  image?: string // Add preview image URL
}

// Quality options for reference
const QUALITY_OPTIONS = {
  draft: { name: "Draft", priceModifier: -5 },
  standard: { name: "Standard", priceModifier: 0 },
  high: { name: "High Quality", priceModifier: 10 },
  ultra: { name: "Ultra Fine", priceModifier: 15 },
}

export default function QuotePage() {
  const router = useRouter()
  const [modelName, setModelName] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSpecialFilament, setSelectedSpecialFilament] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [selectedQuality, setSelectedQuality] = useState<string>("standard")
  const [isMultiColor, setIsMultiColor] = useState(false)
  const [multiColorDetails, setMultiColorDetails] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isMultiPart, setIsMultiPart] = useState(false)
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null) // Initialize as null
  const [jobResultDetails, setJobResultDetails] = useState<any>(null) // Store raw job results separately
  const [addedToCart, setAddedToCart] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start loading initially
  const [error, setError] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  // Theme for model viewer background - default to dark
  const [viewerTheme, setViewerTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    setIsClient(true)

    const storedModel = sessionStorage.getItem("uploadedModel")
    const storedColor = sessionStorage.getItem("selectedColor")
    const storedSpecialFilament = sessionStorage.getItem("selectedSpecialFilament")
    const storedMaterial = sessionStorage.getItem("selectedMaterial")
    const storedQuality = sessionStorage.getItem("selectedQuality")
    const storedIsMultiColor = sessionStorage.getItem("isMultiColor")
    const storedMultiColorDetails = sessionStorage.getItem("multiColorDetails")
    const storedJobId = sessionStorage.getItem("jobId")
    const storedViewerTheme = sessionStorage.getItem("viewerTheme") || "dark"

    // Set viewer theme from storage
    setViewerTheme(storedViewerTheme as "light" | "dark")

    if (!storedModel || !storedMaterial || !storedJobId) {
      console.error("Missing essential data in sessionStorage, redirecting to upload.")
      router.push("/upload")
      return
    }

    // Set state from sessionStorage
    setModelName(storedModel)
    setSelectedColor(storedColor)
    setSelectedSpecialFilament(storedSpecialFilament)
    setSelectedMaterial(storedMaterial)
    setSelectedQuality(storedQuality || "standard")
    setIsMultiColor(storedIsMultiColor === "true")
    setMultiColorDetails(storedMultiColorDetails || "")
    setJobId(storedJobId)
    console.log("QuotePage useEffect - Set jobId state from sessionStorage:", storedJobId); // <-- ADD Log for state setting

    // --- Fetch Job Status and then Calculate Price --- START
    const fetchJobAndPrice = async (
      currentJobId: string,
      currentQuality: string,
      currentMaterial: string,
      currentColor: string | null,
    ) => {
      setIsLoading(true)
      setError(null)
      try {
        let jobStatus = await getJobStatus(currentJobId)

        // --- Polling Logic --- START
        let attempts = 0
        const maxAttempts = 10 // Poll for 30 seconds max
        const pollInterval = 3000

        while (jobStatus.status !== "completed" && jobStatus.status !== "failed" && attempts < maxAttempts) {
          console.log(`Job ${currentJobId} status is ${jobStatus.status}, polling... (Attempt ${attempts + 1})`)
          await new Promise((resolve) => setTimeout(resolve, pollInterval))
          jobStatus = await getJobStatus(currentJobId)
          attempts++
        }
        // --- Polling Logic --- END

        if (jobStatus.status === "failed") {
          throw new Error(jobStatus.error || "Failed to process model")
        }

        if (jobStatus.status !== "completed") {
          throw new Error(`Job processing timed out or is stuck in status: ${jobStatus.status}`)
        }

        // --- Job is Completed, store results and model URL --- START
        console.log(`Job ${currentJobId} completed. Result:`, jobStatus.result)
        setJobResultDetails(jobStatus.result) // Store raw results

        if (jobStatus.filename) {
          const modelUrlPath = `${API_BASE_URL}/api/file/${jobStatus.filename}`
          try {
            const fileCheck = await fetch(modelUrlPath, { method: "HEAD" })
            if (fileCheck.ok) {
              setModelUrl(modelUrlPath)
            } else {
              console.warn(`Model file ${jobStatus.filename} not found (HTTP ${fileCheck.status})`)
              // Handle potential 3mf -> stl conversion if needed
            }
          } catch (err) {
            console.error("Error checking model file:", err)
          }
        }
        // --- Job is Completed, store results and model URL --- END

        // --- Calculate Price using the new endpoint --- START
        if (jobStatus.result) {
          const priceParams = {
            material_id: currentMaterial,
            color_id: currentColor || "default", // Use a default if null, backend should handle
            quality_id: currentQuality,
          }
          console.log(`Requesting price calculation for job ${currentJobId} with params:`, priceParams)
          const priceInfo = await calculateJobPrice(currentJobId, priceParams)
          console.log(`Received price info for job ${currentJobId}:`, priceInfo)
          processPriceInfo(priceInfo, currentQuality, quantity, isMultiPart, isMultiColor)
        } else {
          throw new Error("Job completed but slicing results are missing.")
        }
        // --- Calculate Price using the new endpoint --- END
      } catch (err: any) {
        console.error("Error in fetchJobAndPrice:", err)
        setError(err.message || "Failed to get job status or calculate price")
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchJobAndPrice(storedJobId, storedQuality || "standard", storedMaterial, storedColor)
    // --- Fetch Job Status and then Calculate Price --- END
  }, [router]) // Only run on initial mount and if router changes

  // Save viewer theme to session storage when it changes
  useEffect(() => {
    if (isClient) {
      sessionStorage.setItem("viewerTheme", viewerTheme)
    }
  }, [viewerTheme, isClient])

  // Get quality modifiers from the backend
  const [qualityModifiers, setQualityModifiers] = useState<{ [key: string]: number }>({
    draft: -5,
    standard: 0,
    high: 10,
    ultra: 15,
  })

  // Load quality modifiers from the backend
  useEffect(() => {
    const loadQualityModifiers = async () => {
      try {
        const materialsData = await getMaterials()

        // Check if quality levels are available in the response
        if (materialsData.global_settings && materialsData.global_settings.quality_levels) {
          const modifiers: { [key: string]: number } = {}

          // Map quality levels to modifiers
          materialsData.global_settings.quality_levels.forEach((level: any) => {
            modifiers[level.id] = level.price_modifier
          })

          setQualityModifiers(modifiers)
        }
      } catch (error) {
        console.error("Error loading quality modifiers:", error)
      }
    }

    loadQualityModifiers()
  }, [])

  // --- NEW function to process the price info from calculateJobPrice --- START
  const processPriceInfo = (
    priceInfo: any,
    quality: string,
    qty: number,
    multiPart: boolean,
    isMultiColorFlag: boolean,
  ) => {
    console.log("processPriceInfo called with:", { priceInfo, quality, qty, multiPart, isMultiColorFlag })

    if (!priceInfo || typeof priceInfo.total_price === "undefined") {
      setError("Invalid pricing information received from backend")
      setQuoteDetails(null) // Clear quote details on error
      return
    }

    // Get individual components from the calculated priceInfo
    const basePrice = priceInfo.base_price || 0
    const colorModifier = priceInfo.color_addon || 0
    const materialModifier = priceInfo.material_modifier || 0
    const qualityModifier = priceInfo.quality_modifier || 0
    const multiColorModifier = isMultiColorFlag ? 15 : 0 // Keep frontend logic for this modifier for now

    // Unit price is now directly from the backend's total_price
    const unitPrice = priceInfo.total_price
    console.log("Using unitPrice from backend:", unitPrice, "Breakdown:", {
      basePrice,
      colorModifier,
      materialModifier,
      qualityModifier,
      multiColorModifier,
    })

    // Calculate total with quantity
    let totalWithQuantity = unitPrice * qty

    // Apply multi-part discount
    if (multiPart && qty > 1) {
      totalWithQuantity *= 0.9 // 10% discount
    }

    setQuoteDetails({
      basePrice, // Store for display if needed
      colorModifier,
      materialModifier,
      multiColorModifier,
      qualityModifier,
      total: unitPrice, // This is the final unit price from backend
      totalWithQuantity,
      // Keep filamentUsed, estimatedTime etc. from jobResultDetails if needed for display
      filamentUsed: jobResultDetails?.filament_used_g,
      estimatedTime: jobResultDetails?.estimated_time,
      hasSupports: jobResultDetails?.has_supports,
      size: jobResultDetails?.size,
      volumeCm3: jobResultDetails?.volume_cm3,
    })
    setError(null) // Clear any previous errors if successful
  }
  // --- NEW function to process the price info from calculateJobPrice --- END

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || !quoteDetails) return
    setQuantity(newQuantity)

    // Recalculate total with new quantity based on the unit price (quoteDetails.total)
    const newTotalWithQuantity = quoteDetails.total * newQuantity

    // Apply multi-part discount if applicable
    const finalTotal = isMultiPart && newQuantity > 1 ? newTotalWithQuantity * 0.9 : newTotalWithQuantity

    setQuoteDetails({
      ...quoteDetails,
      totalWithQuantity: finalTotal,
    })
  }

  const handleMultiPartChange = (checked: boolean) => {
    if (!quoteDetails) return
    setIsMultiPart(checked)

    // Recalculate total with multi-part discount
    const totalWithQuantity = quoteDetails.total * quantity
    const finalTotal = checked && quantity > 1 ? totalWithQuantity * 0.9 : totalWithQuantity

    setQuoteDetails({
      ...quoteDetails,
      totalWithQuantity: finalTotal,
    })
  }

  console.log("QuotePage render - current jobId state:", jobId); // <-- ADD Log before addToCart definition

  const addToCart = async () => {
    console.log("addToCart called - jobId state:", jobId, "quoteDetails:", quoteDetails); // <-- ADD Log at function start
    if (!jobId || !quoteDetails) {
      // Check quoteDetails as well
      setCartError("Cannot add to cart: Job ID or Quote Details are missing.")
      return
    }

    setIsAddingToCart(true)
    setCartError(null)

    try {
      console.log(`Calling addJobToCart for job ID: ${jobId}`)
      const cartResult = await addJobToCart(jobId) // Moves files on backend
      console.log("addJobToCart response:", cartResult)
      if (!cartResult.success) {
        throw new Error(cartResult.message || "Backend failed to add job to cart.")
      }

      // Ensure job_id is included here when creating the item for sessionStorage
      const cartItem: CartItem = {
        modelName: modelName || "Unknown Model",
        selectedColor: selectedColor || "#cccccc",
        selectedSpecialFilament: selectedSpecialFilament || "",
        selectedMaterial: selectedMaterial || "PLA",
        selectedQuality: selectedQuality,
        isMultiColor,
        multiColorDetails,
        quantity,
        isMultiPart,
        price: quoteDetails.totalWithQuantity,
        job_id: jobId, // Make sure this line exists and jobId is populated
        image: modelUrl || "/placeholder.svg", // Use preview image URL
      }
      console.log("Adding item to cart session storage:", cartItem); // Add log

      const existingCart = sessionStorage.getItem("cart")
      const cart = existingCart ? JSON.parse(existingCart) : []
      cart.push(cartItem)
      sessionStorage.setItem("cart", JSON.stringify(cart))

      setAddedToCart(true)
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (err: any) {
      console.error("Error adding item to cart:", err)
      setCartError(err.message || "An unexpected error occurred while adding to cart.")
      setAddedToCart(false)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // --- Render Logic ---
  // Make sure to handle the case where quoteDetails is null during loading/error

  if (!isClient) {
    // ... loading placeholder ...
    return <div className="container py-12 text-center">Loading Client...</div>
  }

  if (isLoading) {
    // ... loading spinner ...
    return (
      <div className="container py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <h2 className="text-xl font-medium mb-2">Processing & Calculating Quote</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Checking job status and calculating the price based on your selections. This may take a few moments.
        </p>
      </div>
    )
  }

  if (error) {
    // ... error display ...
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => router.push("/customize")} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customization
          </Button>
        </div>
      </div>
    )
  }

  if (!modelName || !selectedMaterial || !quoteDetails) {
    // Check quoteDetails here
    // This might indicate an issue if loading is finished but data is still missing
    return <div className="container py-12 text-center">Loading Quote Details...</div>
  }

  // --- Main Render Structure (uses quoteDetails) --- START
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container">
          {/* ... Back link ... */}
          <div className="mb-8">
            <Link href="/customize" className="text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customization
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            {/* --- Model Viewer Card --- */}
            <div>
              <Card className="mb-6 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your 3D Print</CardTitle>
                    <CardDescription>
                      {modelName} - Preview of your customized model
                      {isMultiColor && " (Preview shows base color only)"}
                    </CardDescription>
                  </div>

                  {/* Improved viewer theme toggle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewerTheme(viewerTheme === "dark" ? "light" : "dark")}
                          className="rounded-full h-9 w-9"
                        >
                          {viewerTheme === "dark" ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Moon className="h-5 w-5 text-blue-500" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Switch to {viewerTheme === "dark" ? "light" : "dark"} background</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="aspect-square p-0">
                  <div className="aspect-square overflow-hidden rounded-md border relative">
                    <ModelViewer
                      modelPath={modelUrl || "fallback"}
                      color={selectedColor || "#cccccc"}
                      material={selectedMaterial || "PLA"}
                      jobId={jobId || undefined}
                      isLoading={!modelUrl}
                      viewerTheme={viewerTheme}
                    />
                    {/* Dimensions overlay */}
                    {quoteDetails?.size && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {`${quoteDetails.size.x.toFixed(1)}×${quoteDetails.size.y.toFixed(1)}×${quoteDetails.size.z.toFixed(1)} mm`}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Quote Details Card --- */}
            <div>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/50">
                  <CardTitle>Your Quote</CardTitle>
                  <CardDescription>Pricing breakdown for your customized 3D print</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* ... Display Model, Material, Color, Quality (using state variables) ... */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-sm">Model:</div>
                      <div className="text-sm font-medium">{modelName}</div>

                      <div className="text-sm">Material:</div>
                      <div className="text-sm font-medium">{selectedMaterial}</div>

                      <div className="text-sm">Color:</div>
                      {/* ... Color display logic (same as before) ... */}
                      <div className="flex items-center">
                        {isMultiColor ? (
                          <span className="text-sm font-medium">Multi-Color</span>
                        ) : selectedSpecialFilament ? (
                          <span className="text-sm font-medium">
                            Special: {/* ... special filament name logic ... */}
                          </span>
                        ) : (
                          <>
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: selectedColor || "#cccccc" }}
                            />
                            <span className="text-sm font-medium">{/* ... color name logic ... */}</span>
                          </>
                        )}
                      </div>

                      <div className="text-sm">Quality:</div>
                      {/* ... Quality display logic (same as before) ... */}
                      <div className="text-sm font-medium">
                        {selectedQuality === "draft"
                          ? "Draft"
                          : selectedQuality === "standard"
                            ? "Standard"
                            : selectedQuality === "high"
                              ? "High Quality"
                              : selectedQuality === "ultra"
                                ? "Ultra Fine"
                                : "Standard"}
                      </div>

                      {isMultiColor && multiColorDetails && (
                        <>
                          <div className="text-sm">Multi-Color Details:</div>
                          <div className="text-sm font-medium">{multiColorDetails}</div>
                        </>
                      )}
                    </div>

                    <Separator />

                    {/* --- Price Breakdown (using quoteDetails state) --- */}
                    <div className="space-y-2">
                      {/* Display breakdown components if needed, using quoteDetails */}
                      {/* Example: Base Price */}
                      {/* <div className="flex justify-between">
                        <span className="text-sm">Base Price:</span>
                        <span className="text-sm font-medium">${quoteDetails.basePrice.toFixed(2)}</span>
                      </div> */}
                      {/* ... other modifiers ... */}

                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-base font-medium">Unit Price:</span>
                        <span className="text-base font-medium">${quoteDetails.total.toFixed(2)}</span>
                      </div>
                      {/* TODO: Implement print details display in future version 
                      {jobResultDetails && (
                        <div className="text-xs text-muted-foreground space-y-1 mt-2">
                          {jobResultDetails.filament_used_g && (
                            <div>Filament: {jobResultDetails.filament_used_g.toFixed(2)}g</div>
                          )}
                          {jobResultDetails.estimated_time && <div>Est. Time: {jobResultDetails.estimated_time}</div>}
                          {jobResultDetails.volume_cm3 && (
                            <div>Volume: {jobResultDetails.volume_cm3.toFixed(2)} cm³</div>
                          )}
                        </div>
                      )} */}
                    </div>

                    {/* --- Quantity and Multi-Part Section --- */}
                    <div className="pt-4 space-y-4">
                      {/* ... Quantity input (uses handleQuantityChange) ... */}
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <Label htmlFor="quantity">Quantity:</Label>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                            className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* ... Multi-part checkbox (uses handleMultiPartChange) ... */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multi-part"
                          checked={isMultiPart}
                          onCheckedChange={(checked) => handleMultiPartChange(checked as boolean)}
                          disabled={quantity <= 1}
                        />
                        <Label htmlFor="multi-part" className={`${quantity <= 1 ? "text-muted-foreground" : ""}`}>
                          These are multiple parts of the same item (10% discount)
                        </Label>
                      </div>
                      {/* ... Multi-part discount display ... */}
                      {isMultiPart && quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          Multi-part discount applied: -${(quoteDetails.total * quantity * 0.1).toFixed(2)}
                        </div>
                      )}
                      {/* ... Multi-color alert ... */}
                      {isMultiColor && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            For multi-color prints, our team will contact you to confirm final pricing after reviewing
                            your requirements.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* --- Total Price Display --- */}
                      <div className="flex justify-between pt-2">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-lg font-bold">${quoteDetails.totalWithQuantity.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  {/* ... Add to Cart Button (uses addToCart) ... */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={addToCart}
                    disabled={
                      addedToCart || quoteDetails.totalWithQuantity < 0 || isLoading || isAddingToCart || !quoteDetails
                    } // Disable if no quoteDetails
                  >
                    {isAddingToCart ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-4 w-4" />
                    )}
                    {isAddingToCart
                      ? "Adding..."
                      : addedToCart
                        ? "Added to Cart"
                        : quoteDetails.totalWithQuantity === 0
                          ? "Add to Cart (Free)"
                          : "Add to Cart"}
                  </Button>
                  {/* ... Cart Error/Success Messages ... */}
                  {cartError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-destructive"
                    >
                      {cartError}
                    </motion.div>
                  )}
                  {addedToCart && !cartError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Item added to cart.{" "}
                      <Link href="/cart" className="text-primary hover:underline">
                        View Cart
                      </Link>
                    </motion.div>
                  )}
                  {/* ... Save/Share Buttons ... */}
                  <div className="flex gap-4 w-full">
                    {/* TODO: Implement save and share quote functionality in the future */}
                    {/* <Button variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Save Quote
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Quote
                    </Button> */}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
  // --- Main Render Structure --- END
}
