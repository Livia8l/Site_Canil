/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Imagens de filhotes e institucionais são servidas localmente em /public/uploads
    // nesta versão de demonstração. Em produção, trocar por um provedor de object
    // storage (ex.: Cloudflare R2 / S3) e configurar remotePatterns aqui.
    remotePatterns: []
  }
};

export default nextConfig;
