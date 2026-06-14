import { fileURLToPath } from "url";
import { dirname } from "path";

/** @type {import('next').NextConfig} */

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "standalone",

  // Avoid dev double-mount firing every fetch effect twice.
  reactStrictMode: false,

  allowedDevOrigins: ["e422-203-147-134-26.ngrok-free.app"],

  typescript: {
    ignoreBuildErrors: true,
  },

  trailingSlash: false,

  turbopack: {
    root: __dirname,
  },

  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
