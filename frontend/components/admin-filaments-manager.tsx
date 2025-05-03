"use client"

import { useState, useEffect } from "react"
// Import API functions and types
import { getMaterials, updateMaterials, MaterialsResponse, SpecialFilament } from "@/services/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
// Import Table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Keep existing icons + add Loader2
import { AlertCircle, Plus, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs

// Interface for standard color state (similar to admin-color-manager)
interface ColorItem {
  id: string
  name: string
  hex: string
  addon_price: number // Corresponds to addon_price in backend
}

// Interface for material state (similar to admin-material-manager)
interface MaterialItem {
  id: string
  name: string
  description: string
  priceModifier: number // Assuming this maps to a backend field, adjust if needed
  availableColorIds: string[] // Store color IDs for easier state management
  // Add other relevant fields if managed here (e.g., base_cost_per_gram, hourly_rate)
  base_cost_per_gram?: number;
  hourly_rate?: number;
  properties?: string[];
}

// Backend color structure within material
interface BackendColor {
    id: string;
    name: string;
    hex: string;
    addon_price: number;
}

export function AdminFilamentsManager() {
  // State for unique colors across all materials
  const [allColors, setAllColors] = useState<ColorItem[]>([])
  const [newColor, setNewColor] = useState<Omit<ColorItem, 'id'>>({ name: "", hex: "#000000", addon_price: 0 })

  // State for materials
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [newMaterial, setNewMaterial] = useState<Omit<MaterialItem, 'id'>>({
    name: "",
    description: "",
    priceModifier: 0,
    availableColorIds: [],
    base_cost_per_gram: 0.05, // Default example
    hourly_rate: 2.0, // Default example
    properties: ["Standard"], // Default example
  })

  // General state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Store special filaments to preserve them during updates
  const [specialFilaments, setSpecialFilaments] = useState<SpecialFilament[]>([]);
  // Store global settings to preserve them
  const [globalSettings, setGlobalSettings] = useState<any>(null);


  // Fetch data using the API service
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null); // Clear success message on reload
    try {
      const data = await getMaterials();
      if (data) {
        // Process unique colors
        const uniqueColorsMap = new Map<string, ColorItem>();
        if (data.materials) {
          data.materials.forEach((material: any) => {
            if (material.colors) {
              material.colors.forEach((color: BackendColor) => {
                if (!uniqueColorsMap.has(color.id)) {
                  uniqueColorsMap.set(color.id, {
                    id: color.id,
                    name: color.name,
                    hex: color.hex,
                    addon_price: color.addon_price || 0
                  });
                }
              });
            }
          });
        }
        setAllColors(Array.from(uniqueColorsMap.values()));

        // Process materials
        if (data.materials) {
          const mappedMaterials = data.materials.map((material: any) => ({
            id: material.id,
            name: material.name,
            description: material.description || "",
            priceModifier: material.priceModifier || 0, // Adjust field if needed
            availableColorIds: material.colors ? material.colors.map((c: BackendColor) => c.id) : [],
            base_cost_per_gram: material.base_cost_per_gram,
            hourly_rate: material.hourly_rate,
            properties: material.properties,
          }));
          setMaterials(mappedMaterials);
        } else {
          setMaterials([]);
        }

        // Preserve special filaments and global settings
        setSpecialFilaments(data.special_filaments || []);
        setGlobalSettings(data.global_settings || null);

      } else {
        setError("Failed to load data from the backend (empty response).");
        setAllColors([]);
        setMaterials([]);
        setSpecialFilaments([]);
        setGlobalSettings(null);
      }
    } catch (err: any) {
      console.error("Error loading filament data:", err);
      setError(`Failed to load data: ${err.message || "Unknown error"}`);
      setAllColors([]);
      setMaterials([]);
      setSpecialFilaments([]);
      setGlobalSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // --- Helper: Get full color object by ID ---
  const getColorById = (id: string): ColorItem | undefined => {
    return allColors.find(c => c.id === id);
  }

  // --- Color Management ---

  const handleNewColorChange = (field: keyof Omit<ColorItem, 'id'>, value: string | number) => {
    // Basic hex validation
    if (field === 'hex' && typeof value === 'string' && !value.startsWith('#')) {
        value = `#${value}`;
    }
    setNewColor(prev => ({ ...prev, [field]: value }));
  };

  // Add new color (adds to *all* existing materials)
  const addColor = async () => {
    setError(null);
    setSuccess(null);
    if (!newColor.name || !newColor.hex) {
      setError("Color Name and Hex are required.");
      return;
    }
    // Basic hex format check
    if (!/^#[0-9A-F]{6}$/i.test(newColor.hex)) {
        setError("Invalid Hex color format. Use #RRGGBB.");
        return;
    }

    setIsLoading(true);
    try {
      const currentData = await getMaterials(); // Fetch fresh data before update
      if (!currentData) {
        throw new Error("Failed to fetch current materials data.");
      }

      const newColorId = uuidv4(); // Generate unique ID
      const newColorData: BackendColor = {
        id: newColorId,
        name: newColor.name,
        hex: newColor.hex,
        addon_price: Number(newColor.addon_price) || 0,
      };

      // Add the new color to every existing material
      const updatedMaterials = (currentData.materials || []).map((material: any) => ({
        ...material,
        colors: [...(material.colors || []), newColorData], // Add to existing colors array
      }));

      const payload: MaterialsResponse = {
        ...currentData, // Preserve global settings etc.
        materials: updatedMaterials,
        special_filaments: currentData.special_filaments || [], // Preserve special filaments
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        setSuccess("Color added successfully to all materials!");
        setNewColor({ name: "", hex: "#000000", addon_price: 0 });
        loadData(); // Refresh data
      } else {
        throw new Error(result.message || "Failed to update materials on the backend.");
      }
    } catch (error: any) {
      console.error("Error adding color:", error);
      setError(`Failed to add color: ${error.message}`);
      setIsLoading(false); // Ensure loading stops on error
    }
    // No finally setIsLoading(false) here, loadData() handles it
  };

  // Delete color (removes from *all* materials)
  const deleteColor = async (id: string) => {
    const colorToDelete = allColors.find(c => c.id === id);
    if (!colorToDelete) return;

    if (!confirm(`Are you sure you want to delete the color "${colorToDelete.name}"? This will remove it from ALL materials.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const currentData = await getMaterials();
      if (!currentData) {
        throw new Error("Failed to fetch current materials data.");
      }

      // Remove the color from every material's color list
      const updatedMaterials = (currentData.materials || []).map((material: any) => ({
        ...material,
        colors: (material.colors || []).filter((color: BackendColor) => color.id !== id),
      }));

      const payload: MaterialsResponse = {
        ...currentData,
        materials: updatedMaterials,
        special_filaments: currentData.special_filaments || [],
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        setSuccess(`Color "${colorToDelete.name}" deleted successfully from all materials!`);
        loadData(); // Refresh data
      } else {
        throw new Error(result.message || "Failed to update materials on the backend.");
      }
    } catch (error: any) {
      console.error("Error deleting color:", error);
      setError(`Failed to delete color: ${error.message}`);
      setIsLoading(false);
    }
  };

  // --- Material Management ---

  const handleNewMaterialChange = (field: keyof Omit<MaterialItem, 'id' | 'availableColorIds'>, value: string | number | string[]) => {
    setNewMaterial(prev => ({ ...prev, [field]: value }));
  };

  // Toggle color selection for the *new* material being created
  const toggleColorForNewMaterial = (colorId: string) => {
    setNewMaterial((prev) => {
      const availableColorIds = prev.availableColorIds || [];
      const isSelected = availableColorIds.includes(colorId);
      return {
        ...prev,
        availableColorIds: isSelected
          ? availableColorIds.filter((id) => id !== colorId)
          : [...availableColorIds, colorId],
      };
    });
  };

  // Add new material
  const addMaterial = async () => {
    setError(null);
    setSuccess(null);
    if (!newMaterial.name) {
      setError("Material Name is required.");
      return;
    }

    setIsLoading(true);
    try {
        const currentData = await getMaterials();
        if (!currentData) {
            throw new Error("Failed to fetch current materials data.");
        }

        const newMaterialId = newMaterial.name.trim().toUpperCase().replace(/\s+/g, '_') + '_' + uuidv4().substring(0, 4); // More robust ID

        if ((currentData.materials || []).some((m: any) => m.id === newMaterialId)) {
            throw new Error(`Material with ID ${newMaterialId} already exists. Choose a different name.`);
        }

        // Map selected color IDs back to full color objects for the backend
        const selectedColorsData: BackendColor[] = (newMaterial.availableColorIds || [])
            .map(id => getColorById(id))
            .filter((color): color is ColorItem => color !== undefined) // Type guard
            .map(color => ({
                id: color.id,
                name: color.name,
                hex: color.hex,
                addon_price: color.addon_price
            }));

        const newMaterialBackend = {
            id: newMaterialId,
            name: newMaterial.name,
            description: newMaterial.description || "",
            priceModifier: Number(newMaterial.priceModifier) || 0, // Ensure number
            colors: selectedColorsData,
            // Include other fields if they exist in the backend structure
            base_cost_per_gram: Number(newMaterial.base_cost_per_gram) || 0.05,
            hourly_rate: Number(newMaterial.hourly_rate) || 2.0,
            properties: newMaterial.properties || ["Standard"],
        };

        const updatedMaterials = [...(currentData.materials || []), newMaterialBackend];

        const payload: MaterialsResponse = {
            ...currentData,
            materials: updatedMaterials,
            special_filaments: currentData.special_filaments || [],
        };

        const result = await updateMaterials(payload);

        if (result.success) {
            setSuccess("Material added successfully!");
            setNewMaterial({ name: "", description: "", priceModifier: 0, availableColorIds: [], base_cost_per_gram: 0.05, hourly_rate: 2.0, properties: ["Standard"] });
            loadData(); // Refresh data
        } else {
            throw new Error(result.message || "Failed to update materials on the backend.");
        }
    } catch (error: any) {
        console.error("Error adding material:", error);
        setError(`Failed to add material: ${error.message}`);
        setIsLoading(false);
    }
};


  // Delete material
  const deleteMaterial = async (id: string) => {
    const materialToDelete = materials.find(m => m.id === id);
     if (!materialToDelete) return;

    if (!confirm(`Are you sure you want to delete the material "${materialToDelete.name}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const currentData = await getMaterials();
      if (!currentData) {
        throw new Error("Failed to fetch current materials data.");
      }

      const updatedMaterials = (currentData.materials || []).filter((material: any) => material.id !== id);

      const payload: MaterialsResponse = {
        ...currentData,
        materials: updatedMaterials,
        special_filaments: currentData.special_filaments || [],
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        setSuccess(`Material "${materialToDelete.name}" deleted successfully!`);
        loadData(); // Refresh data
      } else {
        throw new Error(result.message || "Failed to update materials on the backend.");
      }
    } catch (error: any) {
      console.error("Error deleting material:", error);
      setError(`Failed to delete material: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Update an *existing* material's available colors
  const updateMaterialColors = async (materialId: string, selectedColorIds: string[]) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const currentData = await getMaterials();
      if (!currentData) {
        throw new Error("Failed to fetch current materials data.");
      }

      // Map selected color IDs back to full color objects
      const selectedColorsData: BackendColor[] = selectedColorIds
        .map(id => getColorById(id))
        .filter((color): color is ColorItem => color !== undefined) // Type guard
        .map(color => ({
            id: color.id,
            name: color.name,
            hex: color.hex,
            addon_price: color.addon_price
        }));

      // Find and update the specific material
      const updatedMaterials = (currentData.materials || []).map((material: any) => {
        if (material.id === materialId) {
          return { ...material, colors: selectedColorsData };
        }
        return material;
      });

      const payload: MaterialsResponse = {
        ...currentData,
        materials: updatedMaterials,
        special_filaments: currentData.special_filaments || [],
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        setSuccess(`Material colors updated successfully!`);
        loadData(); // Refresh data
      } else {
        throw new Error(result.message || "Failed to update materials on the backend.");
      }
    } catch (error: any) {
      console.error("Error updating material colors:", error);
      setError(`Failed to update material colors: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Toggle color for an *existing* material
  const toggleColorForExistingMaterial = (materialId: string, colorId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const currentSelectedIds = material.availableColorIds || [];
    const isSelected = currentSelectedIds.includes(colorId);
    const newSelectedIds = isSelected
      ? currentSelectedIds.filter(id => id !== colorId)
      : [...currentSelectedIds, colorId];

    // Update local state immediately for responsiveness (optional but good UX)
    setMaterials(prev => prev.map(m =>
        m.id === materialId ? { ...m, availableColorIds: newSelectedIds } : m
    ));

    // Trigger the API update
    updateMaterialColors(materialId, newSelectedIds);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filaments Manager</CardTitle>
        <CardDescription>Manage filament colors and material types</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 my-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading data...</span>
          </div>
        )}

        {/* Global Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="mt-4">
            <div className="space-y-6">
              {/* Add New Color Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Color</CardTitle>
                  <CardDescription>Adds the color to all existing materials.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="colorName">Color Name *</Label>
                        <Input
                          id="colorName"
                          value={newColor.name}
                          onChange={(e) => handleNewColorChange("name", e.target.value)}
                          placeholder="e.g., Cosmic Blue"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="colorHex">Color Hex *</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="colorHex"
                            value={newColor.hex}
                            onChange={(e) => handleNewColorChange("hex", e.target.value)}
                            placeholder="#1A2B3C"
                            maxLength={7}
                            disabled={isLoading}
                          />
                          <input
                            type="color"
                            value={newColor.hex}
                            onChange={(e) => handleNewColorChange("hex", e.target.value)}
                            className="w-10 h-10 rounded border p-0 cursor-pointer"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="colorPriceModifier">Addon Price ($)</Label>
                        <Input
                          id="colorPriceModifier"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newColor.addon_price}
                          onChange={(e) => handleNewColorChange("addon_price", Number.parseFloat(e.target.value))}
                          placeholder="0.00"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button onClick={addColor} disabled={isLoading} className="w-full md:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> Add Color
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Existing Colors Table */}
              <Card>
                 <CardHeader>
                    <CardTitle>Manage Existing Colors</CardTitle>
                    <CardDescription>Deleting a color removes it from all materials.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Preview</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Hex</TableHead>
                                    <TableHead>Addon Price</TableHead>
                                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allColors.length > 0 ? allColors.map((color) => (
                                    <TableRow key={color.id}>
                                        <TableCell>
                                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                                        </TableCell>
                                        <TableCell>{color.name}</TableCell>
                                        <TableCell>{color.hex}</TableCell>
                                        <TableCell>${color.addon_price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => deleteColor(color.id)} disabled={isLoading}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No colors found. Add your first color above.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                 </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="mt-4">
            <div className="space-y-6">
              {/* Add New Material Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Material</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="materialName">Material Name *</Label>
                        <Input
                          id="materialName"
                          value={newMaterial.name}
                          onChange={(e) => handleNewMaterialChange("name", e.target.value)}
                          placeholder="e.g., PLA Pro"
                          disabled={isLoading}
                        />
                      </div>
                       <div>
                        <Label htmlFor="materialPriceModifier">Price Modifier ($)</Label> {/* Adjust label if needed */}
                        <Input
                          id="materialPriceModifier"
                          type="number"
                          step="0.01"
                          value={newMaterial.priceModifier}
                          onChange={(e) => handleNewMaterialChange("priceModifier", Number.parseFloat(e.target.value))}
                          placeholder="0.00"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                     <div>
                        <Label htmlFor="materialDescription">Description</Label>
                        <Input /* Or Textarea */
                          id="materialDescription"
                          value={newMaterial.description}
                          onChange={(e) => handleNewMaterialChange("description", e.target.value)}
                          placeholder="e.g., Strong and durable material"
                          disabled={isLoading}
                        />
                      </div>

                    <div>
                      <Label className="mb-2 block">Available Colors *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                        {allColors.length > 0 ? allColors.map((color) => (
                          <div key={color.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`new-mat-color-${color.id}`}
                              checked={(newMaterial.availableColorIds || []).includes(color.id)}
                              onCheckedChange={() => toggleColorForNewMaterial(color.id)}
                              disabled={isLoading}
                            />
                            <Label htmlFor={`new-mat-color-${color.id}`} className="flex items-center gap-2 cursor-pointer text-sm">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                              {color.name} (${color.addon_price.toFixed(2)})
                            </Label>
                          </div>
                        )) : (
                            <p className="text-muted-foreground col-span-full text-center">No colors available. Add colors first.</p>
                        )}
                      </div>
                    </div>

                    <Button onClick={addMaterial} disabled={isLoading || allColors.length === 0} className="w-full md:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> Add Material
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Existing Materials Table */}
               <Card>
                 <CardHeader>
                    <CardTitle>Manage Existing Materials</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="border rounded-md">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price Mod.</TableHead>
                                    <TableHead>Available Colors</TableHead>
                                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {materials.length > 0 ? materials.map((material) => (
                                    <TableRow key={material.id}>
                                        <TableCell className="font-medium">{material.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{material.description}</TableCell>
                                        <TableCell>${material.priceModifier.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2 max-w-xs"> {/* Limit width */}
                                                {allColors.map((color) => (
                                                    <div key={color.id} className="flex items-center space-x-1">
                                                        <Checkbox
                                                            id={`mat-${material.id}-color-${color.id}`}
                                                            checked={(material.availableColorIds || []).includes(color.id)}
                                                            onCheckedChange={() => toggleColorForExistingMaterial(material.id, color.id)}
                                                            disabled={isLoading}
                                                            className="w-3.5 h-3.5"
                                                        />
                                                        <Label
                                                            htmlFor={`mat-${material.id}-color-${color.id}`}
                                                            className="flex items-center gap-1 cursor-pointer text-xs"
                                                            title={`${color.name} (${color.hex}) - $${color.addon_price.toFixed(2)}`}
                                                        >
                                                            <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                                                            {/* Optionally show name: {color.name} */}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {(material.availableColorIds || []).length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => deleteMaterial(material.id)} disabled={isLoading}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No materials found. Add your first material above.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                 </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
