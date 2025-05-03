"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelViewer } from "@/components/model-viewer"
import { ColorSelector } from "@/components/color-selector"
import { MaterialSelector } from "@/components/material-selector"
import { QualitySelector } from "@/components/quality-selector"
import { ArrowLeft, ArrowRight, Palette, Layers, Settings, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"
import { getJobStatus } from "@/services/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Label } from "@/components/ui/label"; // Import Label

// Define API base URL for model files
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const MAX_FILE_CHECK_RETRIES = 5; // Number of times to retry the HEAD request
const FILE_CHECK_RETRY_DELAY = 2000; // Delay between retries in milliseconds

export default function CustomizePage() {
  const router = useRouter()
  const [modelName, setModelName] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null) // State for the confirmed model URL
  const [jobId, setJobId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>("#000000") // Set default color to black
  const [selectedSpecialFilament, setSelectedSpecialFilament] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [selectedQuality, setSelectedQuality] = useState<string>("standard")
  const [activeTab, setActiveTab] = useState("color")
  const [isMultiColor, setIsMultiColor] = useState(false)
  const [multiColorDetails, setMultiColorDetails] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [isLoadingJob, setIsLoadingJob] = useState(true) // State for job fetching/polling
  const [error, setError] = useState<string | null>(null)
  const [viewerTheme, setViewerTheme] = useState<'light' | 'dark'>('dark'); // Default dark background

  useEffect(() => {
    setIsClient(true)
    const storedModel = sessionStorage.getItem("uploadedModel")
    const storedJobId = sessionStorage.getItem("uploadedModelJobId")

    // --- Restore previous selections --- START
    const storedSpecial = sessionStorage.getItem("selectedSpecialFilament");
    const storedMaterial = sessionStorage.getItem("selectedMaterial");
    const storedQuality = sessionStorage.getItem("selectedQuality");
    const storedIsMulti = sessionStorage.getItem("isMultiColor") === "true";
    const storedMultiDetails = sessionStorage.getItem("multiColorDetails");
    // --- Restore previous selections --- END

    if (!storedModel || !storedJobId) {
      router.push("/upload")
      return
    }

    setModelName(storedModel)
    setJobId(storedJobId)

    // --- Restore state *after* setting model/jobId --- START
    // Restore other states similarly, checking if they exist
    if (storedSpecial) setSelectedSpecialFilament(storedSpecial);
    if (storedMaterial) setSelectedMaterial(storedMaterial);
    if (storedQuality) setSelectedQuality(storedQuality);
    if (storedIsMulti) setIsMultiColor(storedIsMulti);
    if (storedMultiDetails) setMultiColorDetails(storedMultiDetails);
    // --- Restore state *after* setting model/jobId --- END

    let isMounted = true;
    let pollingIntervalId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      isMounted = false;
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };

    // Helper to check file availability with retries
    const checkFileWithRetries = async (url: string): Promise<boolean> => {
      for (let i = 0; i < MAX_FILE_CHECK_RETRIES; i++) {
        if (!isMounted) return false; // Stop if component unmounted
        try {
          console.log(`Checking file (attempt ${i + 1}/${MAX_FILE_CHECK_RETRIES}): ${url}`);
          // Add cache-busting query param
          const response = await fetch(`${url}?t=${Date.now()}`, { method: 'HEAD' });
          if (response.ok) {
            console.log(`File found: ${url}`);
            return true; // File found
          }
          console.log(`File not found (attempt ${i + 1}), status: ${response.status}`);
        } catch (err) {
          console.error(`Error checking file (attempt ${i + 1}):`, err);
          // Log error but continue retrying
        }
        // Wait before next retry, unless it's the last attempt
        if (i < MAX_FILE_CHECK_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, FILE_CHECK_RETRY_DELAY));
        }
      }
      return false; // File not found after all retries
    };


    // Updated Helper to check file and set URL using retry logic
    const determineAndSetModelUrl = async (filename: string | null): Promise<string | null> => {
      if (!isMounted || !filename) {
        if (isMounted && !filename) setError("Processing completed but model filename is missing.");
        setIsLoadingJob(false); // Stop loading if no filename
        return null;
      }

      let determinedUrl: string | null = null;
      const modelUrlPath = `${API_BASE_URL}/api/file/${filename}`;

      if (await checkFileWithRetries(modelUrlPath)) {
        determinedUrl = modelUrlPath;
      } else {
        console.log(`Original file not found after retries: ${modelUrlPath}. Checking for STL conversion...`);
        if (filename.toLowerCase().endsWith('.3mf')) {
          const stlFilename = filename.replace(/\\.3mf$/i, '.stl');
          const stlUrlPath = `${API_BASE_URL}/api/file/${stlFilename}`;
          if (await checkFileWithRetries(stlUrlPath)) {
            console.log(`Converted STL found after retries: ${stlUrlPath}`);
            determinedUrl = stlUrlPath;
          } else {
            console.error("Neither original nor STL file found after retries.");
            if (isMounted) setError("Model file could not be located after processing, even after retries. Please try uploading again.");
          }
        } else {
          console.error("Model file not found after retries (not 3MF).");
          if (isMounted) setError("Model file could not be located after processing, even after retries. Please try uploading again.");
        }
      }

      if (isMounted) {
         setModelUrl(determinedUrl); // Set the state with determined URL (or null)
         setIsLoadingJob(false); // Stop loading *after* check completes (success or fail)
      }
      return determinedUrl;
    };


    const fetchJobStatus = async () => {
       if (!isMounted) return;

       setIsLoadingJob(true); // Start loading
       setError(null);
       setModelUrl(null); // Reset model URL at the start

      try {
        let currentJobStatus = await getJobStatus(storedJobId);

        // --- Polling Logic ---
        if (currentJobStatus.status === 'pending' || currentJobStatus.status === 'processing') {
          pollingIntervalId = setInterval(async () => {
            // ... (polling interval logic remains similar) ...
             if (!isMounted) { /* ... cleanup ... */ return; }
             try {
               const updatedStatus = await getJobStatus(storedJobId);
               if (updatedStatus.status === 'completed' || updatedStatus.status === 'failed') {
                 if (pollingIntervalId) clearInterval(pollingIntervalId);
                 pollingIntervalId = null;
                 if (!isMounted) return;

                 if (updatedStatus.status === 'failed') {
                   setError(updatedStatus.error || 'Failed to process model');
                   setIsLoadingJob(false); // Stop loading on failure
                 } else { // Completed
                   if (updatedStatus.material_id) setSelectedMaterial(updatedStatus.material_id);
                   // (Removed overriding color: keep existing selectedColor)
                   await determineAndSetModelUrl(updatedStatus.filename);
                 }
                 // Removed setIsLoadingJob(false) from here; it's now in determineAndSetModelUrl
               }
             } catch (err: any) {
                // ... (error handling for poll) ...
                if (pollingIntervalId) clearInterval(pollingIntervalId);
                pollingIntervalId = null;
                if (isMounted) {
                    setError(err.message || 'Failed to get job status during poll');
                    setIsLoadingJob(false); // Stop loading on poll error
                }
             }
          }, 3000);
        }
        // --- Initial Status Check ---
        else { // Already completed or failed
            if (currentJobStatus.status === 'failed') {
                setError(currentJobStatus.error || 'Failed to process model');
                setIsLoadingJob(false); // Stop loading on initial failure
            } else { // Completed
                if (currentJobStatus.material_id) setSelectedMaterial(currentJobStatus.material_id);
                // (Removed overriding color on initial fetch: keep existing selectedColor)
                await determineAndSetModelUrl(currentJobStatus.filename);
            }
            // Removed setIsLoadingJob(false) from here; it's now in determineAndSetModelUrl
        }
      } catch (err: any) {
         if (isMounted) {
             setError(err.message || 'Initial job status fetch failed');
             setIsLoadingJob(false); // Stop loading on initial fetch error
         }
      }
    };

    fetchJobStatus();

    return cleanup;

  }, [router]); // Keep dependency array minimal

  const handleColorSelect = (color: string, isSpecial?: boolean, specialId?: string) => {
    if (isSpecial) {
      setSelectedSpecialFilament(specialId || null)
      setSelectedColor(null)
    } else {
      setSelectedColor(color)
      setSelectedSpecialFilament(null)
    }
  }

  const handleMultiColorChange = (isMulti: boolean, details?: string) => {
    setIsMultiColor(isMulti)
    if (details) {
      setMultiColorDetails(details)
    }

    // If multi-color is selected, we'll use a default color for preview
    if (isMulti && !selectedColor) {
      setSelectedColor("#cccccc") // Default gray for multi-color preview
    }
  }

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material)
  }

  const handleQualitySelect = (quality: string) => {
    setSelectedQuality(quality)
  }

  const handleNext = async () => {
    // --- Save selections to sessionStorage --- START
    sessionStorage.setItem("selectedColor", selectedColor || "")
    sessionStorage.setItem("selectedSpecialFilament", selectedSpecialFilament || "")
    sessionStorage.setItem("selectedMaterial", selectedMaterial || "") // Ensure material is saved
    sessionStorage.setItem("selectedQuality", selectedQuality)
    sessionStorage.setItem("isMultiColor", isMultiColor.toString())
    sessionStorage.setItem("multiColorDetails", multiColorDetails)
    sessionStorage.setItem("jobId", jobId || "")
    // --- Save selections to sessionStorage --- END

    if (activeTab === "color" && (selectedColor || selectedSpecialFilament || isMultiColor)) {
      setActiveTab("material")
    } else if (activeTab === "material" && selectedMaterial) {
      // No need to update job here, just navigate
      router.push("/quote")
    }
  }

  const handleBack = () => {
    if (activeTab === "material") {
      setActiveTab("color")
    } else {
      router.push("/upload")
    }
  }

  // --- Rendering ---
  if (!isClient) {
     return <div className="container py-12 text-center">Initializing...</div>;
  }

  // Display error first
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-8">
          <div className="container py-12">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button onClick={() => router.push("/upload")} variant="default">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // If no error, render the page
  // ModelViewer will use its 'isLoading' prop (which is isLoadingJob)
  // and its internal logic based on modelUrl
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <Link href="/upload" className="text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div>
              <Card className="mb-6 overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/50">
                  <CardTitle>{modelName}</CardTitle>
                  <CardDescription>
                    Preview of your customized model
                    {isMultiColor && " (Preview shows base color only)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="aspect-square p-0 relative"> {/* Added relative positioning */}
                  <ModelViewer
                    modelPath={modelUrl || "fallback"} // Pass determined URL or fallback
                    color={selectedColor || "#000000"}
                    material={selectedMaterial || "PLA"}
                    jobId={jobId || undefined}
                    isLoading={isLoadingJob} // Pass the job loading state
                    viewerTheme={viewerTheme} // Pass viewer theme
                  />
                  {/* Viewer Theme Toggle */}
                  <div className="absolute top-4 right-3 flex items-center space-x-4 bg-background/80 px-3 py-2 rounded">
                    <Label htmlFor="viewer-theme" className="text-s">Dark Background</Label>
                    <Switch
                      id="viewer-theme"
                      checked={viewerTheme === 'dark'}
                      onCheckedChange={(checked) => setViewerTheme(checked ? 'dark' : 'light')}
                      className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-muted/50">
                  <CardTitle>Customize Your Print</CardTitle>
                  <CardDescription>Select options for your 3D print</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mt-6">
                      <TabsTrigger value="color" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span>Color</span>
                      </TabsTrigger>
                      <TabsTrigger value="material" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Material & Quality</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="color" className="pt-4">
                      <div className="selection-container">
                        <h3 className="selection-title flex items-center gap-2">
                          <Palette className="h-5 w-5 text-primary" />
                          Color Selection
                        </h3>
                        <ColorSelector
                          onSelect={handleColorSelect}
                          selectedColor={selectedColor}
                          selectedSpecialFilament={selectedSpecialFilament}
                          onMultiColorChange={handleMultiColorChange}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="material" className="pt-4 space-y-1"> {/* Added space-y-6 for padding */}
                      <div className="selection-container">
                        <h3 className="selection-title flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" />
                          Material Selection
                        </h3>
                        <MaterialSelector
                          onSelect={handleMaterialSelect}
                          selectedMaterial={selectedMaterial}
                          selectedColor={selectedColor}
                          isMultiColor={isMultiColor}
                        />
                      </div>

                      <div className="selection-container">
                        <h3 className="selection-title flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          Print Quality
                        </h3>
                        <QualitySelector onSelect={handleQualitySelect} selectedQuality={selectedQuality} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack} className="button-hover-effect">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={
                      isLoadingJob || // Disable if job is still loading
                      !modelUrl || // Also disable if model URL couldn't be determined
                      (activeTab === "color" && !selectedColor && !selectedSpecialFilament && !isMultiColor) ||
                      (activeTab === "material" && !selectedMaterial)
                    }
                    className="bg-primary hover:bg-primary/90 button-hover-effect"
                  >
                    {activeTab === "color" ? "Next" : "Get Quote"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
