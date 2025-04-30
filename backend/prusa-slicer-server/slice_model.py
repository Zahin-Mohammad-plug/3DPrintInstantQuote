import subprocess
import sys
import re
import json
import os
import traceback
import shutil

# Enable debug mode? (1 = on, 0 = off)
DEBUG = 1

def debug_print(msg):
    if DEBUG:
        print(f"[DEBUG] {msg}", file=sys.stderr)

try:
    # Command-line arguments:
    # sys.argv[1] = STL filename
    # sys.argv[2] = Fill density (default: 0.15)
    # sys.argv[3] = Enable supports (default: 0 = off, 1 = on)

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing filename argument"}))
        sys.exit(1)

    # Get file extension
    filename = sys.argv[1]
    file_ext = os.path.splitext(filename)[1].lower()
    
    MODEL_FILE = "/app/shared/" + filename  # STL/3MF file path
    GCODE_FILE = os.path.splitext(MODEL_FILE)[0] + ".gcode"
    PROFILE_FILE = "/app/shared/prusaslicer-config/x1c.ini"
    
    # Check if the file exists and is accessible
    if not os.path.exists(MODEL_FILE):
        debug_print(f"Model file not found: {MODEL_FILE}")
        # Check if there's a converted version (for 3MF files that were converted to STL)
        original_base = os.path.splitext(MODEL_FILE)[0]
        potential_stl = original_base + ".stl"
        if os.path.exists(potential_stl):
            debug_print(f"Found converted STL file: {potential_stl}")
            MODEL_FILE = potential_stl
            GCODE_FILE = os.path.splitext(MODEL_FILE)[0] + ".gcode"
        else:
            print(json.dumps({"error": f"File not found: {MODEL_FILE}"}))
            sys.exit(1)

    # Get optional arguments
    FILL_DENSITY = sys.argv[2] if len(sys.argv) > 2 else "0.15" 
    ENABLE_SUPPORTS = "--support-material-auto" if (len(sys.argv) > 3 and sys.argv[3] == "1") else ""

    debug_print(f"Processing file: {MODEL_FILE}")
    debug_print(f"Using fill density: {FILL_DENSITY}")
    debug_print(f"Support material enabled: {ENABLE_SUPPORTS != ''}")

    # Check if file exists
    if not os.path.exists(MODEL_FILE):
        print(json.dumps({"error": f"File not found: {MODEL_FILE}"}))
        sys.exit(1)

    # Maximum build size for Bambu Lab X1C
    MAX_DIMENSION = 256.0  # Max print size in mm

    # Run PrusaSlicer to get model dimensions
    info_cmd = ["prusa-slicer", "--info", MODEL_FILE]
    debug_print(f"Running info command: {' '.join(info_cmd)}")
    info_result = subprocess.run(info_cmd, capture_output=True, text=True)

    if info_result.returncode != 0:
        debug_print(f"Info command error: {info_result.stderr}")
        print(json.dumps({"error": "Failed to get model information"}))
        sys.exit(1)

    # Extract size values
    size_match = re.search(r"size_x = (.+?)\nsize_y = (.+?)\nsize_z = (.+?)\n", info_result.stdout)
    if size_match:
        size_x, size_y, size_z = map(float, size_match.groups())
        debug_print(f"Model size: X={size_x}mm, Y={size_y}mm, Z={size_z}mm")
        
        # Check if any dimension exceeds the limit
        if size_x > MAX_DIMENSION or size_y > MAX_DIMENSION or size_z > MAX_DIMENSION:
            print(json.dumps({
                "error": "Model is too large to print",
                "size_x": size_x,
                "size_y": size_y,
                "size_z": size_z,
                "max_dimension": MAX_DIMENSION
            }))
            sys.exit(1)  # Exit script
    else:
        debug_print(f"Could not extract size from output: {info_result.stdout}")
        print(json.dumps({"error": "Could not determine model dimensions"}))
        sys.exit(1)

    # Run slicing with custom settings
    slicing_cmd = [
        "prusa-slicer", 
        "--load", PROFILE_FILE, 
        "--fill-density", str(FILL_DENSITY),  # Use decimal format
        "--export-gcode",
        "--output", GCODE_FILE
    ]

    # Add support material flags (must be before the STL file)
    if ENABLE_SUPPORTS:
        slicing_cmd.append("--support-material")
        slicing_cmd.append("--support-material-auto")

    # Finally, add the STL file to be sliced
    slicing_cmd.append(MODEL_FILE)

    debug_print(f"Slicing command: {' '.join(slicing_cmd)}")

    slicing_result = subprocess.run(slicing_cmd, capture_output=True, text=True)

    # Check if slicing failed
    if slicing_result.returncode != 0:
        debug_print(f"Slicing error: {slicing_result.stderr}")
        print(json.dumps({"error": f"Slicing failed: {slicing_result.stderr}"}))
        sys.exit(1)

    # Extract filament usage & print time from G-code
    filament_used = 0.0
    print_time = "Unknown"
    has_supports = False

    try:
        with open(GCODE_FILE, "r") as gcode:
            for line in gcode:
                if "; total filament used [g] =" in line:
                    filament_used = float(line.split("=")[1].strip())
                elif "; estimated printing time" in line:
                    print_time = line.split("=")[1].strip()
                elif "support" in line.lower() and "generated" in line.lower():
                    has_supports = True
    except Exception as e:
        debug_print(f"Error reading G-code file: {str(e)}")
        print(json.dumps({"error": f"Error reading G-code file: {str(e)}"}))
        sys.exit(1)

    debug_print(f"Filament used: {filament_used}g")
    debug_print(f"Estimated print time: {print_time}")
    debug_print(f"Has supports: {has_supports}")

    # Return JSON response
    print(json.dumps({
        "success": True,
        "filament_used_g": filament_used,
        "estimated_time": print_time,
        "has_supports": has_supports,
        "size": {
            "x": size_x,
            "y": size_y,
            "z": size_z
        },
        "volume_cm3": (size_x * size_y * size_z) / 1000.0,  # Convert mm³ to cm³
        "fill_density": float(FILL_DENSITY)
    }))

except Exception as e:
    error_details = traceback.format_exc()
    debug_print(f"Unexpected error: {str(e)}\n{error_details}")
    print(json.dumps({"error": f"Unexpected error: {str(e)}"}))
    sys.exit(1)
