"use client"

import { useRef, useState, useEffect, Suspense } from "react" // Ensure Suspense is imported
import { Canvas, useLoader } from "@react-three/fiber"
import { OrbitControls, Environment, Center } from "@react-three/drei" // Removed useGLTF as it's used inside GltfModel
import { Color, Mesh, MeshStandardMaterial, BufferGeometry, Vector3 } from "three"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
// Import loaders dynamically
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Text } from "@react-three/drei"; // Import Text

interface ModelViewerProps {
  modelPath: string
  color: string
  material: string
  jobId?: string | undefined
  isLoading?: boolean
  viewerTheme?: 'light' | 'dark'; // Add viewerTheme prop
}

// Helper function to determine file type
const getFileType = (path: string): 'stl' | 'obj' | 'gltf' | 'unknown' | 'fallback' => {
  if (!path || path === 'fallback') return 'fallback';
  const lowercasePath = path.toLowerCase();
  
  // Check for specific file extensions
  if (lowercasePath.endsWith('.stl')) {
    return 'stl';
  } else if (lowercasePath.endsWith('.obj')) {
    return 'obj';
  } else if (lowercasePath.endsWith('.gltf') || lowercasePath.endsWith('.glb')) {
    return 'gltf';
  }
  
  // For API URLs, we'll check for file extension in the URL path
  if (lowercasePath.includes('api/file/')) {
    if (lowercasePath.includes('.stl')) {
      return 'stl';
    } else if (lowercasePath.includes('.obj')) {
      return 'obj';
    } else if (lowercasePath.includes('.gltf') || lowercasePath.includes('.glb')) {
      return 'gltf';
    }
    // Default to STL for API URLs without clear extension
    return 'stl';
  }
  
  return 'unknown';
}

// Function to center and normalize a geometry
const centerAndNormalizeGeometry = (geometry: BufferGeometry) => {
  geometry.computeBoundingBox();
  
  if (!geometry.boundingBox) return geometry;
  
  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.center();
  
  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;
  
  geometry.scale(scale, scale, scale);
  
  return geometry;
}

function Model({ modelPath, color, onError }: { modelPath: string; color: string; onError?: () => void }) {
  const modelRef = useRef<THREE.Group | THREE.Mesh>(null);
  const fileType = getFileType(modelPath);

  // Create a standard material
  const createMaterial = () => {
    return new MeshStandardMaterial({
      color: new Color(color),
      roughness: 0.5,
      metalness: 0.2
    });
  };

  // --- Loader Components ---

  // For STL files (Rely on Suspense and onError prop)
  const StlModel = () => {
    // useLoader will suspend or throw. If it throws, Suspense fallback shows.
    // We need onError to be called if useLoader fails internally.
    // React doesn't provide a direct hook for useLoader failure *within* the component using it.
    // The error boundary (Suspense fallback + onError in parent) is the primary mechanism.
    // Let's ensure the onError callback is robustly passed.
    const geometry = useLoader(STLLoader, modelPath); // No try-catch here
    const normalizedGeometry = centerAndNormalizeGeometry(geometry);
    const material = createMaterial();
    return <mesh ref={modelRef as React.RefObject<Mesh>} geometry={normalizedGeometry} material={material} />;
  };

  // For OBJ files (Rely on Suspense and onError prop)
  const ObjModel = () => {
    const obj = useLoader(OBJLoader, modelPath); // No try-catch here

    useEffect(() => {
      if (obj) {
        obj.traverse((child: any) => {
          if (child.isMesh) {
            child.material = createMaterial();
          }
        });
      }
    }, [obj, color]);

    return <primitive ref={modelRef} object={obj} scale={2} />;
  };

  // For GLB/GLTF files (Keep existing async/await with onError call)
  const GltfModel = () => {
    const [model, setModel] = useState<THREE.Group | null>(null);
    const [loadingError, setLoadingError] = useState(false);

    useEffect(() => {
      let isMounted = true;
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        modelPath,
        (gltf) => { /* ... success logic ... */ setModel(gltf.scene); },
        undefined, // Progress
        (error) => { // Error callback
          if (!isMounted) return;
          console.error("Error loading GLTF model:", error); // Log the actual error
          setLoadingError(true);
          if (onError) onError(); // Call the passed onError callback
        }
      );
      return () => { isMounted = false; };
    }, [modelPath, color, onError]); // onError added as dependency

    if (loadingError) return null; // Don't render if GLTF load failed
    if (!model) return <mesh><boxGeometry args={[0.1, 0.1, 0.1]} /><meshBasicMaterial color="white" wireframe /></mesh>;

    return <primitive ref={modelRef} object={model} />;
  };

  // Fallback Model
  const FallbackModel = () => {
     // Call onError immediately when rendering fallback if it's due to unknown type or explicit fallback path
     useEffect(() => {
        if (fileType === 'unknown' || fileType === 'fallback') {
            if (onError) onError();
        }
     }, [onError, fileType]); // Add fileType dependency

    return (
      <mesh ref={modelRef as React.RefObject<Mesh>}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={new Color(color)} />
      </mesh>
    );
  };

  // --- Render Logic ---
  // Suspense will catch errors from useLoader (STL, OBJ)
  // GltfModel handles its own errors and calls onError
  // FallbackModel calls onError for 'unknown'/'fallback' types
  return (
    <Suspense fallback={
        <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="gray" wireframe />
        </mesh>
    }>
      {fileType === 'stl' && <StlModel />}
      {fileType === 'obj' && <ObjModel />}
      {fileType === 'gltf' && <GltfModel />}
      {(fileType === 'fallback' || fileType === 'unknown') && <FallbackModel />}
    </Suspense>
  );
}


export function ModelViewer({ modelPath, color, material, jobId, isLoading = false, viewerTheme = 'light' }: ModelViewerProps) {
  const actualModelPath = modelPath || 'fallback';
  const router = useRouter();
  const [loadError, setLoadError] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number } | null>(null);
  const modelRef = useRef<THREE.Group | THREE.Mesh>(null); // Ref to access the loaded model
  const { theme } = useTheme();

  // Reset error state when model path changes or becomes valid
  useEffect(() => {
    if (modelPath && modelPath !== 'fallback') {
      setLoadError(false);
    }
    // If the path becomes null/fallback, reset error *unless* parent is still loading
    // This prevents flashing error state if parent is slow but will eventually provide a path
    else if (!isLoading) {
       setLoadError(false); // Reset if not loading and path is bad/null
    }
  }, [modelPath, isLoading]); // Add isLoading dependency

  // Effect to calculate dimensions after model loads
  useEffect(() => {
    // Create a timer to ensure dimensions are calculated even if modelRef isn't immediately available
    const calculateDimensions = () => {
      if (modelRef.current && !isLoading && !loadError) {
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const size = box.getSize(new THREE.Vector3());
        // Convert to mm (multiply by 10 since the model is normalized)
        setDimensions({
          x: parseFloat((size.x * 10).toFixed(1)),
          y: parseFloat((size.y * 10).toFixed(1)),
          z: parseFloat((size.z * 10).toFixed(1)),
        });
      }
    };

    calculateDimensions(); // Try immediately first

    // Then set a short timer as backup to ensure dimensions are calculated
    const timer = setTimeout(() => {
      calculateDimensions();
    }, 500);

    return () => clearTimeout(timer);
  }, [modelRef.current, isLoading, loadError]); // Re-run when modelRef changes or loading/error state changes

  // Callback for Model component to signal an error
  const handleModelError = () => {
    console.log("handleModelError called"); // Add log to confirm it's triggered
    // Only set error if not already in loading state (prevents race conditions)
    if (!isLoading) {
        setLoadError(true);
    }
  };

  // Redirect to contact form for incompatible models
  const handleContactRedirect = () => {
    sessionStorage.setItem("modelError", "true")
    sessionStorage.setItem("selectedColor", color || "")
    sessionStorage.setItem("selectedMaterial", material || "")
    router.push("/contact")
  }

  // Show loading state based on parent's isLoading prop
  if (isLoading) {
    return (
      <div className="w-full h-full rounded-md overflow-hidden border bg-muted/20 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Loading Model</h3>
        <p className="text-muted-foreground mb-4">
          We're preparing your 3D model for preview. This may take a moment...
        </p>
      </div>
    )
  }

  // Show error state if loadError is true
  if (loadError) {
    return (
      <div className="w-full h-full rounded-md overflow-hidden border bg-muted/20 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to Preview Model</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't load your 3D model for preview. This could be due to file format incompatibility or file
          corruption.
        </p>
        <Button onClick={handleContactRedirect}>Contact Support</Button>
      </div>
    )
  }

  // Determine background color based on viewerTheme prop
  const backgroundColor = viewerTheme === 'dark' ? '#1a1a1a' : '#f5f5f5';

  // Render the model viewer
  return (
    <div className="w-full h-full rounded-md overflow-hidden border bg-muted/20 relative model-viewer-container">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={[backgroundColor]} /> {/* Use dynamic background color */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        {/* Suspense wraps the Model component which uses useLoader */}
        <Center>
           <group ref={modelRef}> {/* Wrap Model in a group to ensure ref is captured */} 
              <Model modelPath={actualModelPath} color={color} onError={handleModelError} />
            </group>
        </Center>
        <Environment preset="studio" />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate={true} autoRotateSpeed={1} />
      </Canvas>
      <div className="absolute bottom-2 right-2 bg-background/80 text-xs px-2 py-1 rounded">
        {/* Ensure material and color display correctly */}
        {material || 'N/A'} • {color ? (color === "#ffffff" ? "White" : color === "#000000" ? "Black" : color) : 'N/A'}
      </div>
      {/* Dimensions Display (Bottom Left) */}
      {dimensions && (
        <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
          {`Dimensions: ${dimensions.x} x ${dimensions.y} x ${dimensions.z} MM`}
        </div>
      )}
    </div>
  )
}
