import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  // Behind Caddy/HTTPS reverse proxy — trust Host / forwarded headers
  experimental: {
    serverActions: {
      allowedOrigins: [serverURL.replace(/^https?:\/\//, "")],
    },
  },
};

export default withPayload(nextConfig);
