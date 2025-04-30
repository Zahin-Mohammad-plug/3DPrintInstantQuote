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
│── prusa-slicer-server/    # Backend (Flask API + PrusaSlicer)
│   ├── Dockerfile          # Docker configuration for the backend
│   ├── server.py           # Flask API with enhanced features
│   ├── slice_model.py      # Slicing logic and model processing
│   ├── requirements.txt    # Python dependencies
│── frontend/               # Frontend (Next.js)
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

## Prerequisites
- Docker and Docker Compose
- Node.js (v16+) & npm (for Next.js frontend)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 3DPrintInstantQuote
   ```

2. Install dependencies (Docker, Python, Node.js):
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. Set up Python virtual environment and install all dependencies:
   ```bash
   make install
   ```
   
   This will:
   - Create a Python virtual environment
   - Install Python dependencies in the virtual environment
   - Install Node.js dependencies for the frontend

4. Start the backend server:
   ```bash
   make backend
   ```

5. Start the frontend development server:
   ```bash
   make frontend
   ```
   
   Alternatively, start both with a single command:
   ```bash
   make start
   ```

6. Open http://localhost:3000 to use the web interface.

## Using the Makefile

The project includes a Makefile with several useful commands:

- `make help` - Display available commands
- `make install` - Install all dependencies
- `make setup-venv` - Set up Python virtual environment
- `make backend` - Start the backend server
- `make frontend` - Start the frontend development server
- `make start` - Start both backend and frontend
- `make stop` - Stop all services
- `make restart` - Restart all services
- `make clean` - Remove virtual environment and temporary files

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
Stlying
* Change icon (in top left of page) to frontend\public\placeholder-logo.png
* Color in cart is the hex code not the name. 

Functionality
*Fix the error model not loading for STL 
* Properly connect backend and front end
   In quote page, ensure the modifiers update the unit price
   * If the quantity is adjusted so that the cost estimation exceeds the base price, ignore the base price. Basically creating a minimum order cost. 
   * In admin panel, update the modifiers impacts
* Fix the checkout page to actually email me
* Listings arent updating when adjusted in the admin panel, the colors arent accurate. 
* Categories arent updated either, no ability to update the image through UI as well., 
* Allow .3mf files to be uploaded and quoted
* Customize page showing colors not available and not updating when colors are added
* Special filaments have no way to edit in the admin page and unable to adjust its properties.

* Ask perplexity  

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
