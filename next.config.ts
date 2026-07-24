import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import { version } from "./package.json";

// --- Informations de version injectées au build -----------------------------
function gitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "local";
  }
}

const buildDate = new Date().toISOString();

// --- En-têtes de sécurité (défense en profondeur) ---------------------------
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    // la caméra est autorisée (scan des codes-barres), le reste est bloqué
    value: "camera=(self), microphone=(), geolocation=()",
  },
  // Force HTTPS pendant 2 ans (n'a d'effet qu'en HTTPS, donc sans risque en local)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_GIT_SHA: gitSha(),
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
