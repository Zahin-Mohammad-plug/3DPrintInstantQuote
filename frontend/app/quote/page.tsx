"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ModelViewer } from "@/components/model-viewer"
import { ArrowLeft, Download, ShoppingCart, Share2, Plus, Minus, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"
import { getJobStatus, getMaterials, addJobToCart } from "@/services/api"

// Define API base URL for model files
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  jobId: string
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
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    basePrice: 0,
    colorModifier: 0,
    materialModifier: 0,
    multiColorModifier: 0,
    qualityModifier: 0,
    total: 0,
    totalWithQuantity: 0,
  })
  const [addedToCart, setAddedToCart] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Add loading state for cart button
  const [cartError, setCartError] = useState<string | null>(null); // Add error state for cart action

  useEffect(() => {
    setIsClient(true)
    
    // Check if we have all the required data in session storage
    const storedModel = sessionStorage.getItem("uploadedModel")
    const storedColor = sessionStorage.getItem("selectedColor")
    const storedSpecialFilament = sessionStorage.getItem("selectedSpecialFilament")
    const storedMaterial = sessionStorage.getItem("selectedMaterial")
    const storedQuality = sessionStorage.getItem("selectedQuality")
    const storedIsMultiColor = sessionStorage.getItem("isMultiColor")
    const storedMultiColorDetails = sessionStorage.getItem("multiColorDetails")
    const storedJobId = sessionStorage.getItem("jobId")

    if (!storedModel || (!storedColor && !storedSpecialFilament && !storedIsMultiColor) || !storedMaterial || !storedJobId) {
      router.push("/upload")
      return
    }

    setModelName(storedModel)
    setSelectedColor(storedColor)
    setSelectedSpecialFilament(storedSpecialFilament)
    setSelectedMaterial(storedMaterial)
    setSelectedQuality(storedQuality || "standard")
    setIsMultiColor(storedIsMultiColor === "true")
    setMultiColorDetails(storedMultiColorDetails || "")
    setJobId(storedJobId)
    
    // Fetch job status and quote from the backend
    const fetchJobStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const jobStatus = await getJobStatus(storedJobId)
        
        if (jobStatus.status === 'failed') {
          setError(jobStatus.error || 'Failed to process model')
          return
        }
        
        if (jobStatus.status !== 'completed') {
          // If the job is not completed, poll for updates
          const pollingInterval = setInterval(async () => {
            try {
              const updatedStatus = await getJobStatus(storedJobId)
              
              if (updatedStatus.status === 'completed' || updatedStatus.status === 'failed') {
                clearInterval(pollingInterval)
                
                if (updatedStatus.status === 'failed') {
                  setError(updatedStatus.error || 'Failed to process model')
                } else {
                  // Process the completed job
                  processCompletedJob(updatedStatus, storedQuality || "standard", 1, false)
                }
              }
            } catch (err: any) {
              clearInterval(pollingInterval)
              setError(err.message || 'Failed to get job status')
            }
          }, 3000)
          
          // Clean up interval on component unmount
          return () => clearInterval(pollingInterval)
        } else {
          // Process the completed job
          processCompletedJob(jobStatus, storedQuality || "standard", 1, false)
        }
        
        // Set model URL for the viewer
        if (jobStatus.filename) {
          const modelUrlPath = `${API_BASE_URL}/api/file/${jobStatus.filename}`;
          
          // Check if the file exists before setting the URL
          try {
            const fileCheck = await fetch(modelUrlPath, { method: 'HEAD' });
            if (fileCheck.ok) {
              setModelUrl(modelUrlPath);
            } else {
              console.log("Model file not available yet");
              
              // Check if this is a 3MF file that might have been converted to STL
              if (jobStatus.filename.toLowerCase().endsWith('.3mf')) {
                const stlFilename = jobStatus.filename.replace(/\.3mf$/i, '.stl');
                const stlUrlPath = `${API_BASE_URL}/api/file/${stlFilename}`;
                
                try {
                  const stlCheck = await fetch(stlUrlPath, { method: 'HEAD' });
                  if (stlCheck.ok) {
                    console.log("Found converted STL file");
                    setModelUrl(stlUrlPath);
                  }
                } catch (stlErr) {
                  console.error("Error checking STL version:", stlErr);
                  // Don't set error yet
                }
              }
            }
          } catch (err) {
            console.error("Error checking model file:", err);
            // Don't set error yet
          }
        }
        
      } catch (err: any) {
        setError(err.message || 'Failed to get job status')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchJobStatus()
  }, [router])
  
  // Get quality modifiers from the backend
  const [qualityModifiers, setQualityModifiers] = useState<{[key: string]: number}>({
    draft: -5,
    standard: 0,
    high: 10,
    ultra: 15
  });
  
  // Load quality modifiers from the backend
  useEffect(() => {
    const loadQualityModifiers = async () => {
      try {
        const materialsData = await getMaterials();
        
        // Check if quality levels are available in the response
        if (materialsData.global_settings && materialsData.global_settings.quality_levels) {
          const modifiers: {[key: string]: number} = {};
          
          // Map quality levels to modifiers
          materialsData.global_settings.quality_levels.forEach((level: any) => {
            modifiers[level.id] = level.price_modifier;
          });
          
          setQualityModifiers(modifiers);
        }
      } catch (error) {
        console.error("Error loading quality modifiers:", error);
      }
    };
    
    loadQualityModifiers();
  }, []);

  // Process a completed job and set quote details
  const processCompletedJob = (jobStatus: any, quality: string, qty: number, multiPart: boolean) => {
    if (!jobStatus.result) {
      setError('No result data available for this job')
      return
    }
    
    const result = jobStatus.result
    const priceInfo = result.price_info
    
    if (!priceInfo) {
      setError('No pricing information available')
      return
    }
    
    // Get base price with markup from backend calculation
    const basePrice = priceInfo.base_price || 0
    const basePriceWithMarkup = priceInfo.base_price_with_markup || 0
    
    // Get modifiers from backend
    const colorModifier = priceInfo.color_addon || 0
    const materialModifier = priceInfo.material_modifier || 0
    
    // Calculate multi-color modifier (this is applied on the frontend)
    const multiColorModifier = isMultiColor ? 15 : 0
    
    // Get quality modifier from backend
    const qualityModifier = priceInfo.quality_modifier || 0
    
    // Calculate total price: base price with markup + all modifiers
    const total = basePriceWithMarkup + colorModifier + materialModifier + multiColorModifier + qualityModifier
    
    // Apply quantity
    let totalWithQuantity = total * qty
    
    // Apply multi-part discount if applicable
    if (multiPart && qty > 1) {
      // 10% discount for multi-part prints
      totalWithQuantity = totalWithQuantity * 0.9
    }
    
    // Set quote details with proper validation to prevent NaN
    setQuoteDetails({
      basePrice: basePriceWithMarkup || 0, // Show the base price with markup
      colorModifier: colorModifier || 0,
      materialModifier: materialModifier || 0,
      multiColorModifier: multiColorModifier || 0,
      qualityModifier: qualityModifier || 0,
      total: total || 0,
      totalWithQuantity: totalWithQuantity || 0,
      filamentUsed: result.filament_used_g,
      estimatedTime: result.estimated_time,
      hasSupports: result.has_supports,
      size: result.size,
      volumeCm3: result.volume_cm3
    })
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantity(newQuantity)
    
    // Recalculate total with new quantity
    const newTotalWithQuantity = quoteDetails.total * newQuantity
    
    // Apply multi-part discount if applicable
    const finalTotal = isMultiPart && newQuantity > 1 
      ? newTotalWithQuantity * 0.9 
      : newTotalWithQuantity
    
    setQuoteDetails({
      ...quoteDetails,
      totalWithQuantity: finalTotal
    })
  }

  const handleMultiPartChange = (checked: boolean) => {
    setIsMultiPart(checked)
    
    // Recalculate total with multi-part discount
    const totalWithQuantity = quoteDetails.total * quantity
    const finalTotal = checked && quantity > 1 
      ? totalWithQuantity * 0.9 
      : totalWithQuantity
    
    setQuoteDetails({
      ...quoteDetails,
      totalWithQuantity: finalTotal
    })
  }

  const addToCart = async () => { // Make the function async
    if (!jobId) {
      setCartError("Cannot add to cart: Job ID is missing.");
      return;
    }

    setIsAddingToCart(true); // Set loading state
    setCartError(null); // Clear previous errors

    try {
      // --- Call backend to move files --- START
      console.log(`Calling addJobToCart for job ID: ${jobId}`);
      const cartResult = await addJobToCart(jobId);
      console.log("addJobToCart response:", cartResult);
      if (!cartResult.success) {
        throw new Error(cartResult.message || "Backend failed to add job to cart.");
      }
      // --- Call backend to move files --- END

      // Proceed with adding to session storage cart if backend call was successful
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
        jobId: jobId // Use the confirmed jobId
      };

      const existingCart = sessionStorage.getItem("cart");
      const cart = existingCart ? JSON.parse(existingCart) : [];
      cart.push(cartItem);
      sessionStorage.setItem("cart", JSON.stringify(cart));

      setAddedToCart(true); // Mark as added

      // Dispatch event to update cart icon
      window.dispatchEvent(new Event("cartUpdated"));

    } catch (err: any) {
      console.error("Error adding item to cart:", err);
      setCartError(err.message || "An unexpected error occurred while adding to cart.");
      setAddedToCart(false); // Ensure it's not marked as added if there was an error
    } finally {
      setIsAddingToCart(false); // Clear loading state
    }
  };

  if (!isClient) {
    return <div className="container py-12 text-center">Loading...</div>
  }
  
  if (isLoading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <h2 className="text-xl font-medium mb-2">Calculating Your Quote</h2>
        <p className="text-muted-foreground text-center max-w-md">
          We're calculating the price for your 3D print. This may take a few moments.
        </p>
      </div>
    )
  }
  
  if (error) {
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

  if (!modelName || !selectedMaterial) {
    return <div className="container py-12 text-center">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container">
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
            <div>
              <Card className="mb-6 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/50">
                  <CardTitle>Your 3D Print</CardTitle>
                  <CardDescription>
                    {modelName} - Preview of your customized model
                    {isMultiColor && " (Preview shows base color only)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="aspect-square p-0">
                  <ModelViewer
                    modelPath={modelUrl || "fallback"}
                    color={selectedColor || "#cccccc"}
                    material={selectedMaterial || "PLA"}
                    jobId={jobId || undefined}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/50">
                  <CardTitle>Your Quote</CardTitle>
                  <CardDescription>Pricing breakdown for your customized 3D print</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm">Model:</div>
                      <div className="text-sm font-medium">{modelName}</div>

                      <div className="text-sm">Material:</div>
                      <div className="text-sm font-medium">{selectedMaterial}</div>

                      <div className="text-sm">Color:</div>
                      <div className="flex items-center">
                        {isMultiColor ? (
                          <span className="text-sm font-medium">Multi-Color</span>
                        ) : selectedSpecialFilament ? (
                          <span className="text-sm font-medium">
                            Special:{" "}
                            {selectedSpecialFilament === "rainbow"
                              ? "Rainbow PLA"
                              : selectedSpecialFilament === "galaxy"
                                ? "Galaxy PLA"
                                : selectedSpecialFilament === "marble"
                                  ? "Marble PLA"
                                  : selectedSpecialFilament === "glow"
                                    ? "Glow-in-Dark"
                                    : selectedSpecialFilament === "silk"
                                      ? "Silk Metallic"
                                      : selectedSpecialFilament === "wood"
                                        ? "Wood Composite"
                                        : selectedSpecialFilament}
                          </span>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedColor || "#cccccc" }} />
                            <span className="text-sm font-medium">
                              {selectedColor === "#ffffff"
                                ? "White"
                                : selectedColor === "#000000"
                                  ? "Black"
                                  : selectedColor === "#ff0000"
                                    ? "Red"
                                    : selectedColor === "#0000ff"
                                      ? "Blue"
                                      : selectedColor === "#00ff00"
                                        ? "Green"
                                        : selectedColor === "#ffff00"
                                          ? "Yellow"
                                          : selectedColor === "#ff9900"
                                            ? "Orange"
                                            : selectedColor === "#800080"
                                              ? "Purple"
                                              : selectedColor === "#ff69b4"
                                                ? "Pink"
                                                : selectedColor === "#008080"
                                                  ? "Teal"
                                                  : selectedColor === "#ffd700"
                                                    ? "Gold"
                                                    : selectedColor === "#c0c0c0"
                                                      ? "Silver"
                                                      : selectedColor}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-sm">Quality:</div>
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

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Base Price:</span>
                        <span className="text-sm font-medium">${quoteDetails.basePrice.toFixed(2)}</span>
                      </div>

                      {quoteDetails.colorModifier > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm">
                            {selectedSpecialFilament ? "Special Filament:" : "Color Premium:"}
                          </span>
                          <span className="text-sm font-medium">+${quoteDetails.colorModifier.toFixed(2)}</span>
                        </div>
                      )}

                      {quoteDetails.materialModifier > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm">Material Premium:</span>
                          <span className="text-sm font-medium">+${quoteDetails.materialModifier.toFixed(2)}</span>
                        </div>
                      )}

                      {quoteDetails.multiColorModifier > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm">Multi-Color Premium:</span>
                          <span className="text-sm font-medium">+${quoteDetails.multiColorModifier.toFixed(2)}</span>
                        </div>
                      )}

                      {quoteDetails.qualityModifier !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm">Quality Setting:</span>
                          <span className="text-sm font-medium">
                            {quoteDetails.qualityModifier > 0
                              ? `+$${quoteDetails.qualityModifier.toFixed(2)}`
                              : `-$${Math.abs(quoteDetails.qualityModifier).toFixed(2)}`}
                          </span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-base font-medium">Unit Price:</span>
                        <span className="text-base font-medium">${quoteDetails.total.toFixed(2)}</span>
                      </div>
                      {/* Print details are hidden as requested */}
                    </div>

                    <div className="pt-4 space-y-4">
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

                      {isMultiPart && quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          Multi-part discount applied: -${(quoteDetails.total * quantity * 0.1).toFixed(2)}
                        </div>
                      )}

                      {isMultiColor && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            For multi-color prints, our team will contact you to confirm final pricing after reviewing
                            your requirements.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-between pt-2">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-lg font-bold">${quoteDetails.totalWithQuantity.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={addToCart}
                    disabled={addedToCart || quoteDetails.totalWithQuantity < 0 || isLoading || isAddingToCart} // Disable while loading job or adding to cart
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

                  {cartError && ( // Display cart-specific errors
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-destructive"
                    >
                      {cartError}
                    </motion.div>
                  )}

                  {addedToCart && !cartError && ( // Only show success message if no error
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

                  <div className="flex gap-4 w-full">
                    <Button variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Save Quote
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Quote
                    </Button>
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
}
