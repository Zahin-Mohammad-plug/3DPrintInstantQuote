"use client"
// Deprecated: This component is now integrated into the Admin-filaments-manager component.

import { useState, useEffect } from "react"
import { getMaterials, updateMaterials, MaterialsResponse, SpecialFilament } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash, Edit, Save, X, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Added Tabs
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Added Card components

interface MaterialItem {
  id: string
  name: string
  description: string
  priceModifier: number
  availableColors: string[] // hex codes
  base_cost_per_gram?: number
  hourly_rate?: number
  properties?: string[]
}

interface BackendColorItem {
  id: string
  name: string
  hex: string
  addon_price: number
}

// Added QualityLevel interface (moved from AdminPricingManager)
interface QualityLevel {
  id: string
  name: string
  layerHeight: string
  description: string
  priceModifier: number
}

export function AdminMaterialManager() {
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [allColors, setAllColors] = useState<BackendColorItem[]>([])
  const [specialFilaments, setSpecialFilaments] = useState<SpecialFilament[]>([]) // Add state for special filaments
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newMaterial, setNewMaterial] = useState<Partial<MaterialItem>>({
    name: "",
    description: "",
    priceModifier: 0,
    availableColors: [],
  })
  const [activeTab, setActiveTab] = useState("materials"); // State for the new tabs

  // Added Quality Level state (moved from AdminPricingManager)
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
  const [newQualityLevel, setNewQualityLevel] = useState<QualityLevel>({
    id: "",
    name: "",
    layerHeight: "",
    description: "",
    priceModifier: 0,
  })

  const loadData = async () => {
    try {
      const data = await getMaterials();
      if (data) { // Check if data is not null/undefined
        // Process materials (existing logic)
        if (data.materials) {
          const mappedMaterials = data.materials.map((material: any) => ({
            id: material.id,
            name: material.name,
            description: material.description || "",
            priceModifier: material.priceModifier || 0,
            availableColors: material.colors ? material.colors.map((color: any) => color.hex) : [],
            base_cost_per_gram: material.base_cost_per_gram,
            hourly_rate: material.hourly_rate,
            properties: material.properties,
          }));
          setMaterials(mappedMaterials);

          const uniqueColors = new Map<string, BackendColorItem>();
          data.materials.forEach((material: any) => {
            if (material.colors) {
              material.colors.forEach((color: any) => {
                if (!uniqueColors.has(color.id)) {
                  uniqueColors.set(color.id, {
                    id: color.id,
                    name: color.name,
                    hex: color.hex,
                    addon_price: color.addon_price || 0
                  });
                }
              });
            }
          });
          setAllColors(Array.from(uniqueColors.values()));
        } else {
           setMaterials([]); // Handle case where materials array might be missing
           setAllColors([]);
        }

        // Process special filaments
        if (data.special_filaments) {
          setSpecialFilaments(data.special_filaments);
        } else {
          setSpecialFilaments([]); // Handle case where special_filaments might be missing
        }

        // Added: Process quality levels
        if (data.global_settings && data.global_settings.quality_levels) {
          // Map backend format (layer_height) to frontend format (layerHeight)
          const mappedQualityLevels = data.global_settings.quality_levels.map((level: any) => ({
            id: level.id,
            name: level.name,
            layerHeight: level.layer_height || "", // Handle potential missing field
            description: level.description || "", // Handle potential missing field
            priceModifier: level.price_modifier || 0 // Handle potential missing field
          }));
          setQualityLevels(mappedQualityLevels);
        } else {
          // Provide default quality levels if none are loaded
          setQualityLevels([
            { id: "draft", name: "Draft", layerHeight: "0.3mm", description: "Faster printing...", priceModifier: -5 },
            { id: "standard", name: "Standard", layerHeight: "0.2mm", description: "Balanced quality...", priceModifier: 0 },
            { id: "high", name: "High Quality", layerHeight: "0.12mm", description: "Finer details...", priceModifier: 10 },
            { id: "ultra", name: "Ultra Fine", layerHeight: "0.08mm", description: "Maximum detail...", priceModifier: 15 },
          ]);
        }

      } else {
         // Handle case where data itself is null/undefined
         setMaterials([]);
         setAllColors([]);
         setSpecialFilaments([]);
         setQualityLevels([]); // Clear quality levels too
         alert("Failed to load any data from the backend.");
      }
    } catch (error) {
      console.error("Error loading materials/colors/filaments/quality:", error);
      alert("Failed to load data from the backend.");
       // Optionally clear state on error too
       setMaterials([]);
       setAllColors([]);
       setSpecialFilaments([]);
       setQualityLevels([]); // Clear quality levels on error
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (id: string) => {
    setEditingId(id)
    setExpandedId(id)
  }

  const handleSave = async (id: string) => {
    try {
      const currentData = await getMaterials();
      if (!currentData) { // Check for null/undefined data
        alert("Failed to fetch current data from backend.");
        return;
      }
      // Ensure materials array exists, default to empty if not
      const currentMaterials = currentData.materials || [];

      const editedMaterialState = materials.find(m => m.id === id);
      if (!editedMaterialState) {
        alert("Could not find the material being edited in local state.");
        return;
      }

      const updatedMaterialsBackend = currentMaterials.map((material: any) => {
        if (material.id === id) {
          const updatedMaterialColors = allColors
            .filter(color => editedMaterialState.availableColors.includes(color.hex))
            .map(color => ({
              id: color.id,
              name: color.name,
              hex: color.hex,
              addon_price: color.addon_price
            }));

          return {
            ...material,
            name: editedMaterialState.name,
            description: editedMaterialState.description,
            priceModifier: editedMaterialState.priceModifier,
            colors: updatedMaterialColors
          };
        }
        return material;
      });

      // Construct the full payload, ensuring special_filaments and global_settings are included
      const payload: MaterialsResponse = {
        ...currentData, // Includes global_settings
        materials: updatedMaterialsBackend,
        special_filaments: specialFilaments // Include current special filaments state
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        alert("Material updated successfully!");
        setEditingId(null);
        loadData(); // Refresh data after successful save
      } else {
        alert(`Failed to update material: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Failed to update material. Please try again.");
    }
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    try {
      const currentData = await getMaterials();
      if (!currentData) { // Check for null/undefined data
        alert("Failed to fetch current data from backend.");
        return;
      }
       // Ensure materials array exists, default to empty if not
      const currentMaterials = currentData.materials || [];

      const updatedMaterialsBackend = currentMaterials.filter((material: any) => material.id !== id);

      // Construct the full payload
      const payload: MaterialsResponse = {
        ...currentData, // Includes global_settings
        materials: updatedMaterialsBackend,
        special_filaments: specialFilaments, // Include current special filaments state
        // Ensure global_settings and quality_levels are preserved
        global_settings: {
          ...currentData.global_settings,
          quality_levels: qualityLevels.map(level => ({
            id: level.id,
            name: level.name,
            layer_height: level.layerHeight,
            description: level.description,
            price_modifier: level.priceModifier
          }))
        }
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        // Update local state *after* successful API call
        setMaterials(materials.filter((material) => material.id !== id));
        alert("Material deleted successfully!");
        loadData(); // Refresh data after successful delete
      } else {
        alert(`Failed to delete material: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material. Please try again.");
    }
  }

  const handleChange = (id: string, field: keyof MaterialItem, value: string | number | string[]) => {
    setMaterials(
      materials.map((material) => {
        if (material.id === id) {
          return { ...material, [field]: value }
        }
        return material
      }),
    )
  }

  const handleNewMaterialChange = (field: keyof Omit<MaterialItem, 'id'>, value: string | number | string[]) => {
    setNewMaterial({ ...newMaterial, [field]: value })
  }

  const handleAddMaterial = async () => {
    if (!newMaterial.name) return

    try {
      const id = newMaterial.name.split("(")[0].trim().toUpperCase().replace(/\s+/g, '_');

      const currentData = await getMaterials();
      if (!currentData) { // Check for null/undefined data
        alert("Failed to fetch current data from backend.");
        return;
      }
      // Ensure materials array exists, default to empty if not
      const currentMaterials = currentData.materials || [];

      if (currentMaterials.some((m: any) => m.id === id)) {
        alert(`Material with ID ${id} already exists. Please choose a different name.`);
        return;
      }

      const newMaterialBackend = {
        id,
        name: newMaterial.name,
        description: newMaterial.description || "",
        priceModifier: newMaterial.priceModifier || 0,
        base_cost_per_gram: 0.05,
        hourly_rate: 2.0,
        properties: ["New material"],
        colors: allColors
          .filter(color => (newMaterial.availableColors || []).includes(color.hex))
          .map(color => ({
            id: color.id,
            name: color.name,
            hex: color.hex,
            addon_price: color.addon_price
          }))
      };

      const updatedMaterialsBackend = [
        ...currentMaterials,
        newMaterialBackend
      ];

      // Construct the full payload
      const payload: MaterialsResponse = {
        ...currentData, // Includes global_settings
        materials: updatedMaterialsBackend,
        special_filaments: specialFilaments, // Include current special filaments state
        // Ensure global_settings and quality_levels are preserved
        global_settings: {
          ...currentData.global_settings,
          quality_levels: qualityLevels.map(level => ({
            id: level.id,
            name: level.name,
            layer_height: level.layerHeight,
            description: level.description,
            price_modifier: level.priceModifier
          }))
        }
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        const newMaterialState: MaterialItem = {
          id: newMaterialBackend.id,
          name: newMaterialBackend.name,
          description: newMaterialBackend.description,
          priceModifier: newMaterialBackend.priceModifier,
          availableColors: newMaterialBackend.colors.map(c => c.hex),
          base_cost_per_gram: newMaterialBackend.base_cost_per_gram,
          hourly_rate: newMaterialBackend.hourly_rate,
          properties: newMaterialBackend.properties,
        };
        setMaterials([...materials, newMaterialState]);
        setNewMaterial({ name: "", description: "", priceModifier: 0, availableColors: [] });
        alert("Material added successfully!");
        loadData(); // Refresh data after successful add
      } else {
        alert(`Failed to add material: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Failed to add material. Please try again.");
    }
  }

  const toggleColorForMaterial = (materialId: string, colorHex: string) => {
    setMaterials(
      materials.map((material) => {
        if (material.id === materialId) {
          const availableColors = [...material.availableColors]
          if (availableColors.includes(colorHex)) {
            return {
              ...material,
              availableColors: availableColors.filter((c) => c !== colorHex),
            }
          } else {
            return {
              ...material,
              availableColors: [...availableColors, colorHex],
            }
          }
        }
        return material
      }),
    )
  }

  const toggleColorForNewMaterial = (colorHex: string) => {
    const availableColors = newMaterial.availableColors || []
    if (availableColors.includes(colorHex)) {
      handleNewMaterialChange(
        "availableColors",
        availableColors.filter((c) => c !== colorHex),
      )
    } else {
      handleNewMaterialChange("availableColors", [...availableColors, colorHex])
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Added Quality Level handlers (moved from AdminPricingManager)
  const handleQualityChange = (index: number, field: keyof QualityLevel, value: string | number) => {
    const updatedLevels = [...qualityLevels]
    updatedLevels[index] = { ...updatedLevels[index], [field]: value }
    setQualityLevels(updatedLevels)
  }

  const handleNewQualityChange = (field: keyof QualityLevel, value: string | number) => {
    setNewQualityLevel({ ...newQualityLevel, [field]: value })
  }

  const handleAddQualityLevel = () => {
    if (!newQualityLevel.name || !newQualityLevel.id) return

    setQualityLevels([...qualityLevels, newQualityLevel])
    setNewQualityLevel({
      id: "",
      name: "",
      layerHeight: "",
      description: "",
      priceModifier: 0,
    })
    // Note: Saving happens via the main Save button
  }

  const handleDeleteQualityLevel = (index: number) => {
    const updatedLevels = [...qualityLevels]
    updatedLevels.splice(index, 1)
    setQualityLevels(updatedLevels)
    // Note: Saving happens via the main Save button
  }

  // Combined Save Function for Materials, Special Filaments, and Quality Levels
  const handleSaveAll = async () => {
    try {
      const currentData = await getMaterials();
      if (!currentData) {
        alert("Failed to fetch current data from backend. Cannot save.");
        return;
      }

      // Prepare updated materials data (handling edits)
      const updatedMaterialsBackend = (currentData.materials || []).map((backendMaterial: any) => {
        const editedMaterialState = materials.find(m => m.id === backendMaterial.id);
        if (editedMaterialState) {
          // If the material exists in our current state (might have been edited)
          const updatedMaterialColors = allColors
            .filter(color => editedMaterialState.availableColors.includes(color.hex))
            .map(color => ({
              id: color.id,
              name: color.name,
              hex: color.hex,
              addon_price: color.addon_price
            }));
          return {
            ...backendMaterial, // Keep original fields not edited in UI
            name: editedMaterialState.name,
            description: editedMaterialState.description,
            priceModifier: editedMaterialState.priceModifier,
            colors: updatedMaterialColors,
            // Include other fields from state if they are editable
            base_cost_per_gram: editedMaterialState.base_cost_per_gram,
            hourly_rate: editedMaterialState.hourly_rate,
            properties: editedMaterialState.properties,
          };
        }
        return backendMaterial; // Return original if not found in current state (shouldn't happen)
      });

      // Add any newly created materials (that are not yet in currentData.materials)
      materials.forEach(stateMaterial => {
        if (!updatedMaterialsBackend.some(m => m.id === stateMaterial.id)) {
           const newMaterialBackend = {
            id: stateMaterial.id,
            name: stateMaterial.name,
            description: stateMaterial.description,
            priceModifier: stateMaterial.priceModifier,
            base_cost_per_gram: stateMaterial.base_cost_per_gram || 0.05, // Default if needed
            hourly_rate: stateMaterial.hourly_rate || 2.0, // Default if needed
            properties: stateMaterial.properties || [], // Default if needed
            colors: allColors
              .filter(color => stateMaterial.availableColors.includes(color.hex))
              .map(color => ({
                id: color.id,
                name: color.name,
                hex: color.hex,
                addon_price: color.addon_price
              }))
          };
          updatedMaterialsBackend.push(newMaterialBackend);
        }
      });

      // Construct the full payload
      const payload: MaterialsResponse = {
        ...currentData, // Start with existing data (includes other global settings)
        materials: updatedMaterialsBackend,
        special_filaments: specialFilaments, // Use current state for special filaments
        global_settings: {
          ...currentData.global_settings, // Preserve other global settings
          // Update quality levels from state
          quality_levels: qualityLevels.map(level => ({
            id: level.id,
            name: level.name,
            layer_height: level.layerHeight,
            description: level.description,
            price_modifier: level.priceModifier
          }))
        }
      };

      const result = await updateMaterials(payload);

      if (result.success) {
        alert("Materials and quality settings saved successfully!");
        setEditingId(null); // Exit edit mode if any
        loadData(); // Refresh data to confirm changes
      } else {
        alert(`Failed to save data: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving materials/quality settings:", error);
      alert("Failed to save data. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Added Tabs for Materials and Quality Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="quality">Quality Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6 mt-6">
          {/* Existing Material Management UI */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Material</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* ... existing new material form fields ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-material-name">Material Name</Label>
                      <Input
                        id="new-material-name"
                        value={newMaterial.name}
                        onChange={(e) => handleNewMaterialChange("name", e.target.value)}
                        placeholder="e.g. TPU (Flexible)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-material-price">Price Modifier ($)</Label>
                      <Input
                        id="new-material-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newMaterial.priceModifier}
                        onChange={(e) => handleNewMaterialChange("priceModifier", Number.parseFloat(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-material-desc">Description</Label>
                    <Textarea
                      id="new-material-desc"
                      value={newMaterial.description}
                      onChange={(e) => handleNewMaterialChange("description", e.target.value)}
                      placeholder="Describe the material properties and use cases"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Available Colors</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {allColors.map((color) => (
                        <div key={color.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`new-color-${color.id}`}
                            checked={(newMaterial.availableColors || []).includes(color.hex)}
                            onCheckedChange={() => toggleColorForNewMaterial(color.hex)}
                          />
                          <Label htmlFor={`new-color-${color.id}`} className="flex items-center gap-2 cursor-pointer">
                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex }} />
                            <span>{color.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                <Button onClick={handleAddMaterial} className="flex gap-2 items-center w-full md:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Material
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Price Modifier</TableHead>
                      <TableHead>Available Colors</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <Collapsible
                        key={material.id}
                        open={expandedId === material.id}
                        onOpenChange={() => toggleExpand(material.id)}
                        asChild // Render TableRow directly inside Collapsible
                      >
                        <>
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">{material.name}</div>
                            </TableCell>
                            <TableCell>${material.priceModifier?.toFixed(2) ?? '0.00'}</TableCell> {/* Added nullish coalescing */}
                            <TableCell>
                              <div className="flex gap-1">
                                {material.availableColors.slice(0, 5).map((colorHex) => (
                                  <div
                                    key={colorHex}
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: colorHex }}
                                  />
                                ))}
                                {material.availableColors.length > 5 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{material.availableColors.length - 5} more
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <CollapsibleTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    {expandedId === material.id ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(material.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(material.id)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent asChild>
                            {/* Use a div wrapper inside TableCell for proper layout */}
                            <tr>
                              <TableCell colSpan={4} className="p-0">
                                <div className="p-4 bg-muted/50">
                                  {editingId === material.id ? (
                                    <div className="space-y-4">
                                      {/* ... existing material edit form fields ... */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-name-${material.id}`}>Material Name</Label>
                                          <Input
                                            id={`edit-name-${material.id}`}
                                            value={material.name}
                                            onChange={(e) => handleChange(material.id, "name", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-price-${material.id}`}>Price Modifier ($)</Label>
                                          <Input
                                            id={`edit-price-${material.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={material.priceModifier}
                                            onChange={(e) =>
                                              handleChange(material.id, "priceModifier", Number.parseFloat(e.target.value))
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-desc-${material.id}`}>Description</Label>
                                        <Textarea
                                          id={`edit-desc-${material.id}`}
                                          value={material.description}
                                          onChange={(e) => handleChange(material.id, "description", e.target.value)}
                                          rows={2}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Available Colors</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                          {allColors.map((color) => (
                                            <div key={color.id} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`edit-color-${material.id}-${color.id}`}
                                                checked={material.availableColors.includes(color.hex)}
                                                onCheckedChange={() => toggleColorForMaterial(material.id, color.hex)}
                                              />
                                              <Label
                                                htmlFor={`edit-color-${material.id}-${color.id}`}
                                                className="flex items-center gap-2 cursor-pointer"
                                              >
                                                <div
                                                  className="w-4 h-4 rounded-full border"
                                                  style={{ backgroundColor: color.hex }}
                                                />
                                                <span>{color.name}</span>
                                              </Label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        {/* Save button now calls handleSaveAll */}
                                        <Button size="sm" onClick={handleSaveAll}>
                                          <Save className="h-4 w-4 mr-2" />
                                          Save Changes
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancel}>
                                          <X className="h-4 w-4 mr-2" />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm mb-2">{material.description}</p>
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Available Colors:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                          {material.availableColors.map((colorHex) => {
                                            const colorInfo = allColors.find((c) => c.hex === colorHex)
                                            return (
                                              <div key={colorHex} className="flex items-center gap-2">
                                                <div
                                                  className="w-4 h-4 rounded-full border"
                                                  style={{ backgroundColor: colorHex }}
                                                />
                                                <span className="text-sm">{colorInfo?.name || colorHex}</span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </tr>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6 mt-6">
          {/* Added Quality Settings UI (moved from AdminPricingManager) */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Settings</CardTitle>
              <CardDescription>Configure print quality levels and their price modifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Layer Height</TableHead>
                      <TableHead>Description</TableHead> {/* Added Description Column */}
                      <TableHead>Price Modifier</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualityLevels.map((level, index) => (
                      <TableRow key={level.id}>
                        <TableCell>
                          <Input
                            value={level.id}
                            onChange={(e) => handleQualityChange(index, "id", e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={level.name}
                            onChange={(e) => handleQualityChange(index, "name", e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={level.layerHeight}
                            onChange={(e) => handleQualityChange(index, "layerHeight", e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell> {/* Added Description Cell */}
                          <Input
                            value={level.description}
                            onChange={(e) => handleQualityChange(index, "description", e.target.value)}
                            className="w-full"
                            placeholder="Brief description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={level.priceModifier}
                            onChange={(e) => handleQualityChange(index, "priceModifier", Number(e.target.value))}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQualityLevel(index)}
                            disabled={qualityLevels.length <= 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="text-sm font-medium">Add New Quality Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-quality-id">ID</Label>
                      <Input
                        id="new-quality-id"
                        value={newQualityLevel.id}
                        onChange={(e) => handleNewQualityChange("id", e.target.value)}
                        placeholder="e.g. super-fine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-quality-name">Name</Label>
                      <Input
                        id="new-quality-name"
                        value={newQualityLevel.name}
                        onChange={(e) => handleNewQualityChange("name", e.target.value)}
                        placeholder="e.g. Super Fine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-quality-layer">Layer Height</Label>
                      <Input
                        id="new-quality-layer"
                        value={newQualityLevel.layerHeight}
                        onChange={(e) => handleNewQualityChange("layerHeight", e.target.value)}
                        placeholder="e.g. 0.05mm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-quality-price">Price Modifier ($)</Label>
                      <Input
                        id="new-quality-price"
                        type="number"
                        value={newQualityLevel.priceModifier}
                        onChange={(e) => handleNewQualityChange("priceModifier", Number(e.target.value))}
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-quality-desc">Description</Label>
                    <Input
                      id="new-quality-desc"
                      value={newQualityLevel.description}
                      onChange={(e) => handleNewQualityChange("description", e.target.value)}
                      placeholder="Describe this quality level"
                    />
                  </div>
                  <Button onClick={handleAddQualityLevel}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quality Level
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Combined Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveAll} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          Save All Material & Quality Settings
        </Button>
      </div>
    </div>
  )
}
