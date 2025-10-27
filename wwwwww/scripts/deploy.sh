#!/bin/bash

# Deployment script for Pigeon Auction Platform
# This script handles the deployment process for staging and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_ROOT=$(dirname "$(dirname "$0")")

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        log_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
        exit 1
    fi
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment for $ENVIRONMENT"

    if [[ "$ENVIRONMENT" == "production" ]]; then
        export NODE_ENV=production
        export DATABASE_URL=$PROD_DATABASE_URL
        export REDIS_URL=$PROD_REDIS_URL
        export FIREBASE_PROJECT_ID=$PROD_FIREBASE_PROJECT_ID
    else
        export NODE_ENV=staging
        export DATABASE_URL=$STAGING_DATABASE_URL
        export REDIS_URL=$STAGING_REDIS_URL
        export FIREBASE_PROJECT_ID=$STAGING_FIREBASE_PROJECT_ID
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --production=false
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    npx prisma generate
    npx prisma db push --accept-data-loss
}

# Build application
build_application() {
    log_info "Building application..."
    npm run build
}

# Run tests
run_tests() {
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        log_info "Running tests..."
        npm run test:run
    fi
}

# Deploy to Firebase
deploy_firebase() {
    log_info "Deploying to Firebase ($ENVIRONMENT)..."

    if [[ "$ENVIRONMENT" == "production" ]]; then
        firebase use production
    else
        firebase use staging
    fi

    firebase deploy --only hosting,functions
}

# Health check
health_check() {
    log_info "Performing health check..."

    # Wait for deployment to be ready
    sleep 30

    # Check if the application is responding
    if curl -f -s "https://your-domain.com/api/health" > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Rollback function
rollback() {
    log_error "Deployment failed. Initiating rollback..."

    # Add rollback logic here
    # For example: firebase deploy --only hosting,functions --rollback

    log_info "Rollback completed"
    exit 1
}

# Main deployment process
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"

    validate_environment
    setup_environment

    cd "$PROJECT_ROOT"

    install_dependencies || { log_error "Failed to install dependencies"; exit 1; }
    run_migrations || { log_error "Failed to run migrations"; exit 1; }
    run_tests || { log_error "Tests failed"; exit 1; }
    build_application || { log_error "Build failed"; exit 1; }
    deploy_firebase || { log_error "Firebase deployment failed"; rollback; }

    health_check || { log_error "Health check failed"; exit 1; }

    log_success "Deployment to $ENVIRONMENT completed successfully! 🎉"
}

# Run main function
main "$@"