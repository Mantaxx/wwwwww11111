import { vi } from 'vitest';

// Mock environment variables
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
});
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(
      public url: string,
      public init?: RequestInit
    ) {}
    json() {
      return Promise.resolve({});
    }
    headers = new Map();
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => new Response(JSON.stringify(data), init),
    redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
  },
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auction: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    pigeon: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    auctionAsset: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    bid: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    conversation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    reference: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    breederMeeting: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    watchlistItem: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    userMessage: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    currentUser: null,
  },
  app: {},
}));

vi.mock('@/lib/firebase-admin', () => ({
  auth: {
    verifyIdToken: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

// Mock external services
vi.mock('@/lib/phone-verification', () => ({
  requirePhoneVerification: vi.fn(() => null),
  sendVerificationCode: vi.fn(),
  verifyCode: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  apiRateLimit: vi.fn(() => null),
}));

// Mock CSRF
vi.mock('@/lib/csrf', () => ({
  withCSRF: vi.fn(handler => handler),
  generateCSRFToken: vi.fn(() => 'test-token'),
  validateCSRFToken: vi.fn(() => true),
}));

// Mock sanitization
vi.mock('@/lib/sanitization', () => ({
  withSanitization: vi.fn(handler => handler),
}));

// Mock cache
vi.mock('@/lib/cache', () => ({
  withCache: vi.fn(handler => handler),
  dbCache: {
    getAuctions: vi.fn(),
    getAuction: vi.fn(),
    getUser: vi.fn(),
    invalidateAuction: vi.fn(),
    invalidateUser: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn(() => ({ total: 0, active: 0, expired: 0, maxSize: 1000 })),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    apiRequest: vi.fn(),
    userAction: vi.fn(),
    databaseQuery: vi.fn(),
    authenticationEvent: vi.fn(),
    businessEvent: vi.fn(),
    performanceMetrics: vi.fn(),
    securityEvent: vi.fn(),
    getLogBuffer: vi.fn(() => []),
    clearLogBuffer: vi.fn(),
    getStats: vi.fn(() => ({ totalLogs: 0, errors: 0, warnings: 0, info: 0, debug: 0 })),
  },
  logError: vi.fn(),
  logApiRequest: vi.fn(),
  logUserAction: vi.fn(),
  logDatabaseQuery: vi.fn(),
  logAuthenticationEvent: vi.fn(),
  logBusinessEvent: vi.fn(),
  logPerformanceMetrics: vi.fn(),
  logSecurityEvent: vi.fn(),
}));

// Mock error handling
vi.mock('@/lib/error-handling', () => ({
  AppErrors: {
    validation: vi.fn(message => ({ message, type: 'VALIDATION_ERROR', statusCode: 400 })),
    unauthorized: vi.fn(() => ({
      message: 'Brak autoryzacji',
      type: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    })),
    forbidden: vi.fn(() => ({
      message: 'Brak uprawnień',
      type: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    })),
    notFound: vi.fn(resource => ({
      message: `${resource} nie została znaleziona`,
      type: 'NOT_FOUND_ERROR',
      statusCode: 404,
    })),
    conflict: vi.fn(message => ({ message, type: 'CONFLICT_ERROR', statusCode: 409 })),
    rateLimit: vi.fn(() => ({
      message: 'Zbyt wiele żądań',
      type: 'RATE_LIMIT_ERROR',
      statusCode: 429,
    })),
    csrf: vi.fn(() => ({
      message: 'Nieprawidłowy CSRF token',
      type: 'CSRF_ERROR',
      statusCode: 403,
    })),
    database: vi.fn(message => ({ message, type: 'DATABASE_ERROR', statusCode: 500 })),
    externalService: vi.fn((service, message) => ({
      message: message || `Błąd serwisu ${service}`,
      type: 'EXTERNAL_SERVICE_ERROR',
      statusCode: 502,
    })),
    internal: vi.fn(message => ({ message, type: 'INTERNAL_SERVER_ERROR', statusCode: 500 })),
  },
  withErrorHandling: vi.fn(handler => handler),
  createErrorResponse: vi.fn(),
  handlePrismaError: vi.fn(),
  handleZodError: vi.fn(),
  handleFirebaseError: vi.fn(),
}));

// Mock API middleware
vi.mock('@/lib/api-middleware', () => ({
  createApiRoute: vi.fn(handler => handler),
  createPaginatedResponse: vi.fn((data, page, limit, total) => ({
    data,
    pagination: { page, limit, total },
  })),
  createSuccessResponse: vi.fn((data, message, status) => ({ data, message, status })),
  createErrorResponse: vi.fn((message, status) => ({ error: message, status })),
  middlewareConfigs: {
    public: {},
    protected: {},
    admin: {},
    create: {},
    read: {},
  },
}));

// Mock optimized queries
vi.mock('@/lib/optimized-queries', () => ({
  auctionQueries: {
    withBasicRelations: {},
    withFullDetails: {},
  },
  createAuctionFilters: vi.fn(filters => filters),
  createAuctionSorting: vi.fn(sortBy => ({ createdAt: 'desc' })),
  createPagination: vi.fn((page, limit) => ({ skip: (page - 1) * limit, take: limit })),
}));

// Mock validations
vi.mock('@/lib/validations/schemas', () => ({
  auctionCreateSchema: {
    parse: vi.fn(data => data),
    safeParse: vi.fn(data => ({ success: true, data })),
  },
}));

// Mock session validation
vi.mock('@/lib/session-validation', () => ({
  requireAuth: vi.fn(() => null),
  requireAdminAuth: vi.fn(() => null),
  validateSession: vi.fn(() => ({ isValid: true, session: { user: { id: 'test-user' } } })),
  validateAdminSession: vi.fn(() => ({
    isValid: true,
    session: { user: { id: 'test-admin', role: 'ADMIN' } },
  })),
}));

// Global test utilities
(globalThis as any).mockRequest = (url: string, method: string = 'GET', body?: any) => {
  return {
    url,
    method,
    json: () => Promise.resolve(body || {}),
    headers: new Map(),
  };
};
(globalThis as any).mockResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), { status });
};

// Clean up after each test
import { afterEach } from 'vitest';
afterEach(() => {
  vi.clearAllMocks();
});
