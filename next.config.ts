import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignorer les erreurs de typage pour Vercel
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs ESLint pour Vercel
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['picsum.photos', 'mspmrzlqhwpdkkburjiw.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'mspmrzlqhwpdkkburjiw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
  // Configuration CORS globale pour les API routes
  async headers() {
    return [
      {
        // Appliquer à toutes les routes API
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3002, http://localhost:3000, https://admin.zalamasas.com, https://zalama-partner-dashboard-4esq.vercel.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
