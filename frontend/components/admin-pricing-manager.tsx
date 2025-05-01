"use client"

import { useState, useEffect } from "react"
import { getMaterials, updateMaterials } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Save } from "lucide-react"

interface PricingSettings {
  basePrice: number
  supportMaterialMultiplier: number
  defaultFillDensity: number
  formula: string // New field for custom pricing formula
}

export function AdminPricingManager() {
  const [settings, setSettings] = useState<PricingSettings>({
    basePrice: 25,
    supportMaterialMultiplier: 1.5,
    defaultFillDensity: 20,
    formula: "(x * 1.30) + 2" // default formula example
  })

  // Example calculation preview state and helper
  const [exampleX, setExampleX] = useState<number>(0)
  const computeExampleValue = () => {
    try {
      // Allow only x in the formula
      // eslint-disable-next-line no-new-func
      const fn = new Function("x", `return ${settings.formula};`)
      const val = fn(exampleX)
      return Number(val.toFixed(2))
    } catch {
      return NaN
    }
  }

  const handleChange = (field: keyof PricingSettings, value: number) => {
    setSettings({ ...settings, [field]: value })
  }

  // New handler for formula changes
  const handleFormulaChange = (value: string) => {
    setSettings({ ...settings, formula: value })
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const materialsData = await getMaterials();

        if (materialsData?.global_settings) {
          setSettings({
            basePrice: materialsData.global_settings.minimum_price ?? 25,
            supportMaterialMultiplier: materialsData.global_settings.support_material_multiplier ?? 1.5,
            defaultFillDensity: materialsData.global_settings.default_fill_density ?? 20,
            formula: materialsData.global_settings.pricing_formula ?? "(x * 1.30) + 2"
          });
        } else {
           setSettings({
             basePrice: 25,
             supportMaterialMultiplier: 1.5,
             defaultFillDensity: 20,
             formula: "(x * 1.30) + 2"
           });
        }
      } catch (error) {
        console.error("Error loading pricing settings:", error);
        alert("Failed to load pricing settings from the backend.");
         setSettings({
           basePrice: 25,
           supportMaterialMultiplier: 1.5,
           defaultFillDensity: 20,
           formula: "(x * 1.30) + 2"
         });
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const currentData = await getMaterials();
      if (!currentData) {
         alert("Failed to fetch current data from backend. Cannot save.");
         return;
      }

      const payload = {
        materials: currentData.materials || [],
        special_filaments: currentData.special_filaments || [],
        global_settings: {
          ...currentData.global_settings,
          minimum_price: settings.basePrice,
          support_material_multiplier: settings.supportMaterialMultiplier,
          default_fill_density: settings.defaultFillDensity,
          pricing_formula: settings.formula, // Save custom formula
          quality_levels: currentData.global_settings?.quality_levels || []
        }
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        alert("Pricing settings saved successfully!");
      } else {
        alert(`Failed to save pricing settings: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving pricing settings:", error);
      alert("Failed to save pricing settings to the backend.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Pricing Settings</CardTitle>
          <CardDescription>Configure global pricing parameters for all 3D prints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-price">Minimum Price ($)</Label>
              <Input
                id="base-price"
                type="number"
                min="0"
                step="0.01"
                value={settings.basePrice}
                onChange={(e) => handleChange("basePrice", Number.parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                The minimum price for any 3D print, applied if calculated cost is lower.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-multiplier">Support Material Multiplier</Label>
              <Input
                id="support-multiplier"
                type="number"
                min="0"
                step="0.1"
                value={settings.supportMaterialMultiplier}
                onChange={(e) => handleChange("supportMaterialMultiplier", Number.parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Multiplier applied to the cost of support material.</p>
            </div>
          </div>

          {/* New formula input */}
          <div className="space-y-2">
            <Label htmlFor="pricing-formula">Pricing Formula</Label>
            <Input
              id="pricing-formula"
              type="text"
              value={settings.formula}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="e.g. (x * 1.30) + 2"
            />
            <p className="text-xs text-muted-foreground">
              Enter the pricing formula using x as the slicer cost (apply floor price automatically).
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fill-density">Default Fill Density (%)</Label>
              <Input
                id="fill-density"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.defaultFillDensity}
                onChange={(e) => handleChange("defaultFillDensity", Number.parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Default infill percentage used for slicing.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Formula Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Formula Preview</CardTitle>
          <CardDescription>Test how your pricing formula applies to a given x value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="example-x">x (Prusa cost)</Label>
              <Input
                id="example-x"
                type="number"
                value={exampleX}
                onChange={(e) => setExampleX(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Formula</Label>
              <p className="font-mono break-all">{settings.formula}</p>
            </div>
          </div>
          <div>
            <Label>Computed Base Price</Label>
            <p className="text-lg font-bold">
              ${isNaN(computeExampleValue()) ? "Invalid formula" : computeExampleValue().toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Save Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSave} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Global Pricing Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

