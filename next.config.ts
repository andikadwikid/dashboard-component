import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
    domains: ["images.pexels.com"], // ← tambahkan host di sini
  },
};

export default nextConfig;
