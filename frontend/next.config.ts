import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [40, 60, 85],
  },
};

export default nextConfig;
