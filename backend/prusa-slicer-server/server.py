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

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = "/app/shared"  # This should match the UserModels/ directory in Docker
ALLOWED_EXTENSIONS = {'stl', '3mf', 'obj'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB max file size
MATERIALS_FILE = os.path.join(UPLOAD_FOLDER, "materials.json")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Temporary directory for file conversions
TEMP_DIR = os.path.join(UPLOAD_FOLDER, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

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
        except:
            return DEFAULT_MATERIALS
    else:
        # Create the default materials file
        with open(MATERIALS_FILE, 'w') as f:
            json.dump(DEFAULT_MATERIALS, f, indent=2)
        return DEFAULT_MATERIALS

def save_materials(materials_data):
    """Save materials to file"""
    with open(MATERIALS_FILE, 'w') as f:
        json.dump(materials_data, f, indent=2)
    return True

def process_jobs():
    """Background thread to process jobs from the queue"""
    while True:
        try:
            job_id = job_queue.get(timeout=1)
            job = jobs[job_id]
            
            if job["status"] == "pending":
                # Update job status
                jobs[job_id]["status"] = "processing"
                
                try:
                    # Run slicing script
                    fill_density = job.get("fill_density", get_materials()["global_settings"]["default_fill_density"])
                    enable_supports = "1" if job.get("enable_supports", True) else "0"
                    
                    result = subprocess.run(
                        ["python3", "/app/slice_model.py", job["filename"], str(fill_density), enable_supports],
                        capture_output=True,
                        text=True,
                        cwd="/app"
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
                            # Calculate price
                            price_info = calculate_price(
                                job["material_id"],
                                job["color_id"],
                                slice_result["filament_used_g"],
                                slice_result["estimated_time"],
                                job.get("enable_supports", True),
                                job.get("quality_id", "standard"),
                                slice_result.get("volume_cm3")
                            )
                            
                            jobs[job_id]["status"] = "completed"
                            jobs[job_id]["result"] = {
                                **slice_result,
                                "price_info": price_info
                            }
                except Exception as e:
                    jobs[job_id]["status"] = "failed"
                    jobs[job_id]["error"] = str(e)
            
            job_queue.task_done()
        except queue.Empty:
            pass
        except Exception as e:
            print(f"Error in job processing: {str(e)}")
            time.sleep(1)

# Start the background processing thread
def ensure_processing_thread():
    global processing_thread
    with processing_lock:
        if processing_thread is None or not processing_thread.is_alive():
            processing_thread = threading.Thread(target=process_jobs, daemon=True)
            processing_thread.start()

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
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    # Save the file
    file.save(file_path)
    
    # If the file is a 3MF, convert it to STL
    converted_file_path = None
    if file_path.lower().endswith('.3mf'):
        converted_file_path = convert_3mf_to_stl(file_path)
        if converted_file_path:
            # Update the filename to use the converted STL file
            unique_filename = os.path.basename(converted_file_path)
        else:
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
        "filename": unique_filename,
        "original_filename": filename,
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
    
    # Ensure the processing thread is running
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
def update_materials():
    """Update materials (admin only)"""
    try:
        materials_data = request.json
        save_materials(materials_data)
        return jsonify({"success": True, "message": "Materials updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/file/<filename>", methods=["GET"])
def get_file(filename):
    """Get a file by filename"""
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(file_path)

@app.route("/api/jobs", methods=["GET"])
def get_all_jobs():
    """Get all jobs (admin only)"""
    # In a real app, you'd add authentication here
    return jsonify(list(jobs.values()))

@app.route("/api/job/<job_id>/approve", methods=["POST"])
def approve_job(job_id):
    """Approve a job for printing (admin only)"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    if jobs[job_id]["status"] != "completed":
        return jsonify({"error": "Job is not ready for approval"}), 400
    
    # Update job status
    jobs[job_id]["status"] = "approved"
    jobs[job_id]["approved_at"] = time.time()
    
    return jsonify({
        "success": True,
        "message": "Job approved for printing",
        "job": jobs[job_id]
    })

@app.route("/api/job/<job_id>/reject", methods=["POST"])
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

if __name__ == "__main__":
    # Initialize materials if needed
    if not os.path.exists(MATERIALS_FILE):
        with open(MATERIALS_FILE, 'w') as f:
            json.dump(DEFAULT_MATERIALS, f, indent=2)
    
    app.run(host="0.0.0.0", port=5000)
