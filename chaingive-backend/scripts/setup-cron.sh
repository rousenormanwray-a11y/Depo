#!/bin/bash

# ChainGive Cron Jobs Setup
# Run this once to set up automated backups

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Setting up ChainGive cron jobs..."

# Make scripts executable
chmod +x $SCRIPT_DIR/backup-database.sh
chmod +x $SCRIPT_DIR/restore-database.sh

# Add cron job for daily backups at 2 AM
CRON_JOB="0 2 * * * cd $PROJECT_DIR && $SCRIPT_DIR/backup-database.sh >> $PROJECT_DIR/logs/backup.log 2>&1"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -v "backup-database.sh") | crontab -

# Add the cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added: Daily database backup at 2 AM"
echo "✅ Backup location: $PROJECT_DIR/backups/"
echo "✅ Backup logs: $PROJECT_DIR/logs/backup.log"
echo ""
echo "To view cron jobs: crontab -l"
echo "To remove: crontab -e (then delete the line)"

exit 0
