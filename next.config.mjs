/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Migracion de hosting: Netlify (pausado por limite de creditos) -> GitHub
  // Pages. La app es 100% client-side (mock session en localStorage, sin
  // rutas API ni SSR real), asi que un export estatico funciona sin cambios
  // de logica.
  output: "export",
  // El sitio se sirve en https://learn5soporte.github.io/professor-ai-web,
  // no en la raiz del dominio, por eso el basePath.
  basePath: "/professor-ai-web",
  assetPrefix: "/professor-ai-web/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
