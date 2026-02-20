import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Static export only in production builds — dev server needs rewrites for API proxy
  ...(isDev ? {} : { output: "export" }),
  images: {
    unoptimized: true,
  },
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: "/api-proxy/:path*",
              destination: "http://localhost:3001/:path*",
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
