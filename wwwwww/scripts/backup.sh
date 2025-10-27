#!/bin/bash

# Database backup script for Pigeon Auction Platform
# This script creates backups of PostgreSQL database and Redis cache

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PREFIX="pigeon_auction_backup_${TIMESTAMP}"

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

# Create backup directory
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log_info "Created backup directory: $BACKUP_DIR"
    fi
}

# Backup PostgreSQL database
backup_database() {
    log_info "Starting PostgreSQL database backup..."

    local backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}_database.sql"

    # Export password for pg_dump
    export PGPASSWORD="$DB_PASSWORD"

    # Create database backup
    if pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --no-password \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="$backup_file"; then

        log_success "Database backup completed: $backup_file"

        # Compress the backup
        gzip "$backup_file"
        log_success "Database backup compressed: ${backup_file}.gz"

        echo "${backup_file}.gz"
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup Redis data
backup_redis() {
    log_info "Starting Redis backup..."

    local backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}_redis.rdb"

    # Check if Redis is available
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+--auth "$REDIS_PASSWORD"} ping 2>/dev/null | grep -q PONG; then
        # Create Redis backup using BGSAVE
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+--auth "$REDIS_PASSWORD"} BGSAVE; then
            log_success "Redis BGSAVE initiated"

            # Wait for BGSAVE to complete
            local attempts=0
            while [[ $attempts -lt 30 ]]; do
                if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ${REDIS_PASSWORD:+--auth "$REDIS_PASSWORD"} info persistence | grep -q "rdb_bgsave_in_progress:0"; then
                    break
                fi
                sleep 2
                ((attempts++))
            done

            if [[ $attempts -lt 30 ]]; then
                # Copy the RDB file (assuming default Redis data directory)
                # In production, adjust this path based on your Redis configuration
                local redis_rdb="/var/lib/redis/dump.rdb"
                if [[ -f "$redis_rdb" ]]; then
                    cp "$redis_rdb" "$backup_file"
                    log_success "Redis backup completed: $backup_file"
                    echo "$backup_file"
                else
                    log_warning "Redis RDB file not found at $redis_rdb"
                    return 0
                fi
            else
                log_error "Redis BGSAVE did not complete within timeout"
                return 1
            fi
        else
            log_error "Failed to initiate Redis BGSAVE"
            return 1
        fi
    else
        log_warning "Redis is not available, skipping Redis backup"
        return 0
    fi
}

# Backup application files (configuration, uploads)
backup_files() {
    log_info "Starting application files backup..."

    local backup_file="${BACKUP_DIR}/${BACKUP_PREFIX}_files.tar.gz"

    # Files and directories to backup
    local backup_items=(
        "prisma/schema.prisma"
        "public/uploads"
        ".env.production"
        "firebase.json"
    )

    # Create tar archive
    if tar -czf "$backup_file" "${backup_items[@]}" 2>/dev/null; then
        log_success "Application files backup completed: $backup_file"
        echo "$backup_file"
    else
        log_warning "Some files may not exist, but backup completed with available files: $backup_file"
        echo "$backup_file"
    fi
}

# Calculate backup size
calculate_backup_size() {
    local total_size=0

    for file in "$@"; do
        if [[ -f "$file" ]]; then
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            total_size=$((total_size + size))
        fi
    done

    echo "$total_size"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."

    local deleted_count=0

    # Find and delete old backup files
    find "$BACKUP_DIR" -name "pigeon_auction_backup_*.gz" -mtime +$RETENTION_DAYS -delete -print | while read -r file; do
        log_info "Deleted old backup: $file"
        ((deleted_count++))
    done

    find "$BACKUP_DIR" -name "pigeon_auction_backup_*.rdb" -mtime +$RETENTION_DAYS -delete -print | while read -r file; do
        log_info "Deleted old backup: $file"
        ((deleted_count++))
    done

    if [[ $deleted_count -gt 0 ]]; then
        log_success "Cleaned up $deleted_count old backup files"
    else
        log_info "No old backups to clean up"
    fi
}

# Generate backup report
generate_report() {
    local db_backup="$1"
    local redis_backup="$2"
    local files_backup="$3"
    local total_size="$4"

    local report_file="${BACKUP_DIR}/${BACKUP_PREFIX}_report.txt"

    cat > "$report_file" << EOF
Pigeon Auction Platform - Backup Report
========================================

Backup Date: $(date)
Backup ID: $TIMESTAMP
Environment: ${NODE_ENV:-production}

Database Backup:
- File: ${db_backup:-"Not created"}
- Size: $([[ -f "${db_backup:-}" ]] && (ls -lh "$db_backup" | awk '{print $5}') || echo "N/A")

Redis Backup:
- File: ${redis_backup:-"Not created"}
- Size: $([[ -f "${redis_backup:-}" ]] && (ls -lh "$redis_backup" | awk '{print $5}') || echo "N/A")

Files Backup:
- File: ${files_backup:-"Not created"}
- Size: $([[ -f "${files_backup:-}" ]] && (ls -lh "$files_backup" | awk '{print $5}') || echo "N/A")

Total Backup Size: $(numfmt --to=iec-i --suffix=B "$total_size" 2>/dev/null || echo "${total_size} bytes")

Retention Policy: $RETENTION_DAYS days
Backup Directory: $BACKUP_DIR

Status: SUCCESS
EOF

    log_success "Backup report generated: $report_file"
}

# Send notification (placeholder for monitoring integration)
send_notification() {
    local status="$1"
    local message="$2"

    # In production, integrate with monitoring service
    # Example: curl -X POST -H "Content-Type: application/json" -d "{\"status\":\"$status\",\"message\":\"$message\"}" $MONITORING_WEBHOOK

    if [[ "$status" == "success" ]]; then
        log_success "$message"
    else
        log_error "$message"
    fi
}

# Main backup process
main() {
    log_info "Starting Pigeon Auction Platform backup process..."

    # Validate environment variables
    if [[ -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
        log_error "Database credentials not provided. Set DB_USER and DB_PASSWORD environment variables."
        exit 1
    fi

    create_backup_dir

    local db_backup=""
    local redis_backup=""
    local files_backup=""
    local backup_files_list=()

    # Perform backups
    if db_backup=$(backup_database); then
        backup_files_list+=("$db_backup")
    fi

    if redis_backup=$(backup_redis); then
        if [[ -n "$redis_backup" ]]; then
            backup_files_list+=("$redis_backup")
        fi
    fi

    if files_backup=$(backup_files); then
        backup_files_list+=("$files_backup")
    fi

    # Calculate total size
    local total_size=$(calculate_backup_size "${backup_files_list[@]}")

    # Generate report
    generate_report "$db_backup" "$redis_backup" "$files_backup" "$total_size"

    # Cleanup old backups
    cleanup_old_backups

    # Send success notification
    send_notification "success" "Backup completed successfully. Total size: $(numfmt --to=iec-i --suffix=B "$total_size" 2>/dev/null || echo "${total_size} bytes")"

    log_success "Backup process completed successfully!"
    log_info "Backup files: ${backup_files_list[*]}"
}

# Handle script interruption
trap 'log_error "Backup process interrupted"; exit 1' INT TERM

# Run main function
main "$@"