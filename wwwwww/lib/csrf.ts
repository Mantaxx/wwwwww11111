import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Interface dla różnych implementacji store
interface CSRFTokenStore {
  get(key: string): Promise<{ token: string; expires: number } | null>;
  set(key: string, value: { token: string; expires: number }, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

// In-memory store dla development
class MemoryCSRFTokenStore implements CSRFTokenStore {
  private store = new Map<string, { token: string; expires: number }>();

  async get(key: string) {
    const value = this.store.get(key);
    if (!value || value.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set(key: string, value: { token: string; expires: number }, _ttl: number) {
    this.store.set(key, value);
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  async cleanup() {
    const now = Date.now();
    for (const [key, value] of Array.from(this.store.entries())) {
      if (value.expires < now) {
        this.store.delete(key);
      }
    }
  }
}

// Redis store dla production (placeholder)
class RedisCSRFTokenStore implements CSRFTokenStore {
  // W przyszłości można dodać prawdziwą implementację Redis
  private fallbackStore = new MemoryCSRFTokenStore();

  async get(key: string) {
    // TODO: Implement Redis get
    return this.fallbackStore.get(key);
  }

  async set(key: string, value: { token: string; expires: number }, ttl: number) {
    // TODO: Implement Redis set with TTL
    return this.fallbackStore.set(key, value, ttl);
  }

  async delete(key: string) {
    // TODO: Implement Redis delete
    return this.fallbackStore.delete(key);
  }

  async cleanup() {
    // Redis ma automatyczny TTL, więc cleanup nie jest potrzebny
    return Promise.resolve();
  }
}

// Factory function do tworzenia odpowiedniego store
function createCSRFTokenStore(): CSRFTokenStore {
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    return new RedisCSRFTokenStore();
  }
  return new MemoryCSRFTokenStore();
}

// Global store instance
const csrfTokenStore = createCSRFTokenStore();

// Generuj CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Sprawdź CSRF token
export async function validateCSRFToken(request: NextRequest, token: string): Promise<boolean> {
  try {
    // Sprawdź token w cookie
    const cookieToken = request.cookies.get('csrf-token')?.value;
    if (!cookieToken) {
      return false;
    }

    // Sprawdź czy token jest w store
    const storedToken = await csrfTokenStore.get(cookieToken);
    if (!storedToken) {
      return false;
    }

    // Sprawdź czy tokeny się zgadzają
    return storedToken.token === token;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

// Ustaw CSRF token w cookie
export async function setCSRFCookie(response: NextResponse, token: string): Promise<void> {
  const expires = Date.now() + 60 * 60 * 24 * 1000; // 24 godziny
  const ttl = 60 * 60 * 24; // 24 godziny w sekundach

  // Zapisz token w store
  await csrfTokenStore.set(token, { token, expires }, ttl);

  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 godziny
    path: '/',
  });
}

// Middleware CSRF dla API routes
export function withCSRF(handler: Function) {
  return async (request: NextRequest, ...args: unknown[]) => {
    // Sprawdź czy to POST, PUT, DELETE request
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json();
        const csrfToken = body.csrfToken;

        if (!csrfToken || !(await validateCSRFToken(request, csrfToken))) {
          return NextResponse.json({ error: 'Nieprawidłowy CSRF token' }, { status: 403 });
        }
      } catch (error) {
        console.error('CSRF middleware error:', error);
        return NextResponse.json({ error: 'Błąd walidacji CSRF' }, { status: 400 });
      }
    }

    return handler(request, ...args);
  };
}

// Wyczyść wygasłe tokeny
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await csrfTokenStore.cleanup();
  } catch (error) {
    console.error('CSRF cleanup error:', error);
  }
}

// Uruchom cleanup co 5 minut
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

// Export store dla testów i debugowania
export { csrfTokenStore };
