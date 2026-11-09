import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Banco local de desenvolvimento (PGlite) é carregado só quando não há DATABASE_URL.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
