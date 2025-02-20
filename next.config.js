/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        'images.unsplash.com',
        'avatars.githubusercontent.com',
        // Add other image domains you need
      ],
    },
    // If you're using experimental features, add them here
    experimental: {
      // serverActions: true,
      // typedRoutes: true,
    },
  }
  
  module.exports = nextConfig