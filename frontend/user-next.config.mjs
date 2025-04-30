/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static exports
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
};

export default nextConfig;

