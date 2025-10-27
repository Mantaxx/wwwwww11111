#!/bin/bash

# Pigeon Auction Platform - Docker Setup Script
# This script helps you get started with the Docker environment

set -e

echo "🐦 Pigeon Auction Platform - Docker Setup"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env file with your actual configuration values"
else
    echo "✅ .env file already exists"
fi

# Ask user what they want to do
echo ""
echo "What would you like to do?"
echo "1) Start development environment"
echo "2) Start production environment"
echo "3) Start with all tools (PgAdmin, Redis Commander)"
echo "4) Stop all services"
echo "5) View logs"
echo "6) Run database migrations"
echo "7) Reset database (WARNING: destroys all data)"
echo "8) Clean up everything"
echo ""
read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        echo "🚀 Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        echo "✅ Development environment started!"
        echo "📱 Application: http://localhost:3000"
        ;;
    2)
        echo "🚀 Starting production environment..."
        docker-compose --profile production up -d
        echo "✅ Production environment started!"
        echo "📱 Application: http://localhost:3000"
        ;;
    3)
        echo "🚀 Starting environment with all tools..."
        docker-compose --profile production --profile tools up -d
        echo "✅ Environment with tools started!"
        echo "📱 Application: http://localhost:3000"
        echo "🗄️  PgAdmin: http://localhost:5050"
        echo "🔴 Redis Commander: http://localhost:8081"
        ;;
    4)
        echo "🛑 Stopping all services..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        echo "✅ All services stopped"
        ;;
    5)
        echo "📋 Showing logs..."
        docker-compose logs -f app
        ;;
    6)
        echo "🗄️  Running database migrations..."
        docker-compose exec app npm run migrate:deploy
        echo "✅ Database migrations completed"
        ;;
    7)
        echo "⚠️  WARNING: This will destroy all data!"
        read -p "Are you sure you want to reset the database? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            docker-compose exec app npm run db:reset
            echo "✅ Database reset completed"
        else
            echo "❌ Database reset cancelled"
        fi
        ;;
    8)
        echo "🧹 Cleaning up everything..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📚 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View status: docker-compose ps"
echo ""
echo "📖 For more information, see README-Docker.md"
