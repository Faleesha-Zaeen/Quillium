// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase Server Actions body size limit
  serverActions: {
    bodySizeLimit: '10mb',
  },
  
  // Also set API limits
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  
  // If you're using experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Disable source maps in development if they're causing issues
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig