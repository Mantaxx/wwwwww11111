-- Database initialization script for Pigeon Auction Platform
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Set timezone
SET timezone = 'Europe/Warsaw';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance (if not created by Prisma)
-- These are additional indexes that might be useful

-- Index for active auctions by end time (for auction ending notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_active_end_time
ON "Auction" ("endTime")
WHERE "status" = 'ACTIVE';

-- Index for user notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
ON "Notification" ("userId", "isRead")
WHERE "isRead" = false;

-- Index for active push subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_push_subscriptions_active
ON "PushSubscription" ("userId", "isActive")
WHERE "isActive" = true;

-- Index for recent messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recent
ON "Message" ("auctionId", "createdAt" DESC);

-- Index for user conversations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_last_message
ON "Conversation" ("participant1Id", "lastMessageAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_last_message_2
ON "Conversation" ("participant2Id", "lastMessageAt" DESC);

-- Partial index for pending transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_pending
ON "Transaction" ("createdAt")
WHERE "status" = 'PENDING';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
    RAISE NOTICE 'Database: pigeon_auction';
    RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Additional indexes created for performance optimization';
END $$;
