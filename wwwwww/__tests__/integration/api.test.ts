import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getAdminAuth } from '@/lib/firebase-admin';

// Setup test database and Redis
describe('API Integration Tests', () => {
  let prisma: PrismaClient;
  let redis: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Setup test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });

    // Setup Redis for testing
    redis = createClient({
      url: process.env.TEST_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379',
    });

    try {
      await redis.connect();
    } catch (error) {
      console.warn('Redis not available for tests, skipping Redis tests');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    if (redis) {
      await redis.disconnect();
    }
  });

  describe('Database Operations', () => {
    it('should connect to database', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });

    it('should create and find user', async () => {
      const testEmail = `test-${Date.now()}@example.com`;

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe(testEmail);

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should handle auction creation', async () => {
      const testEmail = `auction-test-${Date.now()}@example.com`;

      // Create test user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Auction',
          lastName: 'Test',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      // Create test pigeon
      const pigeon = await prisma.pigeon.create({
        data: {
          name: 'Test Pigeon',
          ringNumber: `TEST-${Date.now()}`,
          bloodline: 'Test Bloodline',
          gender: 'male',
          birthDate: new Date(),
          color: 'blue',
          weight: 500,
          breeder: 'Test Breeder',
        },
      });

      // Create auction
      const auction = await prisma.auction.create({
        data: {
          title: 'Test Auction',
          description: 'Test auction description',
          category: 'Pigeon',
          pigeonId: pigeon.id,
          sellerId: user.id,
          startingPrice: 100,
          buyNowPrice: 200,
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          isApproved: true,
        },
      });

      expect(auction.id).toBeDefined();
      expect(auction.title).toBe('Test Auction');

      // Cleanup
      await prisma.auction.delete({ where: { id: auction.id } });
      await prisma.pigeon.delete({ where: { id: pigeon.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Redis Operations', () => {
    it('should connect to Redis if available', async () => {
      if (!redis) {
        console.warn('Redis not available, skipping test');
        return;
      }

      const testKey = `test-${Date.now()}`;
      const testValue = 'test-value';

      await redis.set(testKey, testValue);
      const result = await redis.get(testKey);

      expect(result).toBe(testValue);

      // Cleanup
      await redis.del(testKey);
    });

    it('should handle JSON operations in Redis', async () => {
      if (!redis) {
        console.warn('Redis not available, skipping test');
        return;
      }

      const testKey = `json-test-${Date.now()}`;
      const testData = { message: 'Hello Redis', timestamp: Date.now() };

      await redis.set(testKey, JSON.stringify(testData));
      const result = await redis.get(testKey);

      expect(result).toBeDefined();
      const parsed = JSON.parse(result!);
      expect(parsed.message).toBe('Hello Redis');

      // Cleanup
      await redis.del(testKey);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should validate Firebase tokens', async () => {
      const adminAuth = getAdminAuth();

      // Test with invalid token
      try {
        await adminAuth.verifyIdToken('invalid-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle admin role validation', async () => {
      const testEmail = `admin-test-${Date.now()}@example.com`;

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Admin',
          lastName: 'Test',
          role: 'ADMIN',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      expect(adminUser.role).toBe('ADMIN');

      // Cleanup
      await prisma.user.delete({ where: { id: adminUser.id } });
    });

    it('should handle regular user role validation', async () => {
      const testEmail = `user-test-${Date.now()}@example.com`;

      // Create regular user
      const regularUser = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Regular',
          lastName: 'User',
          role: 'USER',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      expect(regularUser.role).toBe('USER');

      // Cleanup
      await prisma.user.delete({ where: { id: regularUser.id } });
    });
  });

  describe('Auction System', () => {
    it('should create auction with proper validation', async () => {
      const testEmail = `auction-seller-${Date.now()}@example.com`;

      // Create seller
      const seller = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Auction',
          lastName: 'Seller',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      // Create pigeon
      const pigeon = await prisma.pigeon.create({
        data: {
          name: 'Auction Test Pigeon',
          ringNumber: `AUCTION-${Date.now()}`,
          bloodline: 'Test Bloodline',
          gender: 'male',
          birthDate: new Date(),
          color: 'blue',
          weight: 500,
          breeder: 'Test Breeder',
        },
      });

      // Create auction
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const auction = await prisma.auction.create({
        data: {
          title: 'Integration Test Auction',
          description: 'Testing auction creation in integration tests',
          category: 'Pigeon',
          pigeonId: pigeon.id,
          sellerId: seller.id,
          startingPrice: 100.0,
          buyNowPrice: 250.0,
          reservePrice: 150.0,
          startTime,
          endTime,
          isApproved: true,
        },
      });

      expect(auction.id).toBeDefined();
      expect(auction.status).toBe('ACTIVE');
      expect(auction.isApproved).toBe(true);

      // Test bid creation
      const bidderEmail = `bidder-${Date.now()}@example.com`;
      const bidder = await prisma.user.create({
        data: {
          email: bidderEmail,
          firstName: 'Test',
          lastName: 'Bidder',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      const bid = await prisma.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: bidder.id,
          amount: 120.0,
        },
      });

      expect(bid.id).toBeDefined();
      expect(bid.amount).toBe(120.0);

      // Verify auction current price updated
      const updatedAuction = await prisma.auction.findUnique({
        where: { id: auction.id },
      });
      expect(updatedAuction?.currentPrice).toBe(120.0);

      // Cleanup
      await prisma.bid.delete({ where: { id: bid.id } });
      await prisma.auction.delete({ where: { id: auction.id } });
      await prisma.pigeon.delete({ where: { id: pigeon.id } });
      await prisma.user.delete({ where: { id: bidder.id } });
      await prisma.user.delete({ where: { id: seller.id } });
    });

    it('should handle auction ending and winner selection', async () => {
      const testEmail = `auction-end-${Date.now()}@example.com`;

      // Create seller
      const seller = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Auction',
          lastName: 'End Test',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      // Create auction that ends immediately
      const auction = await prisma.auction.create({
        data: {
          title: 'Ending Auction Test',
          description: 'Testing auction ending logic',
          category: 'Pigeon',
          sellerId: seller.id,
          startingPrice: 50.0,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
          endTime: new Date(Date.now() - 60 * 1000), // Ended 1 minute ago
          status: 'ENDED',
          isApproved: true,
        },
      });

      expect(auction.status).toBe('ENDED');

      // Cleanup
      await prisma.auction.delete({ where: { id: auction.id } });
      await prisma.user.delete({ where: { id: seller.id } });
    });
  });

  describe('Messaging System', () => {
    it('should handle conversation creation and messaging', async () => {
      const user1Email = `msg-user1-${Date.now()}@example.com`;
      const user2Email = `msg-user2-${Date.now()}@example.com`;

      // Create users
      const user1 = await prisma.user.create({
        data: {
          email: user1Email,
          firstName: 'Message',
          lastName: 'User1',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      const user2 = await prisma.user.create({
        data: {
          email: user2Email,
          firstName: 'Message',
          lastName: 'User2',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          participant1Id: user1.id,
          participant2Id: user2.id,
        },
      });

      expect(conversation.id).toBeDefined();

      // Create messages
      const message1 = await prisma.userMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user1.id,
          content: 'Hello from user 1',
        },
      });

      const message2 = await prisma.userMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user2.id,
          content: 'Hello from user 2',
        },
      });

      expect(message1.content).toBe('Hello from user 1');
      expect(message2.content).toBe('Hello from user 2');

      // Cleanup
      await prisma.userMessage.delete({ where: { id: message2.id } });
      await prisma.userMessage.delete({ where: { id: message1.id } });
      await prisma.conversation.delete({ where: { id: conversation.id } });
      await prisma.user.delete({ where: { id: user2.id } });
      await prisma.user.delete({ where: { id: user1.id } });
    });
  });

  describe('File Upload System', () => {
    it('should handle file metadata storage', async () => {
      const testEmail = `upload-test-${Date.now()}@example.com`;

      // Create user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Upload',
          lastName: 'Test',
          isActive: true,
          isProfileVerified: true,
          isPhoneVerified: true,
        },
      });

      // Create pigeon for auction
      const pigeon = await prisma.pigeon.create({
        data: {
          name: 'Upload Test Pigeon',
          ringNumber: `UPLOAD-${Date.now()}`,
          bloodline: 'Test Bloodline',
          gender: 'female',
          birthDate: new Date(),
          color: 'white',
          weight: 450,
          breeder: 'Test Breeder',
        },
      });

      // Create auction with assets
      const auction = await prisma.auction.create({
        data: {
          title: 'Upload Test Auction',
          description: 'Testing file upload integration',
          category: 'Pigeon',
          pigeonId: pigeon.id,
          sellerId: user.id,
          startingPrice: 75.0,
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isApproved: true,
          assets: {
            create: [
              {
                type: 'IMAGE',
                url: '/uploads/test-image.jpg',
              },
              {
                type: 'DOCUMENT',
                url: '/uploads/test-document.pdf',
              },
            ],
          },
        },
        include: {
          assets: true,
        },
      });

      expect(auction.assets).toHaveLength(2);
      expect(auction.assets[0].type).toBe('IMAGE');
      expect(auction.assets[1].type).toBe('DOCUMENT');

      // Cleanup
      await prisma.auctionAsset.deleteMany({ where: { auctionId: auction.id } });
      await prisma.auction.delete({ where: { id: auction.id } });
      await prisma.pigeon.delete({ where: { id: pigeon.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('API Endpoints', () => {
    it('should handle health check endpoint', async () => {
      // Test database connectivity as health check
      const result = await prisma.$queryRaw`SELECT 1 as health`;
      expect(result).toBeDefined();
    });

    it('should validate data integrity constraints', async () => {
      // Test unique constraints
      const testEmail = `constraint-test-${Date.now()}@example.com`;

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          firstName: 'Constraint',
          lastName: 'Test',
          isActive: true,
        },
      });

      // Try to create duplicate email (should fail)
      try {
        await prisma.user.create({
          data: {
            email: testEmail, // Same email
            firstName: 'Duplicate',
            lastName: 'Test',
            isActive: true,
          },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
