import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { FirebaseError } from 'firebase/app';

// Typy błędów
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CSRF_ERROR = 'CSRF_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

// Klasa błędu aplikacji
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefiniowane błędy
export const AppErrors = {
  // Błędy walidacji
  validation: (message: string, details?: unknown) =>
    new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, details),

  // Błędy autoryzacji
  unauthorized: (message: string = 'Brak autoryzacji') =>
    new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401),

  // Błędy uprawnień
  forbidden: (message: string = 'Brak uprawnień') =>
    new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403),

  // Błędy nie znaleziono
  notFound: (resource: string = 'Zasób') =>
    new AppError(`${resource} nie został znaleziony`, ErrorType.NOT_FOUND_ERROR, 404),

  // Błędy konfliktu
  conflict: (message: string) => new AppError(message, ErrorType.CONFLICT_ERROR, 409),

  // Błędy rate limit
  rateLimit: (message: string = 'Zbyt wiele żądań') =>
    new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429),

  // Błędy CSRF
  csrf: (message: string = 'Nieprawidłowy CSRF token') =>
    new AppError(message, ErrorType.CSRF_ERROR, 403),

  // Błędy bazy danych
  database: (message: string = 'Błąd bazy danych') =>
    new AppError(message, ErrorType.DATABASE_ERROR, 500),

  // Błędy zewnętrznych serwisów
  externalService: (service: string, message?: string) =>
    new AppError(message || `Błąd serwisu ${service}`, ErrorType.EXTERNAL_SERVICE_ERROR, 502),

  // Błędy wewnętrzne
  internal: (message: string = 'Błąd wewnętrzny serwera') =>
    new AppError(message, ErrorType.INTERNAL_SERVER_ERROR, 500),
};

// Interfejs dla odpowiedzi błędu
interface ErrorResponse {
  error: string;
  type: ErrorType;
  statusCode: number;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

// Helper do tworzenia odpowiedzi błędu
export function createErrorResponse(
  error: AppError | Error,
  requestId?: string
): NextResponse<ErrorResponse> {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else {
    // Konwertuj zwykły błąd na AppError
    appError = AppErrors.internal(error.message);
  }

  const errorResponse: ErrorResponse = {
    error: appError.message,
    type: appError.type,
    statusCode: appError.statusCode,
    details: appError.details,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(errorResponse, {
    status: appError.statusCode,
    headers: {
      'X-Error-Type': appError.type,
      'X-Request-ID': requestId || 'unknown',
    },
  });
}

// Middleware do obsługi błędów
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('Error in API handler:', error);

      // Generuj request ID
      const requestId = Math.random().toString(36).substring(2, 15);

      return createErrorResponse(error as Error, requestId);
    }
  };
}

// Helper do walidacji z błędami
export function validateWithError<T>(
  data: T,
  validator: (data: T) => { isValid: boolean; error?: string; details?: unknown }
): T {
  const result = validator(data);

  if (!result.isValid) {
    throw AppErrors.validation(result.error || 'Nieprawidłowe dane', result.details);
  }

  return data;
}

// Helper do sprawdzania istnienia zasobu
export async function requireResource<T>(
  fetcher: () => Promise<T | null>,
  resourceName: string = 'Zasób'
): Promise<T> {
  const resource = await fetcher();

  if (!resource) {
    throw AppErrors.notFound(resourceName);
  }

  return resource;
}

// Helper do sprawdzania uprawnień
export function requirePermission(condition: boolean, message: string = 'Brak uprawnień'): void {
  if (!condition) {
    throw AppErrors.forbidden(message);
  }
}

// Helper do sprawdzania własności zasobu
export function requireOwnership(
  resourceOwnerId: string,
  currentUserId: string,
  resourceName: string = 'zasób'
): void {
  if (resourceOwnerId !== currentUserId) {
    throw AppErrors.forbidden(`Nie masz uprawnień do tego ${resourceName}`);
  }
}

// Logger błędów
export class ErrorLogger {
  private static instance: ErrorLogger;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: Error, context?: unknown): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: error instanceof AppError ? error.type : 'UNKNOWN',
      statusCode: error instanceof AppError ? error.statusCode : 500,
      context,
      timestamp: new Date().toISOString(),
    };

    // W produkcji tutaj byłby wysyłanie do zewnętrznego serwisu logowania
    console.error('Application Error:', JSON.stringify(errorInfo, null, 2));
  }

  logApiError(error: Error, request: NextRequest, context?: unknown): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: error instanceof AppError ? error.type : 'UNKNOWN',
      statusCode: error instanceof AppError ? error.statusCode : 500,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      context,
      timestamp: new Date().toISOString(),
    };

    console.error('API Error:', JSON.stringify(errorInfo, null, 2));
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Helper do obsługi błędów Prisma
export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError | Error): AppError {
  if ('code' in error && error.code === 'P2002') {
    return AppErrors.conflict('Zasób już istnieje');
  }

  if ('code' in error && error.code === 'P2025') {
    return AppErrors.notFound('Zasób nie został znaleziony');
  }

  if ('code' in error && error.code === 'P2003') {
    return AppErrors.validation('Nieprawidłowe powiązanie z innym zasobem');
  }

  if ('code' in error && error.code === 'P2014') {
    return AppErrors.conflict('Nie można usunąć zasobu z powodu istniejących powiązań');
  }

  return AppErrors.database(error.message || 'Błąd bazy danych');
}

// Helper do obsługi błędów walidacji Zod
export function handleZodError(error: ZodError): AppError {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return AppErrors.validation('Nieprawidłowe dane wejściowe', details);
}

// Helper do obsługi błędów Firebase
export function handleFirebaseError(error: FirebaseError): AppError {
  switch (error.code) {
    case 'auth/invalid-email':
      return AppErrors.validation('Nieprawidłowy adres email');
    case 'auth/user-not-found':
      return AppErrors.notFound('Użytkownik');
    case 'auth/wrong-password':
      return AppErrors.unauthorized('Nieprawidłowe hasło');
    case 'auth/email-already-in-use':
      return AppErrors.conflict('Email już jest w użyciu');
    case 'auth/weak-password':
      return AppErrors.validation('Hasło jest za słabe');
    case 'auth/too-many-requests':
      return AppErrors.rateLimit('Zbyt wiele prób logowania');
    default:
      return AppErrors.externalService('Firebase', error.message);
  }
}
