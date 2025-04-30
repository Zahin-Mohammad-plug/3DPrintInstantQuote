"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getMaterials } from "@/services/api" // Import the API function
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, Loader2 } from "lucide-react" // Added Loader2
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert" // Added Alert

// Interface for standard color options derived from backend
interface ColorOption {
  id: string
  name: string
  hex: string
  priceModifier: number // Corresponds to addon_price
}

// Interface for special filament options derived from backend
interface SpecialFilamentOption {
  id: string
  name: string
  description: string
  preview: string // Corresponds to previewImg (path to SVG)
  priceModifier: number
}

interface ColorSelectorProps {
  onSelect: (value: string, isSpecial?: boolean, specialId?: string) => void // value is hex for standard, name for special
  selectedColor: string | null // Hex code
  selectedSpecialFilament: string | null // ID of the special filament
  onMultiColorChange?: (isMultiColor: boolean, details?: string) => void
  // Add a prop to indicate if the selected material supports multi-color
  materialSupportsMultiColor?: boolean
}

// --- REMOVE MOCK_COLORS and SPECIAL_FILAMENTS ---

export function ColorSelector({
  onSelect,
  selectedColor,
  selectedSpecialFilament,
  onMultiColorChange = () => {},
  materialSupportsMultiColor = true, // Default to true if not provided
}: ColorSelectorProps) {
  const [colors, setColors] = useState<ColorOption[]>([])
  const [specialFilaments, setSpecialFilaments] = useState<SpecialFilamentOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMultiColor, setIsMultiColor] = useState(false)
  const [multiColorDetails, setMultiColorDetails] = useState("")
  const [activeTab, setActiveTab] = useState("standard")

  useEffect(() => {
    const loadColorData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMaterials()

        // Extract unique standard colors
        const uniqueColors = new Map<string, ColorOption>()
        if (data && data.materials) {
          data.materials.forEach((material: any) => {
            if (material.colors) {
              material.colors.forEach((color: any) => {
                if (!uniqueColors.has(color.id)) {
                  uniqueColors.set(color.id, {
                    id: color.id,
                    name: color.name,
                    hex: color.hex,
                    priceModifier: color.addon_price || 0, // Use addon_price
                  })
                }
              })
            }
          })
        }
        setColors(Array.from(uniqueColors.values()))

        // Extract special filaments (if provided by backend)
        if (data && data.special_filaments) {
          const mappedSpecialFilaments = data.special_filaments.map((sf: any): SpecialFilamentOption => ({
            id: sf.id,
            name: sf.name,
            description: sf.description,
            // Use placeholder if previewImg is missing or adjust path as needed
            preview: sf.previewImg || "/customTextures/placeHolder.svg",
            priceModifier: sf.priceModifier || 0,
          }))
          setSpecialFilaments(mappedSpecialFilaments)
        } else {
          setSpecialFilaments([]) // Ensure it's an empty array if not provided
        }

      } catch (err: any) {
        console.error("Error fetching color/filament data:", err)
        setError("Failed to load color options. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadColorData()
  }, [])

  // Handle multi-color checkbox change
  const handleMultiColorChange = (checked: boolean) => {
    setIsMultiColor(checked)
    onMultiColorChange(checked, multiColorDetails)

    // If turning on multi-color, deselect any selected standard/special color
    if (checked && (selectedColor || selectedSpecialFilament)) {
      onSelect("", false, "") // Clear selection
    }
    // If turning off multi-color, potentially switch back to standard tab if it was disabled
    if (!checked && activeTab !== 'standard' && activeTab !== 'special') {
        setActiveTab('standard');
    }
  }

  // Handle multi-color details change
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiColorDetails(e.target.value)
    // Call onMultiColorChange immediately as details change
    onMultiColorChange(isMultiColor, e.target.value)
  }

  // Handle standard color selection (pass hex code)
  const handleColorSelect = (hex: string) => {
    if (activeTab === "standard" && !isMultiColor) {
      onSelect(hex, false, "") // Pass hex, not special, clear special ID
    }
  }

  // Handle special filament selection (pass name and ID)
  const handleSpecialFilamentSelect = (id: string) => {
    if (activeTab === "special" && !isMultiColor) {
      const filament = specialFilaments.find((f) => f.id === id)
      if (filament) {
        onSelect(filament.name, true, id) // Pass name, is special, pass ID
      }
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Clear selection when changing tabs if multi-color isn't selected
    if (!isMultiColor) {
        if (value === "standard" && selectedSpecialFilament) {
          onSelect("", false, "") // Clear special selection
        } else if (value === "special" && selectedColor) {
          onSelect("", false, "") // Clear standard selection
        }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading Colors...</span>
      </div>
    )
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Select a color or special filament. Options may vary by material. Premium options have additional costs.
      </div>

      {/* Only show tabs if there are special filaments OR standard colors */}
      {(specialFilaments.length > 0 || colors.length > 0) && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="standard" disabled={isMultiColor || colors.length === 0}>
              Standard Colors
            </TabsTrigger>
            <TabsTrigger value="special" disabled={isMultiColor || specialFilaments.length === 0}>
              Special Filaments
            </TabsTrigger>
          </TabsList>

          {/* Standard Colors Content */}
          <TabsContent value="standard" className="space-y-4">
             {colors.length > 0 ? (
                <RadioGroup
                  value={selectedColor || undefined} // Use selectedColor (hex)
                  onValueChange={handleColorSelect}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  disabled={isMultiColor}
                >
                  {colors.map((color) => (
                    <div key={color.id} className="relative">
                      <RadioGroupItem
                        value={color.hex} // Value is the hex code
                        id={`color-${color.id}`}
                        className="peer sr-only"
                        disabled={isMultiColor}
                      />
                      <Label
                        htmlFor={`color-${color.id}`}
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${isMultiColor ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-12 h-12 rounded-full mb-2 border flex items-center justify-center"
                          style={{
                            backgroundColor: color.hex,
                            borderColor: color.hex === "#ffffff" ? "#e2e8f0" : color.hex,
                          }}
                        >
                          {/* Check based on selectedColor (hex) */}
                          {selectedColor === color.hex && !isMultiColor && (
                            <Check className={`h-6 w-6 ${color.hex === "#ffffff" ? "text-black" : "text-white"}`} />
                          )}
                        </motion.div>
                        <div className="text-center">
                          <div className="font-medium">{color.name}</div>
                          {/* Display priceModifier (addon_price) */}
                          {color.priceModifier > 0 && (
                            <div className="text-xs text-muted-foreground">+${color.priceModifier.toFixed(2)}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
             ) : (
                <p className="text-sm text-muted-foreground">No standard colors available.</p>
             )}
          </TabsContent>

          {/* Special Filaments Content */}
          <TabsContent value="special" className="space-y-4">
            {specialFilaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialFilaments.map((filament) => (
                    <div key={filament.id} className="relative">
                      <input
                        type="radio"
                        id={`filament-${filament.id}`}
                        name="special-filament" // Use radio group name
                        className="peer sr-only"
                        value={filament.id} // Value is the ID
                        checked={selectedSpecialFilament === filament.id} // Check based on selectedSpecialFilament (ID)
                        onChange={() => handleSpecialFilamentSelect(filament.id)}
                        disabled={isMultiColor}
                      />
                      <label
                        htmlFor={`filament-${filament.id}`}
                        className={`flex items-start gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary ${isMultiColor ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200" // Added bg color
                        >
                          <img
                            src={filament.preview} // Use the preview path
                            alt={filament.name}
                            className="w-full h-full object-cover"
                            // Add error handling for image loading if needed
                            onError={(e) => (e.currentTarget.src = "/customTextures/placeHolder.svg")}
                          />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{filament.name}</div>
                            {/* Display priceModifier */}
                            <div className="text-sm font-medium text-primary">+${filament.priceModifier.toFixed(2)}</div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{filament.description}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground">No special filaments available.</p>
            )}
          </TabsContent>
        </Tabs>
      )}
      {/* Show message if no colors or filaments loaded */}
      {colors.length === 0 && specialFilaments.length === 0 && !isLoading && (
         <p className="text-sm text-muted-foreground">No color or filament options available.</p>
      )}

      <Separator className="my-4" />

      {/* Multi-Color Section */}
      {/* Only show multi-color option if the selected material supports it */}
      {materialSupportsMultiColor && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multi-color"
              checked={isMultiColor}
              onCheckedChange={(checked) => handleMultiColorChange(checked as boolean)}
              // Disable if no standard or special colors are selected (as multi-color needs a base)
              // disabled={!selectedColor && !selectedSpecialFilament}
            />
            <Label htmlFor="multi-color" className="font-medium cursor-pointer">
              Multi-Color Print (Custom Quote)
            </Label>
          </div>

          {isMultiColor && (
            <motion.div
              className="space-y-2 pl-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Label htmlFor="multi-color-details">Please describe your multi-color requirements:</Label>
              <Input
                id="multi-color-details"
                placeholder="E.g., Red base with white text on the front"
                value={multiColorDetails}
                onChange={handleDetailsChange}
              />
              <p className="text-xs text-muted-foreground">
                Multi-color prints require special handling and will be quoted individually. Our team will contact you
                with pricing after reviewing your requirements.
              </p>
              {/* Consider fetching this base price from global_settings if available */}
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium">Multi-color pricing starts at +$15.00 (example)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Final price depends on complexity and number of colors.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
       {!materialSupportsMultiColor && (
         <p className="text-sm text-muted-foreground pl-1">Multi-color printing is not available for the selected material.</p>
       )}
    </div>
  )
}

