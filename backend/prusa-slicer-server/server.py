import shutil # Import shutil for file operations
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import json
import uuid
import time
import threading
import re
from werkzeug.utils import secure_filename
import queue
from functools import wraps
import base64
import traceback # Ensure traceback is imported

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
SHARED_FOLDER = "/app/shared" # Base shared folder mapped to userModels
UPLOAD_FOLDER = os.path.join(SHARED_FOLDER, "temp", "uploaded") # Initial uploads
QUOTED_FOLDER = os.path.join(SHARED_FOLDER, "temp", "quoted") # Files for completed quotes
ORDERS_FOLDER = os.path.join(SHARED_FOLDER, "orders") # Files for approved orders
CONFIG_FOLDER = "/app/config" # Mounted config directory
ALLOWED_EXTENSIONS = {'stl', '3mf', 'obj'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB max file size
MATERIALS_FILE = os.path.join(CONFIG_FOLDER, "materials.json") # Updated path
AUTH_FILE = os.path.join(CONFIG_FOLDER, "auth.json") # New path for auth
CATALOG_FILE = os.path.join(CONFIG_FOLDER, "catalog.json") # Path for catalog data

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QUOTED_FOLDER, exist_ok=True)
os.makedirs(ORDERS_FOLDER, exist_ok=True)

# Default materials and pricing if no file exists
DEFAULT_MATERIALS = {
    "materials": [
        {
            "id": "pla",
            "name": "PLA",
            "description": "Standard material, good for most prints",
            "properties": ["Simple", "Indoor use"],
            "base_cost_per_gram": 0.05,
            "hourly_rate": 2.0,
            "colors": [
                {
                    "id": "white",
                    "name": "White",
                    "hex": "#FFFFFF",
                    "addon_price": 0.0
                },
                {
                    "id": "black",
                    "name": "Black",
                    "hex": "#000000",
                    "addon_price": 0.0
                },
                {
                    "id": "red",
                    "name": "Red",
                    "hex": "#FF0000",
                    "addon_price": 0.0
                },
                {
                    "id": "blue",
                    "name": "Blue",
                    "hex": "#0000FF",
                    "addon_price": 0.0
                },
                {
                    "id": "gold",
                    "name": "Gold",
                    "hex": "#FFD700",
                    "addon_price": 2.0
                }
            ]
        },
        {
            "id": "petg",
            "name": "PETG",
            "description": "Durable material, suitable for outdoor use",
            "properties": ["Durable", "Outdoor", "Water-resistant"],
            "base_cost_per_gram": 0.07,
            "hourly_rate": 2.5,
            "colors": [
                {
                    "id": "white",
                    "name": "White",
                    "hex": "#FFFFFF",
                    "addon_price": 0.0
                },
                {
                    "id": "black",
                    "name": "Black",
                    "hex": "#000000",
                    "addon_price": 0.0
                },
                {
                    "id": "clear",
                    "name": "Clear",
                    "hex": "#E0F7FA",
                    "addon_price": 1.0
                }
            ]
        },
        {
            "id": "abs",
            "name": "ABS",
            "description": "Rigid material, good for mechanical parts",
            "properties": ["Rigid", "Heat-resistant", "Durable"],
            "base_cost_per_gram": 0.08,
            "hourly_rate": 3.0,
            "colors": [
                {
                    "id": "white",
                    "name": "White",
                    "hex": "#FFFFFF",
                    "addon_price": 0.0
                },
                {
                    "id": "black",
                    "name": "Black",
                    "hex": "#000000",
                    "addon_price": 0.0
                }
            ]
        }
    ],
    "global_settings": {
        "support_material_multiplier": 1.2,  # 20% extra for support material
        "minimum_price": 5.0,                # Minimum price for any print
        "default_fill_density": 0.15         # Default fill density (15%)
    }
}

# Default catalog data if no file exists
DEFAULT_CATALOG = {
  "categories": [
    {
      "id": "uncategorized",
      "name": "Uncategorized",
      "description": "Products without a specific category",
      "image": "/placeholder.svg?height=300&width=500"
    }
  ],
  "products": []
}

# Load admin credentials
def load_credentials():
    if os.path.exists(AUTH_FILE):
        try:
            with open(AUTH_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading auth file: {e}")
            return {"username": "admin", "password": "password"} # Fallback
    else:
        # Create default auth file if it doesn't exist
        default_creds = {"username": "admin", "password": "password"}
        try:
            with open(AUTH_FILE, 'w') as f:
                json.dump(default_creds, f, indent=2)
            return default_creds
        except Exception as e:
            print(f"Error creating default auth file: {e}")
            return default_creds # Fallback

ADMIN_CREDENTIALS = load_credentials()

# Job queue
job_queue = queue.Queue()
jobs = {}  # Store job status and results
processing_thread = None
processing_lock = threading.Lock()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_3mf_to_stl(input_file_path):
    """Convert a 3MF file to STL format using PrusaSlicer"""
    try:
        # Generate output file path with .stl extension
        output_file_path = os.path.splitext(input_file_path)[0] + ".stl"
        
        # Use PrusaSlicer to convert the file
        # The --export-stl command exports the model as STL
        result = subprocess.run(
            ["prusa-slicer", "--export-stl", input_file_path, "--output", output_file_path],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Error converting 3MF to STL: {result.stderr}", file=sys.stderr)
            return None
        
        return output_file_path
    except Exception as e:
        print(f"Exception during 3MF conversion: {str(e)}", file=sys.stderr)
        return None

def parse_time_string(time_str):
    """Convert time string like '2d 3h 45m 30s' to hours as float"""
    total_seconds = 0
    
    # Extract days, hours, minutes, seconds
    days_match = re.search(r'(\d+)d', time_str)
    hours_match = re.search(r'(\d+)h', time_str)
    minutes_match = re.search(r'(\d+)m', time_str)
    seconds_match = re.search(r'(\d+)s', time_str)
    
    if days_match:
        total_seconds += int(days_match.group(1)) * 24 * 3600
    if hours_match:
        total_seconds += int(hours_match.group(1)) * 3600
    if minutes_match:
        total_seconds += int(minutes_match.group(1)) * 60
    if seconds_match:
        total_seconds += int(seconds_match.group(1))
    
    return total_seconds / 3600  # Convert to hours

def calculate_price(material_id, color_id, filament_used_g, print_time, has_supports, quality_id=None, volume_cm3=None):
    """Calculate price based on material, color, filament usage, print time, and quality"""
    try:
        materials_data = get_materials()
        materials = materials_data["materials"]
        global_settings = materials_data["global_settings"]
        
        # Find the material
        material = next((m for m in materials if m["id"] == material_id), None)
        if not material:
            return {"error": f"Material {material_id} not found"}
        
        # Find the color
        color = next((c for c in material["colors"] if c["id"] == color_id), None)
        if not color:
            return {"error": f"Color {color_id} not found for material {material_id}"}
        
        # Calculate base material cost
        material_cost = filament_used_g * material["base_cost_per_gram"]
        
        # Add support material cost if needed
        if has_supports:
            material_cost *= global_settings["support_material_multiplier"]
        
        # Calculate time cost
        time_cost = parse_time_string(print_time) * material["hourly_rate"]
        
        # Calculate prusa-generated cost (material + time)
        prusa_cost = material_cost + time_cost
        
        # Get minimum price from settings
        minimum_price = global_settings["minimum_price"]
        
        # Base price is the higher of prusa cost or minimum price
        base_price = max(prusa_cost, minimum_price)
        
        # Apply markup to base price
        markup_percentage = global_settings.get("markup_percentage", 30)
        markup = markup_percentage / 100
        base_price_with_markup = base_price * (1 + markup)
        
        # Get modifiers
        color_addon = color["addon_price"]
        material_modifier = material.get("priceModifier", 0)
        
        # Get quality modifier
        quality_modifier = 0
        if quality_id and "quality_levels" in global_settings:
            quality_level = next((q for q in global_settings["quality_levels"] if q["id"] == quality_id), None)
            if quality_level:
                quality_modifier = quality_level.get("price_modifier", 0)
        
        # Calculate total price by adding modifiers to base price with markup
        total_price = base_price_with_markup + color_addon + material_modifier + quality_modifier
        
        return {
            "base_price": round(base_price, 2),
            "base_price_with_markup": round(base_price_with_markup, 2),
            "material_cost": round(material_cost, 2),
            "time_cost": round(time_cost, 2),
            "color_addon": round(color_addon, 2),
            "material_modifier": round(material_modifier, 2),
            "quality_modifier": round(quality_modifier, 2),
            "total_price": round(total_price, 2)
        }
    except Exception as e:
        print(f"Error in price calculation: {str(e)}")
        return {"error": str(e)}

def get_materials():
    """Get materials from file or return defaults if file doesn't exist"""
    if os.path.exists(MATERIALS_FILE):
        try:
            with open(MATERIALS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e: # Catch specific exceptions if possible
            print(f"Error reading materials file {MATERIALS_FILE}: {e}")
            return DEFAULT_MATERIALS # Fallback to defaults on error
    else:
        # Create the default materials file if it doesn't exist in the config volume
        print(f"Materials file not found at {MATERIALS_FILE}, creating default.")
        try:
            with open(MATERIALS_FILE, 'w') as f:
                json.dump(DEFAULT_MATERIALS, f, indent=2)
            return DEFAULT_MATERIALS
        except Exception as e:
            print(f"Error creating default materials file {MATERIALS_FILE}: {e}")
            return DEFAULT_MATERIALS # Fallback

def save_materials(materials_data):
    """Save materials to file"""
    try:
        # Ensure the directory exists (though it should due to volume mount)
        os.makedirs(os.path.dirname(MATERIALS_FILE), exist_ok=True)
        with open(MATERIALS_FILE, 'w') as f:
            json.dump(materials_data, f, indent=2)
        # Add explicit log message after successful write
        print(f"Successfully wrote updated data to {MATERIALS_FILE} inside container.")
        return True
    except Exception as e:
        print(f"Error saving materials file {MATERIALS_FILE}: {e}")
        return False

# --- Catalog Data Handling (NEW) ---
def get_catalog():
    """Get catalog data from file or return defaults if file doesn't exist"""
    if os.path.exists(CATALOG_FILE):
        try:
            with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
                if not content:
                    print(f"Catalog file is empty at {CATALOG_FILE}, returning default.")
                    return DEFAULT_CATALOG
                return json.loads(content)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {CATALOG_FILE}. File might be corrupted. Returning default.")
            return DEFAULT_CATALOG
        except Exception as e:
            print(f"Error reading catalog file {CATALOG_FILE}: {e}. Returning default.")
            return DEFAULT_CATALOG
    else:
        # Create the default catalog file if it doesn't exist in the config volume
        print(f"Catalog file not found at {CATALOG_FILE}, creating default.")
        try:
            with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
                json.dump(DEFAULT_CATALOG, f, indent=2)
            return DEFAULT_CATALOG
        except Exception as e:
            print(f"Error creating default catalog file {CATALOG_FILE}: {e}")
            return DEFAULT_CATALOG # Fallback

def save_catalog(catalog_data):
    """Save catalog data to file"""
    try:
        # Basic validation
        if not isinstance(catalog_data, dict) or 'categories' not in catalog_data or 'products' not in catalog_data:
             print(f"Invalid catalog data format received for saving: {catalog_data}")
             return False
        if not isinstance(catalog_data['categories'], list) or not isinstance(catalog_data['products'], list):
             print(f"Invalid data type for categories or products in catalog data: {type(catalog_data.get('categories'))}, {type(catalog_data.get('products'))}")
             return False

        # Ensure the directory exists (though it should due to volume mount)
        os.makedirs(os.path.dirname(CATALOG_FILE), exist_ok=True)
        with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(catalog_data, f, indent=2)
        print(f"Successfully wrote updated catalog data to {CATALOG_FILE} inside container.")
        return True
    except Exception as e:
        print(f"Error saving catalog file {CATALOG_FILE}: {e}")
        traceback.print_exc() # Print full traceback for debugging
        return False

def process_jobs():
    """Background thread to process jobs from the queue"""
    while True:
        try:
            job_id = job_queue.get(timeout=1)
            job = jobs[job_id]

            if job["status"] == "pending":
                jobs[job_id]["status"] = "processing"
                try:
                    # Construct full path to the uploaded file (still needed for existence check)
                    uploaded_file_path = os.path.join(UPLOAD_FOLDER, job["filename"])
                    if not os.path.exists(uploaded_file_path):
                        raise FileNotFoundError(f"Uploaded file not found: {uploaded_file_path}")

                    # Run slicing script - PASS ONLY THE FILENAME
                    fill_density = job.get("fill_density", get_materials()["global_settings"]["default_fill_density"])
                    enable_supports = "1" if job.get("enable_supports", True) else "0"

                    # Pass only the relative filename (job["filename"]) to slice_model.py
                    result = subprocess.run(
                        ["python3", "/app/slice_model.py", job["filename"], str(fill_density), enable_supports],
                        capture_output=True,
                        text=True,
                        cwd="/app" # Keep cwd as /app if slice_model.py expects it
                    )

                    if result.returncode != 0:
                        jobs[job_id]["status"] = "failed"
                        jobs[job_id]["error"] = result.stderr
                    else:
                        slice_result = json.loads(result.stdout)
                        if "error" in slice_result:
                            jobs[job_id]["status"] = "failed"
                            jobs[job_id]["error"] = slice_result["error"]
                        else:
                            # --- Files remain in UPLOAD_FOLDER after slicing ---
                            gcode_filename = os.path.splitext(job["filename"])[0] + ".gcode"
                            gcode_output_path = os.path.join(UPLOAD_FOLDER, gcode_filename)

                            print(f"Slicing successful for job {job_id}. Files remain in {UPLOAD_FOLDER}.")

                            # Store gcode filename if it exists
                            if os.path.exists(gcode_output_path):
                                 print(f"Gcode file found at {gcode_output_path}.")
                                 job["gcode_filename"] = gcode_filename
                            else:
                                 print(f"Gcode file {gcode_output_path} not found after slicing.")
                                 job.pop("gcode_filename", None) # Remove if it doesn't exist

                            # Filepath remains pointing to UPLOAD_FOLDER
                            job["filepath"] = uploaded_file_path # Already set during upload, confirm it's correct

                            # Calculate price
                            print("Calculating price...")
                            price_info = calculate_price(
                                job["material_id"],
                                job["color_id"],
                                slice_result["filament_used_g"],
                                slice_result["estimated_time"],
                                job.get("enable_supports", True),
                                job.get("quality_id", "standard"),
                                slice_result.get("volume_cm3")
                            )
                            print("Price calculated.")

                            # Update status to completed and add result
                            print(f"Updating job {job_id} status to completed.")
                            jobs[job_id]["status"] = "completed"
                            jobs[job_id]["result"] = {
                                **slice_result,
                                "price_info": price_info
                            }
                            print(f"Job {job_id} status updated.")

                except Exception as e:
                    jobs[job_id]["status"] = "failed"
                    jobs[job_id]["error"] = str(e)

            job_queue.task_done()
        except queue.Empty:
            pass
        except Exception as e:
            print(f"Error in job processing loop: {str(e)}")
            time.sleep(1)

# Start the background processing thread
def ensure_processing_thread():
    global processing_thread
    with processing_lock:
        if processing_thread is None or not processing_thread.is_alive():
            processing_thread = threading.Thread(target=process_jobs, daemon=True)
            processing_thread.start()

# --- Authentication Decorator ---
def check_auth(username, password):
    """Check if a username/password combination is valid."""
    return username == ADMIN_CREDENTIALS["username"] and password == ADMIN_CREDENTIALS["password"]

def authenticate():
    """Sends a 401 response that enables basic auth."""
    return jsonify({"error": "Authentication required"}), 401, {'WWW-Authenticate': 'Basic realm="Login Required"'}

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated
# --- End Authentication ---

@app.route("/api/upload", methods=["POST"])
def upload_file():
    """Upload a 3D model file and queue it for processing"""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not allowed. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    if request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024)}MB"}), 400
    
    # Generate a unique filename
    original_filename = secure_filename(file.filename)
    unique_suffix = uuid.uuid4()
    base, ext = os.path.splitext(original_filename)
    # Keep unique id separate for easier association later if needed
    unique_filename = f"{unique_suffix}_{original_filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    # Save the file to the UPLOAD_FOLDER
    file.save(file_path)
    print(f"File saved to: {file_path}") # Log save location

    # Handle 3MF conversion if necessary (outputting STL to UPLOAD_FOLDER)
    converted_stl_filename = None
    if unique_filename.lower().endswith('.3mf'):
        # Modify convert_3mf_to_stl to save STL in UPLOAD_FOLDER
        # For now, assume it saves next to the 3mf, then move it
        temp_stl_path = os.path.splitext(file_path)[0] + ".stl"
        converted_stl_filename_base = f"{unique_suffix}_{base}.stl"
        final_stl_path = os.path.join(UPLOAD_FOLDER, converted_stl_filename_base)

        # Call PrusaSlicer for conversion
        try:
            result = subprocess.run(
                ["prusa-slicer", "--export-stl", file_path, "--output", final_stl_path],
                capture_output=True, text=True, check=True
            )
            print(f"Successfully converted {unique_filename} to {converted_stl_filename_base}")
            # Update filename to use the converted STL for slicing job
            unique_filename = converted_stl_filename_base
            # Optionally remove the original 3MF from UPLOAD_FOLDER
            # os.remove(file_path)
        except subprocess.CalledProcessError as e:
            print(f"Error converting 3MF to STL: {e.stderr}", file=sys.stderr)
            # Clean up original upload if conversion fails
            # os.remove(file_path)
            return jsonify({"error": "Failed to convert 3MF file to STL"}), 500
        except Exception as e:
            print(f"Exception during 3MF conversion: {str(e)}", file=sys.stderr)
            # os.remove(file_path)
            return jsonify({"error": "Failed to convert 3MF file to STL"}), 500

    # Create a job
    job_id = str(uuid.uuid4())
    material_id = request.form.get("material_id", "pla")
    color_id = request.form.get("color_id", "white")
    quality_id = request.form.get("quality_id", "standard")
    fill_density = float(request.form.get("fill_density", get_materials()["global_settings"]["default_fill_density"]))
    enable_supports = request.form.get("enable_supports", "true").lower() == "true"
    
    job = {
        "id": job_id,
        "filename": unique_filename, # The file to be processed (STL or original)
        "original_upload_filename": original_filename, # User's original file name
        "filepath": os.path.join(UPLOAD_FOLDER, unique_filename), # Initial path
        "status": "pending",
        "created_at": time.time(),
        "material_id": material_id,
        "color_id": color_id,
        "quality_id": quality_id,
        "fill_density": fill_density,
        "enable_supports": enable_supports
    }

    jobs[job_id] = job
    job_queue.put(job_id)

    ensure_processing_thread()

    return jsonify({
        "job_id": job_id,
        "status": "pending",
        "message": "File uploaded and queued for processing"
    })

@app.route("/api/job/<job_id>", methods=["GET"])
def get_job_status(job_id):
    """Get the status of a job"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    return jsonify(jobs[job_id])

@app.route("/api/materials", methods=["GET"])
def get_materials_endpoint():
    """Get all materials"""
    return jsonify(get_materials())

@app.route("/api/materials", methods=["POST"])
@requires_auth # Add authentication
def update_materials():
    """Update materials (admin only)"""
    try:
        materials_data = request.json
        if save_materials(materials_data):
             return jsonify({"success": True, "message": "Materials updated successfully CHANGEDDD"})
        else:
             return jsonify({"success": False, "message": "Failed to save materials file"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# --- Catalog API Endpoints (NEW) ---
@app.route("/api/catalog", methods=["GET"])
def get_catalog_endpoint():
    """Get all catalog data (categories and products)"""
    return jsonify(get_catalog())

@app.route("/api/catalog", methods=["POST"])
@requires_auth # Protect this endpoint
def update_catalog():
    """Update catalog data (admin only)"""
    try:
        catalog_data = request.json
        if save_catalog(catalog_data):
             return jsonify({"success": True, "message": "Catalog updated successfully."})
        else:
             # save_catalog prints the error, return a generic server error
             return jsonify({"success": False, "message": "Failed to save catalog file on server."}), 500
    except Exception as e:
        # Catch potential errors during request processing
        print(f"Error processing update_catalog request: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/api/file/<job_id>/<file_type>", methods=["GET"])
# Potentially add @requires_auth depending on access needs
def get_file_for_job(job_id, file_type):
    """Get a specific file type (model, gcode) for a given job"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404

    job = jobs[job_id]
    file_path = None
    filename_to_serve = None

    # Determine the correct folder based on job status
    current_folder = UPLOAD_FOLDER
    if job["status"] == "approved" or job["status"] == "ordered": # Assuming 'ordered' is a potential status
        current_folder = ORDERS_FOLDER
    elif job["status"] == "completed" or job["status"] == "rejected": # Completed but not approved stays in quoted
        current_folder = QUOTED_FOLDER
    # else: stays in UPLOAD_FOLDER (pending, processing, failed)

    if file_type == "model":
        # Serve the file that was processed (could be original or converted STL)
        filename_to_serve = job.get("filename")
        if filename_to_serve:
             file_path = os.path.join(current_folder, filename_to_serve)
    elif file_type == "gcode":
        # Serve the gcode file if it exists for the job
        filename_to_serve = job.get("gcode_filename")
        if filename_to_serve:
            file_path = os.path.join(current_folder, filename_to_serve)
    # Add other file types if needed (e.g., 'original_upload')

    if not file_path or not filename_to_serve:
        return jsonify({"error": f"File type '{file_type}' not available for this job"}), 404

    if not os.path.exists(file_path):
        # Fallback check in case status/location mismatch (shouldn't happen ideally)
        print(f"Warning: File {file_path} not found in expected location for job {job_id} status {job['status']}. Searching other locations.")
        # Add fallback search logic if necessary, e.g., check all potential folders
        return jsonify({"error": "File not found in expected location"}), 404

    # Serve the file with its original upload name for user convenience
    download_name = job.get("original_upload_filename")
    if file_type == "gcode" and filename_to_serve:
        download_name = filename_to_serve # Serve gcode with its actual name

    return send_file(file_path, as_attachment=True, download_name=download_name)

@app.route("/api/jobs", methods=["GET"])
@requires_auth # Add authentication
def get_all_jobs():
    """Get all jobs (admin only)"""
    return jsonify(list(jobs.values()))

@app.route("/api/job/<job_id>/approve", methods=["POST"])
@requires_auth # Add authentication
def approve_job(job_id):
    """Approve a job for printing (admin only), move files to orders folder"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404

    job = jobs[job_id]
    if job["status"] != "quoted":
        return jsonify({"error": f"Job must be in 'quoted' status to approve (current: {job['status']})"}), 400

    # --- Move files from quoted to orders --- START
    current_model_path = os.path.join(QUOTED_FOLDER, job["filename"])
    ordered_model_path = os.path.join(ORDERS_FOLDER, job["filename"])
    current_gcode_path = None
    ordered_gcode_path = None
    gcode_filename = job.get("gcode_filename")
    if gcode_filename:
        current_gcode_path = os.path.join(QUOTED_FOLDER, gcode_filename)
        ordered_gcode_path = os.path.join(ORDERS_FOLDER, gcode_filename)

    try:
        if os.path.exists(current_model_path):
            shutil.move(current_model_path, ordered_model_path)
            print(f"Moved {job['filename']} to orders folder.")
            job["filepath"] = ordered_model_path # Update filepath
        else:
             print(f"Warning: Model file {current_model_path} not found in quoted folder during approval.")
             # Decide if this is critical - should approval fail?

        if gcode_filename and current_gcode_path and os.path.exists(current_gcode_path):
            shutil.move(current_gcode_path, ordered_gcode_path)
            print(f"Moved {gcode_filename} to orders folder.")
        elif gcode_filename:
            print(f"Warning: Gcode file {current_gcode_path} not found in quoted folder during approval.")

    except Exception as move_err:
        print(f"Error moving files for job {job_id} to orders folder: {move_err}")
        # Potentially revert any partial moves or just log the error
        return jsonify({"error": f"Failed to move files to orders folder: {move_err}"}), 500
    # --- Move files from quoted to orders --- END

    # Update job status
    jobs[job_id]["status"] = "approved"
    jobs[job_id]["approved_at"] = time.time()

    return jsonify({
        "success": True,
        "message": "Job approved for printing, files moved to orders folder.",
        "job": jobs[job_id]
    })

@app.route("/api/job/<job_id>/reject", methods=["POST"])
@requires_auth # Add authentication
def reject_job(job_id):
    """Reject a job (admin only)"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    # Update job status
    jobs[job_id]["status"] = "rejected"
    jobs[job_id]["rejected_at"] = time.time()
    
    return jsonify({
        "success": True,
        "message": "Job rejected",
        "job": jobs[job_id]
    })

# --- File Serving ---
@app.route("/api/file/<filename>", methods=["GET", "HEAD"])
def get_file(filename):
    """Serve a model or gcode file based on its expected location (job status dependent)."""
    filename = secure_filename(filename)
    found_path = None
    source_folder = "Unknown"

    # Determine potential job based on filename (less reliable, better to use job_id if possible)
    # This endpoint might need redesign if filename alone isn't unique enough or status is needed.
    # For now, we check folders in a specific order.

    # 1. Check ORDERS_FOLDER (Approved/Ordered jobs)
    orders_path = os.path.join(ORDERS_FOLDER, filename)
    if os.path.exists(orders_path):
        found_path = orders_path
        source_folder = "ORDERS"

    # 2. Check QUOTED_FOLDER (Jobs added to cart)
    if not found_path:
        quoted_path = os.path.join(QUOTED_FOLDER, filename)
        if os.path.exists(quoted_path):
            found_path = quoted_path
            source_folder = "QUOTED"

    # 3. Check UPLOAD_FOLDER (Pending/Processing/Completed/Failed jobs)
    if not found_path:
        upload_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(upload_path):
            found_path = upload_path
            source_folder = "UPLOAD"

    # Serve the file if found
    if found_path:
        print(f"Serving file {filename} from {source_folder} folder: {found_path}")
        try:
            return send_file(found_path, as_attachment=False)
        except Exception as e:
            print(f"Error sending file {found_path}: {e}")
            return jsonify({"error": "Error sending file"}), 500
    else:
        # If file not found in any location
        print(f"File not found in ORDERS, QUOTED, or UPLOAD folder: {filename}")
        return jsonify({"error": "File not found"}), 404

# --- New Endpoint to move files when added to cart ---
@app.route("/api/job/<job_id>/add-to-cart", methods=["POST"])
# Consider adding @requires_auth if cart actions should be restricted
def add_job_to_cart(job_id):
    """Moves job files from uploaded to quoted folder, updates status."""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404

    job = jobs[job_id]
    if job["status"] != "completed":
        # Only allow adding completed jobs to cart
        return jsonify({"error": f"Job status must be 'completed' to add to cart (current: {job['status']})"}), 400

    print(f"Adding job {job_id} to cart. Moving files...")

    current_model_path = os.path.join(UPLOAD_FOLDER, job["filename"])
    quoted_model_path = os.path.join(QUOTED_FOLDER, job["filename"])
    current_gcode_path = None
    quoted_gcode_path = None
    gcode_filename = job.get("gcode_filename")

    if gcode_filename:
        current_gcode_path = os.path.join(UPLOAD_FOLDER, gcode_filename)
        quoted_gcode_path = os.path.join(QUOTED_FOLDER, gcode_filename)

    try:
        # Move model file
        if os.path.exists(current_model_path):
            shutil.move(current_model_path, quoted_model_path)
            print(f"Moved model {job['filename']} to quoted folder.")
            job["filepath"] = quoted_model_path # Update filepath
        else:
             print(f"Warning: Model file {current_model_path} not found in upload folder during add-to-cart.")
             # Fail the request if the main model file is missing
             return jsonify({"error": "Model file missing, cannot add to cart."}), 500

        # Move gcode file if it exists
        if gcode_filename and current_gcode_path and os.path.exists(current_gcode_path):
            shutil.move(current_gcode_path, quoted_gcode_path)
            print(f"Moved gcode {gcode_filename} to quoted folder.")
        elif gcode_filename:
            print(f"Warning: Gcode file {current_gcode_path} not found in upload folder during add-to-cart.")

        # Update job status to 'quoted' (or 'carted')
        jobs[job_id]["status"] = "quoted"
        jobs[job_id]["added_to_cart_at"] = time.time() # Optional timestamp
        print(f"Updated job {job_id} status to quoted.")

        return jsonify({
            "success": True,
            "message": "Job added to cart, files moved to quoted folder.",
            "job": jobs[job_id] # Return updated job info
        })

    except Exception as move_err:
        print(f"Error moving files for job {job_id} during add-to-cart: {move_err}")
        traceback.print_exc()
        # Attempt to revert status if move failed? Complex. For now, just report error.
        # Consider leaving status as 'completed' if move fails.
        return jsonify({"error": f"Failed to move files to quoted folder: {move_err}"}), 500

if __name__ == "__main__":
    # Initialize materials if needed (now checks config path)
    if not os.path.exists(MATERIALS_FILE):
        print(f"Materials file not found at {MATERIALS_FILE}, creating default.")
        try:
            with open(MATERIALS_FILE, 'w') as f:
                json.dump(DEFAULT_MATERIALS, f, indent=2)
        except Exception as e:
            print(f"Error creating default materials file on startup: {e}")

    # Initialize catalog if needed (NEW)
    get_catalog() # This function now handles creation/defaults

    # Initialize auth file if needed
    load_credentials() # This will create it if it doesn't exist

    app.run(host="0.0.0.0", port=5000)
