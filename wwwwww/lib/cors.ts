import { NextRequest, NextResponse } from 'next/server';

interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

const defaultOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com'] // Replace with your production domain
      : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

export function cors(options: CorsOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return (request: NextRequest) => {
    const origin = request.headers.get('origin');
    const method = request.method;

    // Handle preflight requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });

      // Set CORS headers
      if (
        origin &&
        (config.origin === '*' || (Array.isArray(config.origin) && config.origin.includes(origin)))
      ) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }

      if (config.methods) {
        response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
      }

      if (config.allowedHeaders) {
        response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
      }

      if (config.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

      return response;
    }

    // Handle actual requests
    const response = NextResponse.next();

    if (
      origin &&
      (config.origin === '*' || (Array.isArray(config.origin) && config.origin.includes(origin)))
    ) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    if (config.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  };
}

// Predefined CORS configurations
export const apiCors = cors({
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com'] // Replace with your production domain
      : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

export const publicCors = cors({
  origin: '*',
  methods: ['GET'],
  credentials: false,
});
