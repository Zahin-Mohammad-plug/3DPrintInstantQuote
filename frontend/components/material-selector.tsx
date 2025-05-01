"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getMaterials } from "@/services/api" // Assuming you have an API function to fetch materials

interface MaterialOption {
  id: string
  name: string
  description: string
  priceModifier: number
  availableColors: string[] // hex codes
  supportsMultiColor: boolean
}

interface MaterialSelectorProps {
  onSelect: (material: string) => void
  selectedMaterial: string | null
  selectedColor: string | null
  isMultiColor?: boolean
}

export function MaterialSelector({
  onSelect,
  selectedMaterial,
  selectedColor,
  isMultiColor = false,
}: MaterialSelectorProps) {
  const [materials, setMaterials] = useState<MaterialOption[]>([]) // Initialize with empty array
  const [colorWarning, setColorWarning] = useState<string | null>(null)
  const [multiColorWarning, setMultiColorWarning] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch materials from the API
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming getMaterials fetches the structure from materials.json
        const response = await getMaterials(); 
        if (response && response.materials) {
          // Map backend data to frontend MaterialOption interface
          const fetchedMaterials = response.materials.map((mat: any) => ({
            id: mat.id,
            name: mat.name, // Use the name directly from backend
            description: mat.description,
            priceModifier: mat.priceModifier || 0, // Use priceModifier if available, else 0
            availableColors: mat.colors ? mat.colors.map((c: any) => c.hex) : [],
            supportsMultiColor: mat.supportsMultiColor !== undefined ? mat.supportsMultiColor : true, // Use backend value or default to true
          }));
          setMaterials(fetchedMaterials);
        } else {
          setError("Failed to load material data format.");
        }
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError("Failed to load materials. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  // Check if the selected color is available for the selected material
  useEffect(() => {
    if (selectedMaterial && selectedColor && !isMultiColor) {
      const material = materials.find((m) => m.id === selectedMaterial)
      if (material && !material.availableColors.includes(selectedColor)) {
        setColorWarning(
          `The selected color is not available for ${material.name}. Please go back and select a different color.`,
        )
      } else {
        setColorWarning(null)
      }
    } else {
      setColorWarning(null)
    }
  }, [selectedMaterial, selectedColor, materials, isMultiColor])

  // Check if the selected material supports multi-color
  useEffect(() => {
    if (isMultiColor && selectedMaterial) {
      const material = materials.find((m) => m.id === selectedMaterial)
      if (material && !material.supportsMultiColor) {
        setMultiColorWarning(
          `${material.name} does not support multi-color printing. Please select a different material or go back and choose a single color.`,
        )
      } else {
        setMultiColorWarning(null)
      }
    } else {
      setMultiColorWarning(null)
    }
  }, [isMultiColor, selectedMaterial, materials])

  const handleMaterialSelect = (materialId: string) => {
    onSelect(materialId)

    // Check if the selected color is available for this material
    if (selectedColor && !isMultiColor) {
      const material = materials.find((m) => m.id === materialId)
      if (material && !material.availableColors.includes(selectedColor)) {
        setColorWarning(
          `The selected color is not available for ${material.name}. Please go back and select a different color.`,
        )
      } else {
        setColorWarning(null)
      }
    }

    // Check if this material supports multi-color
    if (isMultiColor) {
      const material = materials.find((m) => m.id === materialId)
      if (material && !material.supportsMultiColor) {
        setMultiColorWarning(
          `${material.name} does not support multi-color printing. Please select a different material or go back and choose a single color.`,
        )
      } else {
        setMultiColorWarning(null)
      }
    }
  }

  // Render Loading State
  if (isLoading) {
    return <div className="p-4 text-center">Loading materials...</div>;
  }

  // Render Error State
  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Select a material for your 3D print. Different materials have different properties and costs.
      </div>

      {colorWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{colorWarning}</AlertDescription>
        </Alert>
      )}

      {multiColorWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{multiColorWarning}</AlertDescription>
        </Alert>
      )}

      {isMultiColor && !multiColorWarning && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've selected a multi-color print. Not all materials support multi-color printing.
          </AlertDescription>
        </Alert>
      )}

      <RadioGroup value={selectedMaterial || undefined} onValueChange={handleMaterialSelect} className="grid gap-4">
        {materials.map((material) => {
          const isColorAvailable = !selectedColor || isMultiColor || material.availableColors.includes(selectedColor)
          const supportsMultiColor = !isMultiColor || material.supportsMultiColor
          const isDisabled = !isColorAvailable || !supportsMultiColor

          return (
            <div key={material.id}>
              <RadioGroupItem
                value={material.id}
                id={`material-${material.id}`}
                className="peer sr-only"
                disabled={isDisabled}
              />
              <Label
                htmlFor={`material-${material.id}`}
                className={`flex items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{material.name}</div>
                    {selectedMaterial === material.id && <Check className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{material.description}</div>
                  <div className="text-sm font-medium mt-2">
                    {material.priceModifier > 0 ? `+$${material.priceModifier.toFixed(2)}` : "No additional cost"}
                  </div>
                  {isMultiColor && (
                    <div className="text-xs mt-1">
                      {material.supportsMultiColor
                        ? "✓ Supports multi-color printing"
                        : "✗ Does not support multi-color printing"}
                    </div>
                  )}
                </div>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

