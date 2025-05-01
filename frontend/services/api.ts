/**
 * API Service for 3D Print Instant Quote
 * 
 * This service handles all communication with the backend API.
 */

// Base API URL - configurable for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Use API_BASE_URL for catalog functions as well
const CATALOG_API_BASE_URL = API_BASE_URL; // Use the same base URL

/**
 * Interface for upload parameters
 */
interface UploadParams {
  file: File;
  material_id?: string;
  color_id?: string;
  quality_id?: string;
  fill_density?: number;
  enable_supports?: boolean;
}

/**
 * Interface for job status response
 */
interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'approved' | 'rejected';
  created_at: number;
  filename: string;
  original_filename: string;
  material_id: string;
  color_id: string;
  quality_id?: string;
  fill_density: number;
  enable_supports: boolean;
  result?: {
    filament_used_g: number;
    estimated_time: string;
    has_supports: boolean;
    size: {
      x: number;
      y: number;
      z: number;
    };
    volume_cm3: number;
    fill_density: number;
    price_info: {
      material_cost: number;
      time_cost: number;
      color_addon: number;
      material_modifier?: number;
      quality_modifier?: number;
      volume_cost?: number;
      subtotal?: number;
      total_price: number;
    };
  };
  error?: string;
}

/**
 * Interface for material data
 */
interface Material {
  id: string;
  name: string;
  description: string;
  properties: string[];
  base_cost_per_gram: number;
  hourly_rate: number;
  colors: {
    id: string;
    name: string;
    hex: string;
    addon_price: number;
  }[];
}

interface SpecialFilament {
  id: string;
  name: string;
  description: string;
  previewImg: string; // Path to the SVG
  priceModifier: number;
}

/**
 * Interface for materials response
 */
interface MaterialsResponse {
  materials: Material[];
  global_settings: {
    support_material_multiplier: number;
    minimum_price: number;
    default_fill_density: number;
    quality_levels?: {
      id: string;
      name: string;
      layer_height: string;
      description: string;
      price_modifier: number;
    }[];
    volume_multiplier?: number;
    markup_percentage?: number;
    rush_order_fee?: number;
  };
  special_filaments?: SpecialFilament[]; // Add optional special filaments array
}

/**
 * Interface for order data
 */
interface OrderData {
  job_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address?: {
    address: string;
    city: string;
    postal_code: string;
    province: string;
  };
  delivery_method: 'pickup' | 'shipping';
  notes?: string;
  quantity: number;
}

/**
 * Upload a 3D model file to the backend
 * @param params Upload parameters
 * @returns Promise with job ID and status
 */
export async function uploadModel(params: UploadParams): Promise<{ job_id: string; status: string; message: string }> {
  const formData = new FormData();
  formData.append('file', params.file);
  
  if (params.material_id) {
    formData.append('material_id', params.material_id);
  }
  
  if (params.color_id) {
    formData.append('color_id', params.color_id);
  }
  
  if (params.quality_id) {
    formData.append('quality_id', params.quality_id);
  }
  
  if (params.fill_density !== undefined) {
    formData.append('fill_density', params.fill_density.toString());
  }
  
  if (params.enable_supports !== undefined) {
    formData.append('enable_supports', params.enable_supports.toString());
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Get the status of a job
 * @param jobId Job ID
 * @returns Promise with job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get job status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting job status:', error);
    throw error;
  }
}

/**
 * Get all available materials and colors
 * @returns Promise with materials data
 */
export async function getMaterials(): Promise<MaterialsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get materials');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting materials:', error);
    throw error;
  }
}

/**
 * Update materials (admin only)
 * @param materialsData Updated materials data
 * @returns Promise with success status
 */
export async function updateMaterials(materialsData: MaterialsResponse): Promise<{ success: boolean; message: string }> {
  try {
    // Retrieve the stored Basic Auth string from sessionStorage
    const authString = sessionStorage.getItem('adminAuth');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (authString) {
        headers['Authorization'] = authString;
    } else {
        // If no auth string is found, throw an error immediately
        console.error("Admin auth credentials not found for updating materials data.");
        throw new Error("Authentication required. Please log in as admin.");
    }

    const response = await fetch(`${API_BASE_URL}/api/materials`, {
      method: 'POST',
      headers: headers, // Use the headers with Authorization
      body: JSON.stringify(materialsData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to update materials: ${response.status} ${response.statusText}`, errorData);
      if (response.status === 401) {
           // Clear potentially invalid stored credentials on 401
           sessionStorage.removeItem('adminAuth');
           throw new Error(`Authentication failed. Please log in again.`);
      }
      throw new Error(errorData.message || errorData.error || 'Failed to update materials'); // Use message from backend if available
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating materials:', error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
}

/**
 * Get all jobs (admin only)
 * @returns Promise with all jobs
 */
export async function getAllJobs(): Promise<JobStatus[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get jobs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
  }
}

/**
 * Approve a job for printing (admin only)
 * @param jobId Job ID
 * @returns Promise with success status
 */
export async function approveJob(jobId: string): Promise<{ success: boolean; message: string; job: JobStatus }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}/approve`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to approve job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error approving job:', error);
    throw error;
  }
}

/**
 * Reject a job (admin only)
 * @param jobId Job ID
 * @returns Promise with success status
 */
export async function rejectJob(jobId: string): Promise<{ success: boolean; message: string; job: JobStatus }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}/reject`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reject job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error rejecting job:', error);
    throw error;
  }
}

/**
 * Notify backend that a job's quote is being added to the cart.
 * This triggers moving files from uploaded to quoted folder.
 * @param jobId Job ID
 * @returns Promise with success status and updated job data
 */
export async function addJobToCart(jobId: string): Promise<{ success: boolean; message: string; job: JobStatus }> {
  try {
    // Add authentication if required by the backend endpoint
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}/add-to-cart`, {
      method: 'POST',
      headers: {
        // Add 'Authorization': `Basic ${credentials}` if needed
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add job to cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding job to cart:', error);
    throw error;
  }
}

/**
 * Submit an order
 * @param orderData Order data
 * @returns Promise with success status
 */
export async function submitOrder(orderData: OrderData): Promise<{ success: boolean; message: string }> {
  try {
    // This endpoint would need to be added to the backend
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}

/**
 * Send a notification email
 * @param emailData Email data
 * @returns Promise with success status
 */
export async function sendNotificationEmail(emailData: {
  to: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Placeholder functions for fetching and saving catalog data
// You'll need to implement the actual API endpoints in your backend

interface CatalogData {
  categories: any[]; // Replace 'any' with your Category interface
  products: any[];   // Replace 'any' with your Product interface
}

// Updated function to fetch from the backend API
export const getCatalogData = async (): Promise<CatalogData> => {
  console.log(`Fetching catalog data from ${CATALOG_API_BASE_URL}/api/catalog`);
  try {
    const response = await fetch(`${CATALOG_API_BASE_URL}/api/catalog`, { cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch catalog data: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Successfully fetched catalog data:", data);

    if (!data || typeof data !== 'object' || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
        console.error("Invalid data structure received from API:", data);
        throw new Error("Invalid data structure received from catalog API.");
    }

    return {
        categories: data.categories,
        products: data.products
    };
  } catch (error) {
      console.error("Error in getCatalogData:", error);
      throw error; // Re-throw
  }
};

// Updated function to save catalog data with Basic Auth
export const saveCatalogData = async (data: CatalogData): Promise<void> => {
  console.log(`Saving catalog data to ${CATALOG_API_BASE_URL}/api/catalog`);
  try {
      // Retrieve the stored Basic Auth string from sessionStorage
      const authString = sessionStorage.getItem('adminAuth');
      const headers: HeadersInit = {
          'Content-Type': 'application/json',
      };

      if (authString) {
          headers['Authorization'] = authString;
      } else {
          // If no auth string is found, throw an error immediately
          console.error("Admin auth credentials not found for saving catalog data.");
          throw new Error("Authentication required. Please log in as admin.");
      }

      const response = await fetch(`${CATALOG_API_BASE_URL}/api/catalog`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to save catalog data: ${response.status} ${response.statusText}`, errorText);
        if (response.status === 401) {
             // Clear potentially invalid stored credentials on 401
             sessionStorage.removeItem('adminAuth');
             throw new Error(`Authentication failed. Please log in again.`);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Save successful:", result);

  } catch (error) {
      console.error("Error in saveCatalogData:", error);
      // Re-throw the error to be handled by the calling component (e.g., show an error message)
      throw error;
  }
};

// Add a similar update for saveMaterials if it exists and requires auth
export const saveMaterials = async (materialsData: any): Promise<void> => { // Replace 'any' with actual type
    console.log(`Saving materials data to ${API_BASE_URL}/api/materials`);
    try {
        const authString = sessionStorage.getItem('adminAuth');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (authString) {
            headers['Authorization'] = authString;
        } else {
            console.error("Admin auth credentials not found for saving materials data.");
            throw new Error("Authentication required. Please log in as admin.");
        }

        const response = await fetch(`${API_BASE_URL}/api/materials`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(materialsData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to save materials data: ${response.status} ${response.statusText}`, errorText);
            if (response.status === 401) {
                sessionStorage.removeItem('adminAuth');
                throw new Error(`Authentication failed. Please log in again.`);
            }
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log("Materials save successful:", result);

    } catch (error) {
        console.error("Error in saveMaterials:", error);
        throw error;
    }
};

// Add other API functions as needed (e.g., for materials, colors, pricing)
