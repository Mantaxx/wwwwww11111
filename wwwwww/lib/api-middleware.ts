import { requireAdminAuth } from '@/lib/admin-auth';
import { withCache } from '@/lib/cache';
import { withCSRF } from '@/lib/csrf';
import { withErrorHandling } from '@/lib/error-handling';
import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { logApiRequest, logBusinessEvent, logUserAction } from '@/lib/logger';
import { apiRateLimit } from '@/lib/rate-limit';
// import { withSanitization } from '@/lib/sanitization'; // ZAKOMENTOWANE - nie używane
import { NextRequest, NextResponse } from 'next/server';

/**
 * Wspólne middleware dla API routes
 */
export interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  enableCSRF?: boolean;
  enableSanitization?: boolean;
  enableCache?: boolean;
  cacheOptions?: {
    ttl?: number;
    keyPrefix?: string;
    skipCache?: (request: NextRequest) => boolean;
  };
  enableRateLimit?: boolean;
  enableLogging?: boolean;
}

/**
 * Tworzy middleware stack dla API routes
 */
export function createApiMiddleware(options: ApiMiddlewareOptions = {}) {
  const {
    requireAuth: needsAuth = false,
    requireAdmin = false,
    enableCSRF = true,
    enableSanitization = true,
    enableCache = false,
    cacheOptions = {},
    enableRateLimit = true,
    enableLogging = true,
  } = options;

  return function wrapHandler(handler: (request: NextRequest) => Promise<NextResponse>) {
    let wrappedHandler = handler;

    // Error handling - zawsze na końcu
    if (enableLogging) {
      wrappedHandler = withLogging(wrappedHandler) as (
        request: NextRequest
      ) => Promise<NextResponse>;
    }
    wrappedHandler = withErrorHandling(wrappedHandler) as (
      request: NextRequest
    ) => Promise<NextResponse>;

    // Cache - przed error handling
    if (enableCache) {
      wrappedHandler = withCache(wrappedHandler, cacheOptions) as (
        request: NextRequest
      ) => Promise<NextResponse>;
    }

    // Sanitization - TYMCZASOWO WYŁĄCZONE
    // if (enableSanitization) {
    //   wrappedHandler = withSanitization(wrappedHandler) as (
    //     request: NextRequest
    //   ) => Promise<NextResponse>;
    // }

    // CSRF - przed sanitization
    if (enableCSRF) {
      wrappedHandler = withCSRF(wrappedHandler) as (request: NextRequest) => Promise<NextResponse>;
    }

    // Auth - na początku
    if (needsAuth) {
      wrappedHandler = withAuth(wrappedHandler, requireAdmin) as (
        request: NextRequest
      ) => Promise<NextResponse>;
    }

    // Rate limiting - na samym początku
    if (enableRateLimit) {
      wrappedHandler = withRateLimit(wrappedHandler) as (
        request: NextRequest
      ) => Promise<NextResponse>;
    }

    return wrappedHandler;
  };
}

/**
 * Middleware dla rate limiting
 */
function withRateLimit(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request);
  };
}

/**
 * Middleware dla autoryzacji
 */
function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>,
  requireAdmin: boolean = false
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (requireAdmin) {
      const authResult = await requireAdminAuth(request);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
    } else {
      const authResult = await requireFirebaseAuth(request);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
    }

    return handler(request);
  };
}

/**
 * Middleware dla logowania
 */
function withLogging(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      const response = await handler(request);

      // Log successful request
      logApiRequest(request.method, request.url, response.status, Date.now() - startTime, {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return response;
    } catch (error) {
      // Log error
      logApiRequest(request.method, request.url, 500, Date.now() - startTime, {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      throw error;
    }
  };
}

/**
 * Predefiniowane konfiguracje middleware
 */
export const middlewareConfigs = {
  // Publiczne API (tylko rate limiting)
  public: {
    enableRateLimit: true,
    enableCSRF: false,
    enableSanitization: false,
    enableCache: true,
    cacheOptions: { ttl: 60 },
  },

  // Chronione API (wymaga autoryzacji)
  protected: {
    requireAuth: true,
    enableRateLimit: true,
    enableCSRF: true,
    enableSanitization: false, // WYŁĄCZONE
    enableCache: false,
  },

  // Admin API (wymaga uprawnień administratora)
  admin: {
    requireAuth: true,
    requireAdmin: true,
    enableRateLimit: true,
    enableCSRF: true,
    enableSanitization: false, // WYŁĄCZONE
    enableCache: false,
  },

  // API do tworzenia zasobów (POST/PUT)
  create: {
    requireAuth: true,
    enableRateLimit: true,
    enableCSRF: true,
    enableSanitization: false, // WYŁĄCZONE
    enableCache: false,
  },

  // API do odczytu (GET)
  read: {
    enableRateLimit: true,
    enableCSRF: false,
    enableSanitization: false,
    enableCache: true,
    cacheOptions: { ttl: 300 },
  },
};

/**
 * Helper do tworzenia API routes z middleware
 */
export function createApiRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: keyof typeof middlewareConfigs | ApiMiddlewareOptions = 'protected'
) {
  const middlewareOptions = typeof config === 'string' ? middlewareConfigs[config] : config;

  return createApiMiddleware(middlewareOptions)(handler);
}

/**
 * Helper do walidacji parametrów URL
 */
export function validateUrlParams(
  request: NextRequest,
  requiredParams: string[] = []
): { isValid: boolean; params: Record<string, string>; error?: string } {
  const url = new URL(request.url);
  const params: Record<string, string> = {};

  for (const param of requiredParams) {
    const value = url.searchParams.get(param);
    if (!value) {
      return {
        isValid: false,
        params: {},
        error: `Missing required parameter: ${param}`,
      };
    }
    params[param] = value;
  }

  return { isValid: true, params };
}

/**
 * Helper do tworzenia odpowiedzi JSON
 */
export function createJsonResponse<T = unknown>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Helper do tworzenia odpowiedzi błędów
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return createJsonResponse(
    {
      error: message,
      ...(details && { details }),
    },
    status
  );
}

/**
 * Helper do tworzenia odpowiedzi sukcesu
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return createJsonResponse(
    {
      ...(message && { message }),
      ...data,
    },
    status
  );
}

/**
 * Helper do tworzenia odpowiedzi z paginacją
 */
export function createPaginatedResponse<T = unknown>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  additionalData: Record<string, unknown> = {}
): NextResponse {
  return createJsonResponse({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
    ...additionalData,
  });
}

/**
 * Helper do logowania akcji użytkownika
 */
export function logUserActionHelper(
  userId: string,
  action: string,
  context?: Record<string, unknown>
) {
  logUserAction(userId, action, context);
}

/**
 * Helper do logowania zdarzeń biznesowych
 */
export function logBusinessEventHelper(event: string, context?: Record<string, unknown>) {
  logBusinessEvent(event, context);
}

/**
 * Utility do sprawdzania metod HTTP
 */
export function requireHttpMethod(
  request: NextRequest,
  allowedMethods: string[]
): { isValid: boolean; error?: string } {
  if (!allowedMethods.includes(request.method)) {
    return {
      isValid: false,
      error: `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Utility do sprawdzania Content-Type
 */
export function requireContentType(
  request: NextRequest,
  expectedType: string = 'application/json'
): { isValid: boolean; error?: string } {
  const contentType = request.headers.get('content-type');

  if (!contentType || !contentType.includes(expectedType)) {
    return {
      isValid: false,
      error: `Expected Content-Type: ${expectedType}, got: ${contentType}`,
    };
  }

  return { isValid: true };
}