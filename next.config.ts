import type { NextConfig } from "next";

/**
 * Solo afecta `next dev`: permite abrir la app desde el teléfono en la red local
 * (Wi-Fi de la casa o hotspot del iPhone, que usa 172.20.10.x). Sin esto, Next bloquea
 * los recursos de desarrollo y React nunca se activa en el teléfono.
 */
const LOCAL_NETWORK_DEV_ORIGINS = ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"];

const nextConfig: NextConfig = {
  allowedDevOrigins: LOCAL_NETWORK_DEV_ORIGINS,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
