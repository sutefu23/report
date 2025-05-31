/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  experimental: {
    // Enable type checking in development
    typedRoutes: true,
  },
}
