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
import { AlertCircle, Plus, Trash2, Loader2, Save, X, Edit } from "lucide-react"
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

// Interface for special filament state (maps directly to backend SpecialFilament)
interface SpecialFilamentItem extends SpecialFilament {}

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

  // State for special filaments
  const [specialFilaments, setSpecialFilaments] = useState<SpecialFilamentItem[]>([])
  const [editingSpecialFilamentId, setEditingSpecialFilamentId] = useState<string | null>(null)
  const [newSpecialFilament, setNewSpecialFilament] = useState<Partial<SpecialFilamentItem>>({
    name: "",
    description: "",
    previewImg: "/customTextures/placeHolder.svg", // Default path
    priceModifier: 0,
  })
  const [editSpecialFilamentState, setEditSpecialFilamentState] = useState<SpecialFilamentItem | null>(null); // State for editing special filament

  // General state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Store global settings to preserve them
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  // --- Color Editing State ---
  const [editingColorId, setEditingColorId] = useState<string | null>(null)
  const [editColorState, setEditColorState] = useState<ColorItem | null>(null)

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
        // Map directly as the structure matches SpecialFilamentItem
        setSpecialFilaments(data.special_filaments ? data.special_filaments.map(sf => ({...sf})) : []);
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
        special_filaments: specialFilaments, // Preserve special filaments
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

  // Handle start editing a color
  const handleEditColor = (color: ColorItem) => {
    setEditingColorId(color.id)
    setEditColorState({ ...color })
  }
  // Handle cancel edit
  const handleCancelColor = () => {
    setEditingColorId(null)
    setEditColorState(null)
  }
  // Handle change in edit fields
  const handleEditColorChange = (field: keyof Omit<ColorItem,'id'>, value: string | number) => {
    if (!editColorState) return
    setEditColorState({ ...editColorState, [field]: value })
  }
  // Handle save edited color (TODO: implement API update)
  const handleSaveColor = async (id: string) => {
    // TODO: Call updateMaterials API to save edited color across materials
    console.log('Saving color', editColorState)
    // After successful save:
    setEditingColorId(null)
    setEditColorState(null)
    loadData()
  }

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
            special_filaments: specialFilaments, // Preserve special filaments
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
        special_filaments: specialFilaments, // Preserve special filaments
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
        special_filaments: specialFilaments, // Preserve special filaments
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

  // --- Special Filament Management ---

  const handleNewSpecialFilamentChange = (field: keyof Omit<SpecialFilamentItem, 'id'>, value: string | number) => {
    setNewSpecialFilament({ ...newSpecialFilament, [field]: value })
  }

  const handleAddSpecialFilament = async () => {
    setError(null);
    setSuccess(null);
    if (!newSpecialFilament.name) {
        setError("Special Filament Name is required.");
        return;
    }

    setIsLoading(true);
    try {
        const currentData = await getMaterials();
        if (!currentData) {
            throw new Error("Failed to fetch current data from backend.");
        }

        const id = newSpecialFilament.name.toLowerCase().replace(/\s+/g, "-") + '_' + uuidv4().substring(0, 4);
        const currentSpecialFilaments = currentData.special_filaments || [];

        // Check if ID already exists
        const idExists = currentSpecialFilaments.some(sf => sf.id === id);
        if (idExists) {
            throw new Error(`Special Filament with ID ${id} already exists. Please choose a different name.`);
        }

        const newFilament: SpecialFilamentItem = {
            id,
            name: newSpecialFilament.name,
            description: newSpecialFilament.description || "",
            previewImg: newSpecialFilament.previewImg || "/customTextures/placeHolder.svg",
            priceModifier: Number(newSpecialFilament.priceModifier) || 0
        };

        const updatedSpecialFilaments = [...currentSpecialFilaments, newFilament];

        const payload: MaterialsResponse = {
            ...currentData,
            materials: currentData.materials || [], // Preserve existing materials
            special_filaments: updatedSpecialFilaments
        };

        const result = await updateMaterials(payload);

        if (result.success) {
            setSuccess("Special Filament added successfully!");
            setNewSpecialFilament({ name: "", description: "", previewImg: "/customTextures/placeHolder.svg", priceModifier: 0 });
            loadData(); // Re-fetch data
        } else {
            throw new Error(result.message || "Failed to add Special Filament.");
        }
    } catch (error: any) {
        console.error("Error adding Special Filament:", error);
        setError(`Failed to add Special Filament: ${error.message}`);
        setIsLoading(false);
    }
  }

  const handleEditSpecialFilament = (id: string) => {
    const filamentToEdit = specialFilaments.find(f => f.id === id);
    if (filamentToEdit) {
        setEditSpecialFilamentState({ ...filamentToEdit });
        setEditingSpecialFilamentId(id);
    }
  }

  const handleEditSpecialFilamentChange = (field: keyof SpecialFilamentItem, value: string | number) => {
     setEditSpecialFilamentState(prev => prev ? { ...prev, [field]: value } : null);
  }

  const handleSaveSpecialFilament = async (id: string) => {
    if (!editSpecialFilamentState) return;
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
        const currentData = await getMaterials();
        if (!currentData) {
            throw new Error("Failed to fetch current data from backend.");
        }

        const updatedSpecialFilaments = (currentData.special_filaments || []).map(sf => {
            if (sf.id === id) {
                // Return the edited state, ensuring all fields are present
                return {
                    id: editSpecialFilamentState.id,
                    name: editSpecialFilamentState.name,
                    description: editSpecialFilamentState.description,
                    previewImg: editSpecialFilamentState.previewImg,
                    priceModifier: Number(editSpecialFilamentState.priceModifier) || 0
                };
            }
            return sf;
        });

        const payload: MaterialsResponse = {
            ...currentData,
            materials: currentData.materials || [], // Preserve existing materials
            special_filaments: updatedSpecialFilaments
        };

        const result = await updateMaterials(payload);

        if (result.success) {
            setSuccess("Special Filament updated successfully!");
            setEditingSpecialFilamentId(null);
            setEditSpecialFilamentState(null);
            loadData(); // Re-fetch data
        } else {
            throw new Error(result.message || "Failed to update Special Filament.");
        }
    } catch (error: any) {
        console.error("Error updating Special Filament:", error);
        setError(`Failed to update Special Filament: ${error.message}`);
        setIsLoading(false);
    }
  }

  const handleCancelSpecialFilament = () => {
    setEditingSpecialFilamentId(null);
    setEditSpecialFilamentState(null);
  }

  const handleDeleteSpecialFilament = async (id: string) => {
     const filamentToDelete = specialFilaments.find(f=>f.id===id);
     if (!filamentToDelete) return;
     if (!confirm(`Are you sure you want to delete the special filament "${filamentToDelete.name}"?`)) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
        const currentData = await getMaterials();
        if (!currentData) {
            throw new Error("Failed to fetch current data from backend.");
        }

        const updatedSpecialFilaments = (currentData.special_filaments || []).filter(sf => sf.id !== id);

        const payload: MaterialsResponse = {
            ...currentData,
            materials: currentData.materials || [], // Preserve existing materials
            special_filaments: updatedSpecialFilaments
        };

        const result = await updateMaterials(payload);

        if (result.success) {
            setSuccess(`Special Filament "${filamentToDelete.name}" deleted successfully!`);
            loadData(); // Re-fetch data
        } else {
            throw new Error(result.message || "Failed to delete Special Filament.");
        }
    } catch (error: any) {
        console.error("Error deleting Special Filament:", error);
        setError(`Failed to delete Special Filament: ${error.message}`);
        setIsLoading(false);
    }
  }


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filaments Manager</CardTitle>
        <CardDescription>Manage filament colors, special filaments, and material types</CardDescription>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="special">Special Filaments</TabsTrigger> {/* Moved Special Filaments before Materials */}
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
                                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allColors.length > 0 ? allColors.map((color) => (
                                    <TableRow key={color.id}>
                                        <TableCell>
                                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                                        </TableCell>
                                        <TableCell>
                                       {editingColorId === color.id && editColorState ? (
                                         <Input value={editColorState.name} onChange={(e) => handleEditColorChange('name', e.target.value)} />
                                       ) : (
                                          color.name
                                       )}
                                    </TableCell>
                                    <TableCell>
                                       {editingColorId === color.id && editColorState ? (
                                         <Input type="text" value={editColorState.hex} onChange={(e) => handleEditColorChange('hex', e.target.value)} />
                                       ) : (
                                          color.hex
                                       )}
                                    </TableCell>
                                    <TableCell>
                                       {editingColorId === color.id && editColorState ? (
                                         <Input type="number" value={editColorState.addon_price} onChange={(e) => handleEditColorChange('addon_price', Number(e.target.value))} />
                                       ) : (
                                          `$${color.addon_price.toFixed(2)}`
                                       )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       {editingColorId === color.id ? (
                                         <div className="flex justify-end gap-1">
                                           <Button variant="ghost" size="icon" onClick={() => handleSaveColor(color.id)}>
                                             <Save className="h-4 w-4" />
                                           </Button>
                                           <Button variant="ghost" size="icon" onClick={handleCancelColor}>
                                             <X className="h-4 w-4" />
                                           </Button>
                                         </div>
                                       ) : (
                                         <div className="flex justify-end gap-1">
                                           <Button variant="ghost" size="icon" onClick={() => handleEditColor(color)}>
                                             <Edit className="h-4 w-4" />
                                           </Button>
                                           <Button variant="ghost" size="icon" onClick={() => deleteColor(color.id)} disabled={isLoading || !!editingSpecialFilamentId}>
                                             <Trash2 className="h-4 w-4 text-red-500" />
                                           </Button>
                                         </div>
                                       )}
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

          {/* Special Filaments Tab - Moved */}
          <TabsContent value="special" className="mt-4">
            <div className="space-y-6">
              {/* Add New Special Filament Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Special Filament</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-sf-name">Filament Name *</Label>
                        <Input
                          id="new-sf-name"
                          value={newSpecialFilament.name}
                          onChange={(e) => handleNewSpecialFilamentChange("name", e.target.value)}
                          placeholder="e.g. Rainbow PLA"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-sf-price">Price Modifier ($)</Label>
                        <Input
                          id="new-sf-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newSpecialFilament.priceModifier}
                          onChange={(e) => handleNewSpecialFilamentChange("priceModifier", Number.parseFloat(e.target.value))}
                          placeholder="0.00"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-sf-desc">Description</Label>
                      <Input // Using Input, change to Textarea if preferred
                        id="new-sf-desc"
                        value={newSpecialFilament.description}
                        onChange={(e) => handleNewSpecialFilamentChange("description", e.target.value)}
                        placeholder="Describe the filament (e.g., color changing, glitter)"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-sf-preview">Preview Image Path</Label>
                      <Input
                        id="new-sf-preview"
                        value={newSpecialFilament.previewImg}
                        onChange={(e) => handleNewSpecialFilamentChange("previewImg", e.target.value)}
                        placeholder="/customTextures/your-texture.svg"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">Path relative to the public folder (e.g., /customTextures/rainbow.svg).</p>
                    </div>
                    <Button onClick={handleAddSpecialFilament} disabled={isLoading} className="w-full md:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> Add Special Filament
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Existing Special Filaments Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Existing Special Filaments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Preview</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price Mod.</TableHead>
                          <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specialFilaments.length > 0 ? specialFilaments.map((filament) => (
                          <TableRow key={filament.id}>
                            <TableCell>
                              {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                                <Input value={editSpecialFilamentState.previewImg} onChange={(e) => handleEditSpecialFilamentChange("previewImg", e.target.value)} placeholder="/img.svg" className="text-xs"/>
                              ) : (
                                <img src={filament.previewImg || '/customTextures/placeHolder.svg'} alt={filament.name} className="w-12 h-12 object-cover rounded border bg-gray-100" onError={(e) => (e.currentTarget.src = "/customTextures/placeHolder.svg")}/>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                                <Input value={editSpecialFilamentState.name} onChange={(e) => handleEditSpecialFilamentChange("name", e.target.value)} />
                              ) : (
                                filament.name
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                                <Input value={editSpecialFilamentState.description} onChange={(e) => handleEditSpecialFilamentChange("description", e.target.value)} />
                              ) : (
                                <p className="text-sm text-muted-foreground line-clamp-2">{filament.description}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editSpecialFilamentState.priceModifier}
                                  onChange={(e) => handleEditSpecialFilamentChange("priceModifier", Number.parseFloat(e.target.value))}
                                />
                              ) : (
                                `$${filament.priceModifier.toFixed(2)}`
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingSpecialFilamentId === filament.id ? (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleSaveSpecialFilament(filament.id)} disabled={isLoading}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={handleCancelSpecialFilament} disabled={isLoading}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditSpecialFilament(filament.id)} disabled={isLoading || !!editingSpecialFilamentId}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSpecialFilament(filament.id)} disabled={isLoading || !!editingSpecialFilamentId}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No special filaments found. Add your first one above.
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

          {/* Materials Tab - Moved */}
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
                                                            disabled={isLoading || !!editingSpecialFilamentId} // Add disabled state
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
                                            <Button variant="ghost" size="icon" onClick={() => deleteMaterial(material.id)} disabled={isLoading || !!editingSpecialFilamentId}>
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
