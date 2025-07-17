declare module 'cors' {
  import { NextFunction, Request, Response } from 'express';
  
  interface CorsOptions {
    origin?: boolean | string | string[] | RegExp | RegExp[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }
  
  function cors(options?: CorsOptions): (req: Request, res: Response, next: NextFunction) => void;
  export = cors;
} 