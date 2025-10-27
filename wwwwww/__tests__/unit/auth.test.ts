import { requireFirebaseAuth } from '@/lib/firebase-auth';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock NextRequest
const createMockRequest = (authHeader?: string) => ({
  headers: {
    get: vi.fn((key: string) => (key === 'authorization' ? authHeader : null)),
  },
});

describe('Firebase Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireFirebaseAuth', () => {
    it('should return error for missing authorization header', async () => {
      const mockRequest = createMockRequest();

      const result = await requireFirebaseAuth(mockRequest as any);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });

    it('should return error for invalid authorization header format', async () => {
      const mockRequest = createMockRequest('InvalidFormat');

      const result = await requireFirebaseAuth(mockRequest as any);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });

    it('should return error for invalid token', async () => {
      const mockRequest = createMockRequest('Bearer invalid-token');

      const result = await requireFirebaseAuth(mockRequest as any);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });
  });

  describe('requireAdminAuth', () => {
    it('should return error for non-admin user', async () => {
      const mockRequest = createMockRequest('Bearer valid-token');

      // Mock Prisma to return non-admin user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        role: 'USER',
        isActive: true,
      } as any);

      const result = await requireAdminAuth(mockRequest as any);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);
    });

    it('should return error for inactive user', async () => {
      const mockRequest = createMockRequest('Bearer valid-token');

      // Mock Prisma to return inactive user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        role: 'ADMIN',
        isActive: false,
      } as any);

      const result = await requireAdminAuth(mockRequest as any);

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(403);
    });
  });
});
