import type { NextConfig } from "next";

const corsOrigin = [{ key: "Access-Control-Allow-Origin", value: "*" }];
const acceptVary = [{ key: "Vary", value: "Accept" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/.well-known/:path*", headers: corsOrigin },
      { source: "/openapi.json", headers: corsOrigin },
      { source: "/", headers: acceptVary },
      { source: "/docs", headers: acceptVary },
      { source: "/sounds", headers: acceptVary },
      { source: "/roadmap", headers: acceptVary },
    ];
  },
};

export default nextConfig;
