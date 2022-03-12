/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    BACKEND_API: process.env.BACKEND_API
  }
}

module.exports = nextConfig
