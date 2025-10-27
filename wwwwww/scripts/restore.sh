#!/bin/bash

# Database restore script for Pigeon Auction Platform
# This script restores backups of PostgreSQL database and Redis cache

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=${1:-"latest"}

# Database configuration (from environment)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"pigeon_auction"}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Redis configuration
REDIS_HOST=${REDIS_HOST:-"localhost"}
REDIS_PORT=${REDIS_PORT:-"6379"}
REDIS_PASSWORD=${REDIS_PASSWORD}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Find backup files
find_backup_files() {
    local backup_timestamp="$1"

    if [[ "$backup_timestamp" == "latest" ]]; then
        # Find the most recent backup
        local latest_db=$(ls -t "${BACKUP_DIR}"/pigeon_auction_backup_*_database.sql.gz 2>/dev/null | head -1)
        local latest_redis=$(ls -t "${BACKUP_DIR}"/pigeon_auction_backup_*_redis.rdb 2>/dev/null | head -1)
        local latest_files=$(ls -t "${BACKUP_DIR}"/pigeon_auction_backup_*_files.tar.gz 2>/dev/null | head -1)

        echo "$latest_db|$latest_redis|$latest_files"
    else
        # Find specific timestamp
        local db_backup="${BACKUP_DIR}/pigeon_auction_backup_${backup_timestamp}_database.sql.gz"
        local redis_backup="${BACKUP_DIR}/pigeon_auction_backup_${backup_timestamp}_redis.rdb"
        local files_backup="${BACKUP_DIR}/pigeon_auction_backup_${backup_timestamp}_files.tar.gz"

        echo "$db_backup|$redis_backup|$files_backup"
    fi
}

# Confirm restore operation
confirm_restore() {
    log_warning "⚠️  RESTORE OPERATION WARNING ⚠️"
    echo ""
    echo "This will OVERWRITE the current database and data!"
    echo "Make sure you have a current backup before proceeding."
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore operation cancelled by user"
        exit 0
    fi
}

# Restore PostgreSQL database
restore_database() {
    local backup_file="$1"

    if [[ ! -f "$backup_file" ]]; then
        log_warning "Database backup file not found: $backup_file"
        return 1
    fi

    log_info "Restoring PostgreSQL database from: $backup_file"

    # Create temporary uncompressed file
    local temp_file="${backup_file%.gz}"

    # Decompress backup
    if ! gunzip -c "$backup_file" > "$temp_file"; then
        log_error "Failed to decompress database backup"
        return 1
    fi

    # Export password for pg_restore
    export PGPASSWORD="$DB_PASSWORD"

    # Terminate active connections to the database
    log_info "Terminating active database connections..."
    psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="postgres" \
        --command="SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
        2>/dev/null || true

    # Drop and recreate database
    log_info "Recreating database..."
    psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="postgres" \
        --command="DROP DATABASE IF EXISTS \"$DB_NAME\";" \
        2>/dev/null || true

    psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="postgres" \
        --command="CREATE DATABASE \"$DB_NAME\";" \
        2>/dev/null || true

    # Restore database
    if pg_restore \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --create \
        "$temp_file"; then

        log_success "Database restore completed successfully"
    else
        log_error "Database restore failed"
        # Cleanup temp file
        rm -f "$temp_file"
        return 1
    fi

    # Cleanup temp file
    rm -f "$temp_file"

    return 0
}

# Restore Redis data
restore_redis() {
    local backup_file="$1"

    if [[ ! -f "$backup_file" ]]; then
        log_warning "Redis backup file not found: $backup_file"
        return 1
    fi

    log_info "Restoring Redis data from: $backup_file"

    # Check if Redis is available
    if ! redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+--auth "$REDIS_PASSWORD"} ping 2>/dev/null | grep -q PONG; then
        log_error "Redis is not available"
        return 1
    fi

    # Flush current Redis data
    log_info "Flushing current Redis data..."
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+--auth "$REDIS_PASSWORD"} FLUSHALL; then
        log_success "Redis data flushed"
    else
        log_error "Failed to flush Redis data"
        return 1
    fi

    # Note: Restoring Redis from RDB file requires Redis restart with the backup file
    # This is a simplified version. In production, you might want to:
    # 1. Stop Redis
    # 2. Replace the RDB file
    # 3. Start Redis

    log_warning "Redis restore requires manual intervention:"
    log_warning "1. Stop Redis service"
    log_warning "2. Copy $backup_file to Redis data directory (usually /var/lib/redis/dump.rdb)"
    log_warning "3. Start Redis service"
    log_warning "4. Verify data integrity"

    return 0
}

# Restore application files
restore_files() {
    local backup_file="$1"

    if [[ ! -f "$backup_file" ]]; then
        log_warning "Files backup not found: $backup_file"
        return 1
    fi

    log_info "Restoring application files from: $backup_file"

    # Create backup of current files before restore
    local current_backup="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
    log_info "Creating backup of current files: $current_backup"

    # Files to backup before restore
    local backup_items=(
        "prisma/schema.prisma"
        "public/uploads"
        ".env.production"
        "firebase.json"
    )

    if tar -czf "$current_backup" "${backup_items[@]}" 2>/dev/null; then
        log_success "Pre-restore backup created: $current_backup"
    else
        log_warning "Failed to create pre-restore backup"
    fi

    # Extract backup
    if tar -xzf "$backup_file" -C ./; then
        log_success "Application files restored successfully"
    else
        log_error "Failed to restore application files"
        return 1
    fi

    return 0
}

# Verify restore
verify_restore() {
    log_info "Verifying restore..."

    # Check database connection
    export PGPASSWORD="$DB_PASSWORD"
    if psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --command="SELECT 1;" \
        --quiet \
        2>/dev/null; then
        log_success "Database connection verified"
    else
        log_error "Database connection failed"
        return 1
    fi

    # Check Redis connection
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+--auth "$REDIS_PASSWORD"} ping 2>/dev/null | grep -q PONG; then
        log_success "Redis connection verified"
    else
        log_warning "Redis connection failed (this may be expected if Redis was restarted)"
    fi

    return 0
}

# Main restore process
main() {
    log_info "Starting Pigeon Auction Platform restore process..."

    # Validate environment variables
    if [[ -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
        log_error "Database credentials not provided. Set DB_USER and DB_PASSWORD environment variables."
        exit 1
    fi

    # Find backup files
    local backup_files=$(find_backup_files "$TIMESTAMP")
    IFS='|' read -r db_backup redis_backup files_backup <<< "$backup_files"

    if [[ -z "$db_backup" && -z "$redis_backup" && -z "$files_backup" ]]; then
        log_error "No backup files found for timestamp: $TIMESTAMP"
        log_info "Available backups:"
        ls -la "${BACKUP_DIR}"/pigeon_auction_backup_* 2>/dev/null || log_info "No backup files found in $BACKUP_DIR"
        exit 1
    fi

    log_info "Found backup files:"
    [[ -n "$db_backup" ]] && log_info "  Database: $db_backup"
    [[ -n "$redis_backup" ]] && log_info "  Redis: $redis_backup"
    [[ -n "$files_backup" ]] && log_info "  Files: $files_backup"

    # Confirm restore
    confirm_restore

    # Perform restores
    local restore_success=true

    if [[ -n "$db_backup" ]]; then
        if ! restore_database "$db_backup"; then
            restore_success=false
        fi
    fi

    if [[ -n "$redis_backup" ]]; then
        if ! restore_redis "$redis_backup"; then
            restore_success=false
        fi
    fi

    if [[ -n "$files_backup" ]]; then
        if ! restore_files "$files_backup"; then
            restore_success=false
        fi
    fi

    # Verify restore
    if [[ "$restore_success" == true ]]; then
        if verify_restore; then
            log_success "Restore process completed successfully!"
        else
            log_error "Restore verification failed"
            exit 1
        fi
    else
        log_error "Restore process failed"
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Restore process interrupted"; exit 1' INT TERM

# Show usage if no arguments
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 [timestamp]"
    echo ""
    echo "Arguments:"
    echo "  timestamp  - Specific backup timestamp (YYYYMMDD_HHMMSS) or 'latest'"
    echo ""
    echo "Examples:"
    echo "  $0 latest          # Restore from latest backup"
    echo "  $0 20231201_143000 # Restore from specific backup"
    exit 1
fi

# Run main function
main "$@"