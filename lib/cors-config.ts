import cors from 'cors';

// Configuration CORS centralisée pour toutes les routes API
export const corsConfig = {
  origin: [
    'http://localhost:3000', // Admin dashboard local
    'http://localhost:3002', // Dashboard partenaire local
    'https://admin.zalamasas.com', // Admin dashboard production
    'https://zalama-partner-dashboard-4esq.vercel.app' // Dashboard partenaire production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware CORS préconfiguré
export const corsMiddleware = cors(corsConfig);

// Helper pour exécuter le middleware CORS dans Next.js
export const runCorsMiddleware = (req: any, res: any) => {
  return new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        console.error('CORS middleware error:', result);
        return reject(result);
      }
      return resolve(result);
    });
  });
}; 