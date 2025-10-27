import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Environment-specific database URL
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
  }
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_DATABASE_URL || 'file:./test.db';
  }
  return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    errorFormat: 'pretty',
    // Disable query engine during build to avoid runtime issues
    ...(process.env.NODE_ENV === 'production' &&
      process.env.DOCKER_BUILD === 'true' && {
        log: [],
      }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database fallback utility function
export async function withDatabaseFallback<T>(
  dbOperation: () => Promise<T>,
  fallbackData: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await dbOperation();
  } catch (error) {
    console.warn(errorMessage || 'Database operation failed, using fallback data:', error);
    return fallbackData;
  }
}
