"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileUp, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { uploadModel } from "@/services/api"
import { Progress } from "@/components/ui/progress"

// Define size limits
const MAX_FILE_SIZE_MB = 200;
const OVERSIZE_THRESHOLD_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const OVERSIZE_THRESHOLD_BYTES = OVERSIZE_THRESHOLD_MB * 1024 * 1024;

export function FileUploader() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isOversize, setIsOversize] = useState(false); // State to track oversize file

  const allowedFileTypes = [".stl", ".3mf", ".step", ".obj"]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    setError(null); // Clear previous errors
    setIsOversize(false); // Reset oversize state

    const extension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!allowedFileTypes.includes(extension)) {
      setError(`Invalid file type. Please upload ${allowedFileTypes.join(", ")} files.`)
      return false
    }

    // Check total file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      return false
    }

    // Check if file is oversize for custom inquiry
    if (file.size > OVERSIZE_THRESHOLD_BYTES) {
      setError(`This file exceeds ${OVERSIZE_THRESHOLD_MB}MB and requires a custom inquiry. Please proceed to contact us.`);
      setIsOversize(true); // Mark as oversize
      // Still return true because we want to keep the file selected
      return true;
    }

    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    // If the file is marked as oversize, redirect to contact page
    if (isOversize) {
      // Store file info for the contact page (optional, but helpful)
      sessionStorage.setItem("oversizeFileName", file.name);
      sessionStorage.setItem("oversizeFileSize", (file.size / (1024 * 1024)).toFixed(2) + "MB");
      router.push("/contact?reason=oversize_quote");
      return; // Stop the regular upload process
    }

    try {
      setIsUploading(true)
      setError(null)
      
      // Simulate upload progress (since fetch doesn't provide progress events easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)
      
      // Upload the file to the backend
      const response = await uploadModel({
        file,
        // Default values - these can be customized in the next step
        material_id: "pla",
        color_id: "white",
        quality_id: "standard",
        fill_density: 0.15,
        enable_supports: true
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Store the job ID and filename in session storage
      sessionStorage.setItem("uploadedModel", file.name)
      sessionStorage.setItem("uploadedModelJobId", response.job_id)
      
      // Short delay to show 100% progress before redirecting
      setTimeout(() => {
        // Redirect to the customization page
        router.push("/customize")
      }, 500)
    } catch (err: any) {
      setError(err.message || "Failed to upload file. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-2 px-2 py-8 text-xs">
          <div className="rounded-full bg-primary/10 p-2">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-sm font-medium">{file ? file.name : "Drag & drop your 3D model here"}</div>
            <div className="text-xs text-muted-foreground">
              {file
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : `Supported formats: ${allowedFileTypes.join(", ")}`}
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            accept={allowedFileTypes.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {error && (
        <div className={cn(
          "flex items-center gap-2 text-sm",
          isOversize ? "text-orange-600" : "text-destructive" // Use a different color for oversize warning
        )}>
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2 w-full" />
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading and processing your model...
          </div>
        </div>
      )}

      <Button 
        className="w-full" 
        size="lg" 
        disabled={!file || isUploading} 
        onClick={handleSubmit}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : isOversize ? (
          <>
            <FileUp className="mr-2 h-4 w-4" />
            Proceed to Custom Inquiry
          </>
        ) : (
          <>
            <FileUp className="mr-2 h-4 w-4" />
            {file ? "Continue to Customization" : "Upload a File"}
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/contact" className="text-primary hover:underline">
          Having trouble? Contact us for assistance
        </Link>
      </div>
    </div>
  )
}
