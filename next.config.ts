import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all localtunnel and local IP host headers in development
  allowedDevOrigins: [
    "*.loca.lt",
    "localhost:3001",
    "localhost:3000",
    "192.168.0.7:3001",
    "192.168.0.7:3000",
    "127.0.0.1:3001",
    "127.0.0.1:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
