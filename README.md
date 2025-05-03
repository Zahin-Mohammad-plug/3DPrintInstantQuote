# 3D Print Instant Quote

## Overview
This project provides a comprehensive system for 3D printing quotes. Users can upload 3D model files (STL, 3MF), preview them in 3D, select materials and colors, and receive instant quotes based on material usage, print time, and other parameters. The backend runs **PrusaSlicer CLI** inside a **Docker container**, and the frontend is built with **Next.js**. The system can be deployed locally with a Cloudflare tunnel or on a Linode server.

## Features
- Upload STL/3MF files through a modern web interface with drag-and-drop
- Interactive 3D preview of models with real-time color application
- Material and color selection with customizable pricing
- Instant quotes based on material usage, print time, and selected options
- Admin panel for managing materials, colors, and print jobs
- Job queue system to prevent server overload
- Automatic rejection of models that exceed the printer's build volume
- Configurable infill density and support generation

## Project Structure
```
3DPrintInstantQuote/
├── backend/
│   └── prusa-slicer-server/    # Backend (Flask API + PrusaSlicer)
├── frontend/
│   ├── app/                # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── services/       # API services for backend communication
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── admin/          # Admin panel pages
│   │   ├── page.tsx        # Main page component
│   │   └── layout.tsx      # Root layout component
│── userModels/             # Shared folder for STL & G-code
│   ├── prusaslicer-config/ # PrusaSlicer configuration files
│── docker-compose.yml      # Docker Compose configuration
│── README.md               # Project documentation
│── Makefile                # Build and run commands
│── start.sh                # Startup script
│── start-all.sh            # Script to start both frontend and backend
│── start-backend.sh        # Script to start backend only
│── start-frontend.sh       # Script to start frontend only
│── linux-backend.sh        # Linux-specific backend startup
│── linux-frontend.sh       # Linux-specific frontend startup
│── windows-backend.bat     # Windows-specific backend startup
│── windows-frontend.bat    # Windows-specific frontend startup
│── wsl-backend.sh          # WSL-specific backend startup
│── wsl-frontend.sh         # WSL-specific frontend startup
```
## Supported Operating Systems

- Windows 10/11
- Linux (Including WSL)

*(Setup instructions are OS-specific below)*

## Windows Installation & Usage

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Make sure it's running)
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Python](https://www.python.org/downloads/) (v3.10 or higher recommended, ensure it's added to PATH)
- [Git](https://git-scm.com/downloads/)

### Setup

1.  **Clone the repository:**
    ```powershell
    git clone <your-repository-url>
    cd 3DPrintInstantQuote
    ```
2.  **Run the Windows installation script:**
    This script checks prerequisites, installs frontend dependencies, and pre-builds the backend Docker image.
    ```powershell
    .\install-windows.bat
    ```
    *(If you encounter issues, check the script's output for details.)*

### Running the Application

You have two options:

**Option 1: Start Everything**

Use the combined start script (requires two separate terminals/tabs):

*   In your terminal:
    ```powershell
    .\start-all-windows.bat 
    ```
    *(This will attempt to launch both backend and frontend, but output might be interleaved. Running separately is often clearer.)*

**Option 2: Start Backend and Frontend Separately (Recommended)**

*   **Terminal 1: Start Backend**
    ```powershell
    .\scripts\windows\backend.bat
    ```
    *(Wait for the Docker container to build and start. Look for "Container started successfully!")*

*   **Terminal 2: Start Frontend**
    ```powershell
    .\scripts\windows\frontend.bat
    ```
    *(Wait for the Next.js server to compile and start. Look for "ready started server on 0.0.0.0:3000")*

### Accessing the App

Once both backend and frontend are running, open your web browser to:
`http://localhost:3000`

## Linux/WSL Installation & Usage

### Prerequisites (for WSL & Debian/Ubuntu-based Linux)

- **WSL:** Ensure you have a WSL distribution installed (e.g., Ubuntu from Microsoft Store).
- **Docker:** 
    - **WSL:** Docker Desktop for Windows with WSL Integration enabled (Recommended) OR Docker installed natively within WSL (`sudo apt install docker.io docker-compose`).
    - **Linux:** Docker Engine and Docker Compose (`sudo apt install docker.io docker-compose`).
- **Node.js:** v18.x recommended (The install script will handle installation via NodeSource).
- **Python:** v3.10+ recommended (`sudo apt install python3 python3-pip python3-venv`).
- **Build Tools:** `sudo apt install build-essential`.
- **Git:** `sudo apt install git`.
- **dos2unix:** `sudo apt install dos2unix` (Needed to fix script line endings if cloned on Windows).

### Setup

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <your-repository-url>
    cd 3DPrintInstantQuote
    ```
2.  **(WSL Only) Navigate to the project directory:**
    Find the path to your project, likely starting with `/mnt/c/` or similar.
    ```bash
    # Example: cd /mnt/c/Users/YourUser/path/to/3DPrintInstantQuote
    cd /mnt/c/Users/Moi/Desktop/GitHub/3DPrintInstantQuote/3DPrintInstantQuote 
    ```
3.  **(If cloned on Windows) Fix script line endings:**
    ```bash
    dos2unix *.sh scripts/linux/*.sh
    ```
4.  **Make scripts executable:**
    ```bash
    chmod +x *.sh scripts/linux/*.sh
    ```
5.  **Run the Linux installation script:**
    This script checks/installs prerequisites, installs frontend dependencies, and pre-builds the backend Docker image. It may ask for your `sudo` password.
    ```bash
    bash install-linux.sh
    ```
    *(If you encounter issues, check the script's output for details.)*

### Running the Application (WSL/Linux)

**Important:** Run the backend and frontend in **separate** WSL/Linux terminal windows/tabs.

*   **Terminal 1: Start Backend**
    ```bash
    bash start-backend-linux.sh
    ```
    *(Wait for the Docker container to build/start. Look for "Container started successfully!")*

*   **Terminal 2: Start Frontend**
    ```bash
    bash start-frontend-linux.sh
    ```
    *(Wait for the Next.js server to compile/start. It should detect WSL and run the appropriate commands. Look for "ready started server on 0.0.0.0:3000")*

### Accessing the App

Once both backend and frontend are running, open your web browser (on Windows) to:
`http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload and process 3D model file |
| GET | /api/job/:id | Get job status and results |
| GET | /api/materials | Get available materials and colors |
| POST | /api/materials | Update materials configuration (admin) |
| GET | /api/jobs | Get all jobs (admin) |
| POST | /api/job/:id/approve | Approve a print job (admin) |
| POST | /api/job/:id/reject | Reject a print job (admin) |

## Frontend Features

The frontend (Next.js) allows users to:
- Upload 3D model files with drag-and-drop functionality
- Preview models in 3D with interactive controls (supports STL, 3MF, and other formats)
- Client-side 3D model conversion and rendering
- Select materials and colors with real-time preview
- Adjust print settings (fill density, supports)
- Receive detailed quotes with price breakdown based on actual material usage and print time
- Add items to cart and proceed to checkout
- Submit print requests for approval

The admin panel allows administrators to:
- Manage materials and their properties
- Add, edit, and remove colors with custom pricing
- Review and approve/reject print jobs
- View detailed job information and pricing

## Deployment Options

### Local Deployment with Cloudflare Tunnel

For local development or small-scale deployment, you can run the application locally and expose it to the internet using a Cloudflare tunnel:

1. Start the backend and frontend:
   ```bash
   ./start-all.sh
   ```

2. Set up a Cloudflare tunnel to expose your local server to the internet:
   ```bash
   cloudflared tunnel create 3dprintquote
   cloudflared tunnel route dns 3dprintquote your-subdomain.your-domain.com
   cloudflared tunnel run --url http://localhost:3000 3dprintquote
   ```

### Linode Deployment

For production deployment, you can host the application on a Linode server:

1. Set up a Linode server with Docker and Docker Compose installed.

2. Clone the repository to your Linode server:
   ```bash
   git clone <repository-url>
   cd 3DPrintInstantQuote
   ```

3. Start the application:
   ```bash
   ./start-all.sh
   ```

4. Configure your domain to point to your Linode server's IP address.

## Recent Updates

### March 2025 Updates
- Added client-side STL file rendering using Three.js STLLoader
- Improved model viewer with better error handling and fallback models
- Fixed cart functionality to handle null/undefined prices
- Updated UI to hide print details and focus on price information
- Fixed container styling in Tailwind configuration
- Improved error handling throughout the application

<!-- TODO! -->
I am working on my 3d printing service website, this codebase has both the frontend and backend
Styling

Catalog page:
* Add pading between footer and end of recommended products.
/catalog/[id]/
* The Filters aren't working; comment out temporarily

Product page
* Share and save page is currently unavailble; comment out temporarily

Upload page:
* Allow .3mf files to be uploaded and quoted
* ALlow .step files to be uploaded and quoted
* Allow oversize items with complex functionality:
    * Save file
    * inform user that this will require custom inquiry for this size of file.
    * Direct to contact page with file attached.


Customize page:
-dimesnsions arent accurate (it's in cm when should be mm) and dont appear until toggling background
* When a special filament is selected, you can still pick a material even if not compatible.
* On first load, the default color doesnt exsist, it should grab the first available color then apply it. 

Quote Page:
* Ensure that the modifiers and notes for the multi-color print is preserved and saved to be submitted when checking out
* Save quote and share are missing fucntionality, will integrate later; comment out for now
* comment out the print details like: "Filament: 
Est. Time: 
Volume: "


Cart Page:
* Most Color's in cart is the hex code not the name, it should always use the stored colors name
* Should havbe a small preview image of the model / the product photo, this may require additional processing (possibly from backend) in order to create the thumbnail; We will implement this later

Checkout page:
* Colors should be the color name, not the hex code
* Material should always be all caps so like PLA
* Should hide navbar
* The navBar will reappear on thank you page or going back
* Fix the checkout page to actually email me and store in the backend. May require additonal backend process to do so.

Admin panel: 
* Pricing: 
    * Add ability to adjust time_cost.
    * Does support material even work?, if not, lets comment out for now
* In filaments -> colors -> manage exsisting colors, allow the ability to edit current colors, similar button like the one in catalog, Manage Categories
* Add upload images for categories and products (mapped to new dirs)
* Set file size and uploaded file types in admin. 

Features:
* Update for SEO
* Ensure uses static export (use client)
    * A rush order fee setting


## Troubleshooting

### Python Virtual Environment Issues

If you encounter errors related to Python virtual environment setup:

```
The virtual environment was not created successfully because ensurepip is not available.
```

Install the required package for your Python version:

```bash
# For general installation
sudo apt install python3-venv

# For specific Python version (e.g., Python 3.12)
sudo apt install python3.12-venv
```

Then run the setup again:

```bash
make setup-venv
```

### Frontend Issues

If you encounter the error "next: command not found" when trying to start the frontend, use the following command instead:

```bash
cd frontend
npx next dev
```

If you see an error about `next.config.ts` not being supported, it's because Next.js only supports JavaScript configuration files. The project has been updated to use `next.config.js` instead, but if you encounter this issue, you can fix it by:

```bash
# Remove the TypeScript config file
rm frontend/next.config.ts

# Create a JavaScript config file
echo '/** @type {import("next").NextConfig} */
const nextConfig = {
  /* config options here */
};

module.exports = nextConfig;' > frontend/next.config.js
```

### Backend Issues

If you have issues with the backend server, check Docker logs:

```bash
docker-compose logs
```

You can also check the container status:

```bash
docker ps -a
```

If the container is not running, you can try to start it manually:

```bash
docker-compose up -d
```

## License
See the LICENSE file for details.
