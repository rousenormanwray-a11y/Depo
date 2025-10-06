#!/bin/bash

# ChainGive Database Restore Script
# Usage: ./scripts/restore-database.sh <backup-file>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  echo "Example: $0 ./backups/chaingive_backup_2025-10-06_02-00-00.sql.gz"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "[$(date)] Starting database restore from: $BACKUP_FILE"

# Extract database connection details
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Decompress if gzipped
if [[ $BACKUP_FILE == *.gz ]]; then
  echo "[$(date)] Decompressing backup..."
  gunzip -c $BACKUP_FILE > ${BACKUP_FILE%.gz}
  BACKUP_FILE=${BACKUP_FILE%.gz}
fi

# Warning
echo "⚠️  WARNING: This will OVERWRITE the current database!"
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Drop existing connections
export PGPASSWORD=$DB_PASS
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';"

# Restore database
pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c -v $BACKUP_FILE

echo "[$(date)] Database restore completed successfully!"

exit 0
