# Updates and Integration Guide

## April 30, 2025

- **Refactored Startup & Installation Scripts:**
    - Consolidated Linux and WSL scripts.
    - Created separate, robust installation scripts for Windows (`install-windows.bat`) and Linux/WSL (`install.sh`).
    - Organized OS-specific implementation scripts into `scripts/windows/` and `scripts/linux/`.
    - Removed outdated `Makefile` and redundant scripts.
    - Ensured frontend dependencies are installed using `--legacy-peer-deps` to resolve conflicts.
    - Added `dos2unix` step to Linux/WSL setup for compatibility when cloning on Windows.
- **Updated README:**
    - Added clear, separate instructions for Windows and Linux/WSL setup and execution.
    - Updated the project structure documentation.
    - Removed references to outdated scripts and `Makefile`.

## March 2025 Updates

### Client-Side 3D Model Rendering

The frontend has been updated to support client-side 3D model rendering:

- Added STL file rendering using Three.js STLLoader
- Implemented client-side model conversion and normalization
- Added fallback model display for unsupported formats
- Improved error handling for model loading failures

### UI and UX Improvements

- Updated the model viewer component to handle various file formats
- Fixed container styling in Tailwind configuration
- Hidden print details in the quote page to focus on price information
- Improved error handling throughout the application

### Bug Fixes

- Fixed cart functionality to handle null/undefined prices
- Fixed error in cart-icon.tsx when displaying items with missing prices
- Fixed price calculation in quote page to properly apply modifiers
- Fixed NaN values in unit price display
- Fixed "Add to Cart" button to work with free items (price = 0)
- Fixed TypeScript errors with null jobId values
- Improved model viewer error handling
- Fixed styling issues with container class
- Fixed admin pricing manager to save settings to backend
- Fixed quality modifiers to be loaded from backend settings

### UI Improvements

- Added loading state to model viewer to indicate when models are being converted
- Improved model viewer to check file availability before displaying
- Added automatic retry mechanism for model loading
- Changed Print Quality selector to use a collapsible component as originally designed
- Added support for OBJ file format in the model viewer
- Added note about 3MF support (requires server-side conversion)

## Frontend-Backend Integration

The frontend has been updated to connect to the backend API for real-time 3D model processing and quote generation. Here's what has been implemented:

### API Service Layer

A new API service layer has been created in `frontend/services/api.ts` that provides functions for:
- Uploading 3D models to the backend
- Fetching job status and results
- Getting materials and colors from the backend
- Submitting orders


### File Upload Integration

The file uploader component now uploads files directly to the backend API and tracks the upload progress. After uploading, it stores the job ID in session storage for tracking throughout the application.

### Real-time Quote Generation

The quote page now fetches real pricing information from the backend based on:
- Actual material usage calculated by PrusaSlicer
- Estimated print time
- Selected material and color options
- Quality settings

### Environment Configuration

A `.env.local` file has been added to configure the API URL for different environments:
- Local development: http://localhost:5000
- Cloudflare Tunnel: https://your-subdomain.your-domain.com/api
- Linode deployment: https://your-linode-ip-or-domain.com/api

## Deployment Options

### Local Development with Cloudflare Tunnel

1. Start the backend and frontend:
   ```bash
   ./start-all.sh
   ```

2. Set up a Cloudflare tunnel:
   ```bash
   cloudflared tunnel create 3dprintquote
   cloudflared tunnel route dns 3dprintquote your-subdomain.your-domain.com
   cloudflared tunnel run --url http://localhost:3000 3dprintquote
   ```

3. Update the `.env.local` file to use your Cloudflare tunnel URL.

### Linode Deployment

1. Set up a Linode server with Docker and Docker Compose.

2. Clone the repository and start the application:
   ```bash
   git clone <repository-url>
   cd 3DPrintInstantQuote
   ./start-all.sh
   ```

3. Update the `.env.local` file to use your Linode server's IP or domain.

## Configuration

### Backend API URL

The backend API URL is configured in the `.env.local` file. Update this file to match your deployment environment:

```
# For local development
NEXT_PUBLIC_API_URL=http://localhost:5000

# For Cloudflare Tunnel
# NEXT_PUBLIC_API_URL=https://your-subdomain.your-domain.com/api

# For Linode deployment
# NEXT_PUBLIC_API_URL=https://your-linode-ip-or-domain.com/api
```

## Troubleshooting

### CORS Issues

If you encounter CORS issues when connecting to the backend, make sure the backend's CORS configuration allows requests from your frontend's origin. The backend already has CORS enabled, but you may need to update the allowed origins.

### API Connection Issues

If the frontend cannot connect to the backend API:

1. Check that the backend server is running:
   ```bash
   docker ps
   ```

2. Verify the API URL in `.env.local` is correct.

3. Check the browser console for any error messages.

4. Try accessing the API directly in your browser (e.g., http://localhost:5000/api/materials) to verify it's responding.
