#!/bin/bash

# ChainGive Database Backup Script
# Runs daily at 2 AM via cron job
# Usage: ./scripts/backup-database.sh

set -e

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/chaingive_backup_$DATE.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "[$(date)] Starting database backup..."

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Perform backup using pg_dump
export PGPASSWORD=$DB_PASS
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -b -v -f $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

# Get file size
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)

echo "[$(date)] Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"

# Delete old backups (older than RETENTION_DAYS)
find $BACKUP_DIR -name "chaingive_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Old backups deleted (retention: $RETENTION_DAYS days)"

# Upload to cloud storage (optional - uncomment if using AWS S3)
# if [ -n "$AWS_S3_BUCKET" ]; then
#   aws s3 cp $BACKUP_FILE s3://$AWS_S3_BUCKET/backups/
#   echo "[$(date)] Backup uploaded to S3"
# fi

# Send notification (optional)
# curl -X POST "https://api.chaingive.ng/v1/admin/notifications/backup-complete" \
#   -H "Content-Type: application/json" \
#   -d "{\"file\": \"$BACKUP_FILE\", \"size\": \"$BACKUP_SIZE\"}"

echo "[$(date)] Backup process complete!"

exit 0
