// admin-color-manager.tsx
// Deprecated: This component is now integrated into the Admin-filaments-manager component.
"use client"

import { useState, useEffect } from "react"
import { getMaterials, updateMaterials, MaterialsResponse, SpecialFilament } from "@/services/api" // Import interfaces
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash, Edit, Save, X, Palette, Sparkles, Loader2 } from "lucide-react" // Added icons
import { Textarea } from "@/components/ui/textarea" // Added Textarea
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group" // Added ToggleGroup
import { Alert, AlertDescription } from "@/components/ui/alert" // Added Alert

// Interface for standard color state
interface ColorItem {
  id: string
  name: string
  hex: string
  priceModifier: number // Corresponds to addon_price in backend
}

// Interface for special filament state (maps directly to backend SpecialFilament)
interface SpecialFilamentItem extends SpecialFilament {}

type ViewMode = "colors" | "specialFilaments"

export function AdminColorManager() {
  // State for standard colors
  const [colors, setColors] = useState<ColorItem[]>([])
  const [editingColorId, setEditingColorId] = useState<string | null>(null)
  const [newColor, setNewColor] = useState<Partial<ColorItem>>({
    name: "",
    hex: "#000000",
    priceModifier: 0,
  })
  const [editColorState, setEditColorState] = useState<ColorItem | null>(null); // State for editing standard color

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
  const [viewMode, setViewMode] = useState<ViewMode>("colors")
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load all data (colors and special filaments)
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMaterials();

      // Process standard colors
      if (data && data.materials && data.materials.length > 0) {
        const uniqueColors = new Map<string, ColorItem>();
        data.materials.forEach((material: any) => {
          if (material.colors) {
            material.colors.forEach((color: any) => {
              if (!uniqueColors.has(color.id)) {
                uniqueColors.set(color.id, {
                  id: color.id,
                  name: color.name,
                  hex: color.hex,
                  priceModifier: color.addon_price || 0
                });
              }
            });
          }
        });
        setColors(Array.from(uniqueColors.values()));
      } else {
        setColors([]);
      }

      // Process special filaments
      if (data && data.special_filaments) {
         // Map directly as the structure matches SpecialFilamentItem
         setSpecialFilaments(data.special_filaments.map(sf => ({...sf})));
      } else {
        setSpecialFilaments([]);
      }

    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Failed to load data from the backend.");
    } finally {
        setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // --- Standard Color Handlers ---

  const handleEditColor = (id: string) => {
    const colorToEdit = colors.find(c => c.id === id);
    if (colorToEdit) {
        setEditColorState({ ...colorToEdit });
        setEditingColorId(id);
    }
  }

  const handleSaveColor = async (id: string) => {
     if (!editColorState) return;
    try {
      const currentData = await getMaterials();
      if (!currentData) { // Check if currentData itself is null/undefined
          alert("Failed to fetch current materials data from backend.");
          return;
      }

      // Ensure materials array exists, even if empty
      const materials = currentData.materials || [];
      const special_filaments = currentData.special_filaments || []; // Preserve existing special filaments

      const updatedMaterials = materials.map((material: any) => {
        // Ensure colors array exists for the material
        const materialColors = material.colors || [];
        const updatedColors = materialColors.map((color: any) => {
          if (color.id === id) {
            return {
              ...color,
              name: editColorState.name,
              hex: editColorState.hex,
              addon_price: editColorState.priceModifier // Map priceModifier back to addon_price
            };
          }
          return color;
        });
        return {
          ...material,
          colors: updatedColors
        };
      });

      const result = await updateMaterials({
        ...currentData, // Includes global_settings
        materials: updatedMaterials,
        special_filaments: special_filaments // Send back the special filaments array
      });

      if (result.success) {
        alert("Color updated successfully!");
        setEditingColorId(null);
        setEditColorState(null);
        loadData(); // Re-fetch data
      } else {
        alert(`Failed to update color: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating color:", error);
      alert("Failed to update color. Please try again.");
    }
  }

  const handleCancelColor = () => {
    setEditingColorId(null);
    setEditColorState(null);
  }

  const handleDeleteColor = async (id: string) => {
    if (!confirm(`Are you sure you want to delete the color "${colors.find(c=>c.id===id)?.name}"? This will remove it from ALL materials.`)) return;
    try {
      const currentData = await getMaterials();
       if (!currentData) {
           alert("Failed to fetch current materials data from backend.");
           return;
       }
       const materials = currentData.materials || [];
       const special_filaments = currentData.special_filaments || [];

      const updatedMaterials = materials.map((material: any) => {
        const materialColors = material.colors || [];
        const updatedColors = materialColors.filter((color: any) => color.id !== id);
        return {
          ...material,
          colors: updatedColors
        };
      });

      const result = await updateMaterials({
        ...currentData,
        materials: updatedMaterials,
        special_filaments: special_filaments
      });

      if (result.success) {
        alert("Color deleted successfully!");
        loadData(); // Re-fetch data
      } else {
        alert(`Failed to delete color: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      alert("Failed to delete color. Please try again.");
    }
  }

  const handleEditColorChange = (field: keyof ColorItem, value: string | number) => {
    setEditColorState(prev => {
        if (!prev) return null;
        // Handle hex color input specifically
        if (field === 'hex' && typeof value === 'string' && !value.startsWith('#')) {
          value = `#${value}`;
        }
        return { ...prev, [field]: value };
    });
  }

  const handleNewColorChange = (field: keyof Omit<ColorItem, 'id'>, value: string | number) => {
    if (field === 'hex' && typeof value === 'string' && !value.startsWith('#')) {
      value = `#${value}`;
    }
    setNewColor({ ...newColor, [field]: value })
  }

  const handleAddColor = async () => {
    if (!newColor.name || !newColor.hex) return

    try {
      const id = newColor.name.toLowerCase().replace(/\s+/g, "-");

      const currentData = await getMaterials();
       if (!currentData) {
           alert("Failed to fetch current materials data from backend.");
           return;
       }
       const materials = currentData.materials || [];
       const special_filaments = currentData.special_filaments || [];

      // Check if color ID already exists in any material
      const colorExists = materials.some((material: any) =>
        (material.colors || []).some((color: any) => color.id === id)
      );
      if (colorExists) {
        alert(`Color with ID ${id} already exists. Please choose a different name.`);
        return;
      }

      // Add the new color to *every* material
      const updatedMaterials = materials.map((material: any) => {
        const materialColors = material.colors || [];
        const updatedColors = [
          ...materialColors,
          {
            id,
            name: newColor.name,
            hex: newColor.hex,
            addon_price: newColor.priceModifier || 0
          }
        ];
        return {
          ...material,
          colors: updatedColors
        };
      });

      const result = await updateMaterials({
        ...currentData,
        materials: updatedMaterials,
        special_filaments: special_filaments
      });

      if (result.success) {
        alert("Color added successfully to all materials!");
        setNewColor({ name: "", hex: "#000000", priceModifier: 0 });
        loadData(); // Re-fetch data
      } else {
        alert(`Failed to add color: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding color:", error);
      alert("Failed to add color. Please try again.");
    }
  }

  // --- Special Filament Handlers ---

  const handleEditSpecialFilament = (id: string) => {
    const filamentToEdit = specialFilaments.find(f => f.id === id);
    if (filamentToEdit) {
        setEditSpecialFilamentState({ ...filamentToEdit });
        setEditingSpecialFilamentId(id);
    }
  }

  const handleSaveSpecialFilament = async (id: string) => {
    if (!editSpecialFilamentState) return;
    try {
        const currentData = await getMaterials();
        if (!currentData) {
            alert("Failed to fetch current data from backend.");
            return;
        }
        const materials = currentData.materials || []; // Preserve materials
        const currentSpecialFilaments = currentData.special_filaments || [];

        const updatedSpecialFilaments = currentSpecialFilaments.map(sf => {
            if (sf.id === id) {
                // Return the edited state, ensuring all fields are present
                return {
                    id: editSpecialFilamentState.id,
                    name: editSpecialFilamentState.name,
                    description: editSpecialFilamentState.description,
                    previewImg: editSpecialFilamentState.previewImg,
                    priceModifier: editSpecialFilamentState.priceModifier
                };
            }
            return sf;
        });

        const result = await updateMaterials({
            ...currentData,
            materials: materials, // Send back original materials
            special_filaments: updatedSpecialFilaments // Send updated special filaments
        });

        if (result.success) {
            alert("Special Filament updated successfully!");
            setEditingSpecialFilamentId(null);
            setEditSpecialFilamentState(null);
            loadData(); // Re-fetch data
        } else {
            alert(`Failed to update Special Filament: ${result.message}`);
        }
    } catch (error) {
        console.error("Error updating Special Filament:", error);
        alert("Failed to update Special Filament. Please try again.");
    }
  }

  const handleCancelSpecialFilament = () => {
    setEditingSpecialFilamentId(null);
    setEditSpecialFilamentState(null);
  }

  const handleDeleteSpecialFilament = async (id: string) => {
     if (!confirm(`Are you sure you want to delete the special filament "${specialFilaments.find(f=>f.id===id)?.name}"?`)) return;
    try {
        const currentData = await getMaterials();
        if (!currentData) {
            alert("Failed to fetch current data from backend.");
            return;
        }
        const materials = currentData.materials || [];
        const currentSpecialFilaments = currentData.special_filaments || [];

        const updatedSpecialFilaments = currentSpecialFilaments.filter(sf => sf.id !== id);

        const result = await updateMaterials({
            ...currentData,
            materials: materials,
            special_filaments: updatedSpecialFilaments
        });

        if (result.success) {
            alert("Special Filament deleted successfully!");
            loadData(); // Re-fetch data
        } else {
            alert(`Failed to delete Special Filament: ${result.message}`);
        }
    } catch (error) {
        console.error("Error deleting Special Filament:", error);
        alert("Failed to delete Special Filament. Please try again.");
    }
  }

  const handleEditSpecialFilamentChange = (field: keyof SpecialFilamentItem, value: string | number) => {
     setEditSpecialFilamentState(prev => prev ? { ...prev, [field]: value } : null);
  }

  const handleNewSpecialFilamentChange = (field: keyof Omit<SpecialFilamentItem, 'id'>, value: string | number) => {
    setNewSpecialFilament({ ...newSpecialFilament, [field]: value })
  }

  const handleAddSpecialFilament = async () => {
    if (!newSpecialFilament.name) return;

    try {
        const id = newSpecialFilament.name.toLowerCase().replace(/\s+/g, "-");

        const currentData = await getMaterials();
        if (!currentData) {
            alert("Failed to fetch current data from backend.");
            return;
        }
        const materials = currentData.materials || [];
        const currentSpecialFilaments = currentData.special_filaments || [];

        // Check if ID already exists
        const idExists = currentSpecialFilaments.some(sf => sf.id === id);
        if (idExists) {
            alert(`Special Filament with ID ${id} already exists. Please choose a different name.`);
            return;
        }

        const newFilament: SpecialFilamentItem = {
            id,
            name: newSpecialFilament.name,
            description: newSpecialFilament.description || "",
            previewImg: newSpecialFilament.previewImg || "/customTextures/placeHolder.svg",
            priceModifier: newSpecialFilament.priceModifier || 0
        };

        const updatedSpecialFilaments = [...currentSpecialFilaments, newFilament];

        const result = await updateMaterials({
            ...currentData,
            materials: materials,
            special_filaments: updatedSpecialFilaments
        });

        if (result.success) {
            alert("Special Filament added successfully!");
            setNewSpecialFilament({ name: "", description: "", previewImg: "/customTextures/placeHolder.svg", priceModifier: 0 });
            loadData(); // Re-fetch data
        } else {
            alert(`Failed to add Special Filament: ${result.message}`);
        }
    } catch (error) {
        console.error("Error adding Special Filament:", error);
        alert("Failed to add Special Filament. Please try again.");
    }
  }


  // --- Render Logic ---

  if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
      return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }


  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value: ViewMode) => { if (value) setViewMode(value)}}
          className="mb-4"
        >
          <ToggleGroupItem value="colors" aria-label="Manage Standard Colors">
            <Palette className="h-4 w-4 mr-2" /> Standard Colors
          </ToggleGroupItem>
          <ToggleGroupItem value="specialFilaments" aria-label="Manage Special Filaments">
            <Sparkles className="h-4 w-4 mr-2" /> Special Filaments
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Conditional Rendering based on viewMode */}
      {viewMode === "colors" && (
        <>
          {/* Add New Standard Color Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add New Standard Color</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="new-color-name">Color Name</Label>
                <Input
                  id="new-color-name"
                  value={newColor.name}
                  onChange={(e) => handleNewColorChange("name", e.target.value)}
                  placeholder="e.g. Crimson Red"
                />
              </div>
              {/* Hex */}
              <div className="space-y-2">
                <Label htmlFor="new-color-hex">Color Hex</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="new-color-hex"
                    type="color"
                    value={newColor.hex}
                    onChange={(e) => handleNewColorChange("hex", e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={newColor.hex}
                    onChange={(e) => handleNewColorChange("hex", e.target.value)}
                    placeholder="#RRGGBB"
                    className="flex-1"
                  />
                </div>
              </div>
              {/* Price Modifier */}
              <div className="space-y-2">
                <Label htmlFor="new-color-price">Price Modifier ($)</Label>
                <Input
                  id="new-color-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newColor.priceModifier}
                  onChange={(e) => handleNewColorChange("priceModifier", Number.parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              {/* Add Button */}
              <Button onClick={handleAddColor} className="flex gap-2 items-center">
                <Plus className="h-4 w-4" />
                Add Color
              </Button>
            </div>
          </div>

          {/* Manage Standard Colors Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Manage Standard Colors</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Hex Code</TableHead>
                    <TableHead>Price Modifier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colors.map((color) => (
                    <TableRow key={color.id}>
                      {/* Color Swatch */}
                      <TableCell>
                        <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color.hex }} />
                      </TableCell>
                      {/* Name */}
                      <TableCell>
                        {editingColorId === color.id && editColorState ? (
                          <Input value={editColorState.name} onChange={(e) => handleEditColorChange("name", e.target.value)} />
                        ) : (
                          color.name
                        )}
                      </TableCell>
                      {/* Hex */}
                      <TableCell>
                        {editingColorId === color.id && editColorState ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={editColorState.hex}
                              onChange={(e) => handleEditColorChange("hex", e.target.value)}
                              className="w-12 h-9 p-1"
                            />
                            <Input value={editColorState.hex} onChange={(e) => handleEditColorChange("hex", e.target.value)} />
                          </div>
                        ) : (
                          color.hex
                        )}
                      </TableCell>
                      {/* Price Modifier */}
                      <TableCell>
                        {editingColorId === color.id && editColorState ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editColorState.priceModifier}
                            onChange={(e) => handleEditColorChange("priceModifier", Number.parseFloat(e.target.value))}
                          />
                        ) : (
                          `$${color.priceModifier.toFixed(2)}`
                        )}
                      </TableCell>
                      {/* Actions */}
                      <TableCell className="text-right">
                        {editingColorId === color.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleSaveColor(color.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelColor}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditColor(color.id)} disabled={!!editingColorId || !!editingSpecialFilamentId}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteColor(color.id)} disabled={!!editingColorId || !!editingSpecialFilamentId}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {colors.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No standard colors found.</p>}
          </div>
        </>
      )}

      {viewMode === "specialFilaments" && (
        <>
          {/* Add New Special Filament Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add New Special Filament</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Name */}
               <div className="space-y-2">
                 <Label htmlFor="new-sf-name">Filament Name</Label>
                 <Input
                   id="new-sf-name"
                   value={newSpecialFilament.name}
                   onChange={(e) => handleNewSpecialFilamentChange("name", e.target.value)}
                   placeholder="e.g. Rainbow PLA"
                 />
               </div>
               {/* Price Modifier */}
               <div className="space-y-2">
                 <Label htmlFor="new-sf-price">Price Modifier ($)</Label>
                 <Input
                   id="new-sf-price"
                   type="number"
                   min="0"
                   step="0.01"
                   value={newSpecialFilament.priceModifier}
                   onChange={(e) => handleNewSpecialFilamentChange("priceModifier", Number.parseFloat(e.target.value))}
                   placeholder="0.00"
                 />
               </div>
            </div>
             {/* Description */}
             <div className="space-y-2">
               <Label htmlFor="new-sf-desc">Description</Label>
               <Textarea
                 id="new-sf-desc"
                 value={newSpecialFilament.description}
                 onChange={(e) => handleNewSpecialFilamentChange("description", e.target.value)}
                 placeholder="Describe the filament"
                 rows={2}
               />
             </div>
             {/* Preview Image Path */}
             <div className="space-y-2">
               <Label htmlFor="new-sf-preview">Preview Image Path</Label>
               <Input
                 id="new-sf-preview"
                 value={newSpecialFilament.previewImg}
                 onChange={(e) => handleNewSpecialFilamentChange("previewImg", e.target.value)}
                 placeholder="/customTextures/your-texture.svg"
               />
                <p className="text-xs text-muted-foreground">Path relative to the public folder (e.g., /customTextures/placeHolder.svg).</p>
             </div>
             {/* Add Button */}
             <Button onClick={handleAddSpecialFilament} className="flex gap-2 items-center">
               <Plus className="h-4 w-4" />
               Add Special Filament
             </Button>
          </div>

          {/* Manage Special Filaments Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Manage Special Filaments</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price Modifier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialFilaments.map((filament) => (
                    <TableRow key={filament.id}>
                      {/* Preview */}
                      <TableCell>
                         {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                             <Input value={editSpecialFilamentState.previewImg} onChange={(e) => handleEditSpecialFilamentChange("previewImg", e.target.value)} placeholder="/img.svg"/>
                         ) : (
                            <img src={filament.previewImg || '/customTextures/placeHolder.svg'} alt={filament.name} className="w-12 h-12 object-cover rounded border bg-gray-100" onError={(e) => (e.currentTarget.src = "/customTextures/placeHolder.svg")}/>
                         )}
                      </TableCell>
                      {/* Name */}
                      <TableCell>
                        {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                          <Input value={editSpecialFilamentState.name} onChange={(e) => handleEditSpecialFilamentChange("name", e.target.value)} />
                        ) : (
                          filament.name
                        )}
                      </TableCell>
                      {/* Description */}
                      <TableCell>
                        {editingSpecialFilamentId === filament.id && editSpecialFilamentState ? (
                          <Textarea value={editSpecialFilamentState.description} onChange={(e) => handleEditSpecialFilamentChange("description", e.target.value)} rows={2}/>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">{filament.description}</p>
                        )}
                      </TableCell>
                      {/* Price Modifier */}
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
                      {/* Actions */}
                      <TableCell className="text-right">
                        {editingSpecialFilamentId === filament.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleSaveSpecialFilament(filament.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelSpecialFilament}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditSpecialFilament(filament.id)} disabled={!!editingColorId || !!editingSpecialFilamentId}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteSpecialFilament(filament.id)} disabled={!!editingColorId || !!editingSpecialFilamentId}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {specialFilaments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No special filaments found.</p>}
          </div>
        </>
      )}
    </div>
  )
}