import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Codebase typechecks clean (bunx tsc --noEmit) — build fails loudly on type errors.
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  // Dev preview origins served by the sandbox gateway
  allowedDevOrigins: ["preview-chat-55014807-2286-4978-8577-3a07ee884331.space-z.ai", "*.space-z.ai"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
