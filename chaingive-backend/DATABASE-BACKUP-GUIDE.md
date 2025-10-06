# 💾 Database Backup & Recovery Guide

**Date:** October 6, 2025  
**Status:** ✅ Complete and Ready

---

## 📋 **Overview**

Automated daily backups of the ChainGive PostgreSQL database with:
- ✅ Daily backups at 2 AM
- ✅ 30-day retention policy
- ✅ Compressed backups (gzip)
- ✅ Easy restore process
- ✅ Optional cloud storage (S3)

---

## 🚀 **Quick Setup**

### 1. Make Scripts Executable
```bash
chmod +x scripts/backup-database.sh
chmod +x scripts/restore-database.sh
chmod +x scripts/setup-cron.sh
```

### 2. Setup Automated Backups
```bash
./scripts/setup-cron.sh
```

This will:
- Add a cron job for daily backups at 2 AM
- Create backup directory
- Set up logging

### 3. Test Backup Manually
```bash
./scripts/backup-database.sh
```

---

## 📂 **Backup Structure**

```
chaingive-backend/
├── backups/
│   ├── chaingive_backup_2025-10-06_02-00-00.sql.gz
│   ├── chaingive_backup_2025-10-05_02-00-00.sql.gz
│   └── ... (30 days of backups)
├── logs/
│   └── backup.log
└── scripts/
    ├── backup-database.sh
    ├── restore-database.sh
    └── setup-cron.sh
```

---

## 🔄 **How It Works**

### Daily Backup Process

1. **Cron Trigger**: Every day at 2:00 AM
2. **Extract DB Credentials**: From .env DATABASE_URL
3. **Run pg_dump**: Create full database backup
4. **Compress**: gzip for storage efficiency
5. **Cleanup**: Delete backups older than 30 days
6. **Log**: Record success/failure

---

## 💻 **Manual Backup**

### Create Backup Now
```bash
./scripts/backup-database.sh
```

**Output:**
```
[2025-10-06 14:30:00] Starting database backup...
[2025-10-06 14:30:15] Backup completed: ./backups/chaingive_backup_2025-10-06_14-30-00.sql.gz (12M)
[2025-10-06 14:30:15] Old backups deleted (retention: 30 days)
[2025-10-06 14:30:15] Backup process complete!
```

---

## 🔧 **Restore Database**

### Restore from Backup
```bash
./scripts/restore-database.sh ./backups/chaingive_backup_2025-10-06_02-00-00.sql.gz
```

**Process:**
1. Decompresses backup file
2. Confirms with you (safety check)
3. Terminates active connections
4. Drops existing data
5. Restores from backup

**⚠️ WARNING:** This OVERWRITES your current database!

---

## 📊 **Backup Monitoring**

### Check Backup Logs
```bash
tail -f logs/backup.log
```

### List Recent Backups
```bash
ls -lh backups/ | tail -7
```

### Check Backup Size
```bash
du -sh backups/
```

---

## ☁️ **Cloud Storage (AWS S3)**

### Setup S3 Upload (Optional)

1. **Install AWS CLI**
```bash
brew install awscli  # macOS
apt install awscli   # Ubuntu
```

2. **Configure AWS**
```bash
aws configure
# Enter: Access Key, Secret Key, Region, Output format
```

3. **Add S3 Bucket to .env**
```env
AWS_S3_BUCKET=chaingive-backups
AWS_REGION=us-east-1
```

4. **Uncomment S3 Upload in backup-database.sh**
```bash
# Line 35-38 in backup-database.sh
if [ -n "$AWS_S3_BUCKET" ]; then
  aws s3 cp $BACKUP_FILE s3://$AWS_S3_BUCKET/backups/
  echo "[$(date)] Backup uploaded to S3"
fi
```

---

## 🔐 **Security Best Practices**

### 1. Encrypt Backups
```bash
# Encrypt before uploading to S3
gpg --symmetric --cipher-algo AES256 $BACKUP_FILE

# Decrypt when needed
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### 2. Secure .env File
```bash
chmod 600 .env
```

### 3. Restrict Script Permissions
```bash
chmod 700 scripts/backup-database.sh
chmod 700 scripts/restore-database.sh
```

### 4. Offsite Backups
- Store in different cloud provider (S3, Backblaze, Google Cloud)
- Keep local + cloud copies
- Test restores monthly

---

## ⏰ **Cron Schedule Options**

Edit with: `crontab -e`

```bash
# Daily at 2 AM
0 2 * * * /path/to/backup-database.sh

# Twice daily (2 AM and 2 PM)
0 2,14 * * * /path/to/backup-database.sh

# Every 6 hours
0 */6 * * * /path/to/backup-database.sh

# Weekly (Sunday 3 AM)
0 3 * * 0 /path/to/backup-database.sh
```

---

## 🧪 **Testing Restores**

### Test Restore (Safe Method)

1. **Create Test Database**
```bash
createdb chaingive_test
```

2. **Restore to Test DB**
```bash
# Modify restore script to use chaingive_test
pg_restore -h localhost -U chaingive -d chaingive_test backup.sql
```

3. **Verify Data**
```bash
psql -d chaingive_test -c "SELECT COUNT(*) FROM users;"
```

4. **Drop Test DB**
```bash
dropdb chaingive_test
```

---

## 📈 **Monitoring & Alerts**

### Check if Backups Are Running
```bash
# Last backup time
ls -lt backups/ | head -2

# If no backup today, something's wrong!
```

### Setup Alerts (Optional)

Add to backup script:
```bash
# Send alert if backup fails
if [ $? -ne 0 ]; then
  curl -X POST https://api.chaingive.ng/v1/admin/alerts \
    -d '{"type": "backup_failed", "message": "Daily backup failed!"}'
fi
```

---

## 🚨 **Disaster Recovery Plan**

### Scenario: Database Corrupted

1. **Stop Application**
```bash
pm2 stop chaingive-api
```

2. **Restore Last Good Backup**
```bash
./scripts/restore-database.sh ./backups/latest.sql.gz
```

3. **Verify Data**
```bash
psql -d chaingive_db -c "SELECT COUNT(*) FROM users;"
```

4. **Restart Application**
```bash
pm2 start chaingive-api
```

---

### Scenario: Accidental Data Deletion

1. **Identify Last Good Backup** (before deletion)
```bash
ls -lt backups/
```

2. **Create Current Backup First** (safety)
```bash
./scripts/backup-database.sh
```

3. **Restore Old Backup**
```bash
./scripts/restore-database.sh ./backups/chaingive_backup_2025-10-05_02-00-00.sql.gz
```

---

## 📋 **Backup Checklist**

### Daily (Automated)
- [x] Backup runs at 2 AM
- [x] Compressed and stored
- [x] Old backups deleted

### Weekly (Manual)
- [ ] Verify latest backup exists
- [ ] Check backup log for errors
- [ ] Review disk space usage

### Monthly (Manual)
- [ ] Test restore process
- [ ] Verify data integrity
- [ ] Update retention policy if needed
- [ ] Review cloud storage costs

---

## 💡 **Tips**

### Reduce Backup Size
```bash
# Exclude logs table from backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -T logs -F c -f backup.sql
```

### Faster Restores
```bash
# Parallel restore (4 jobs)
pg_restore -j 4 -d chaingive_db backup.sql
```

### Point-in-Time Recovery
```bash
# Enable WAL archiving in PostgreSQL
# Allows restore to specific timestamp
```

---

## ✅ **Verification**

After setup, verify:

```bash
# 1. Check cron job exists
crontab -l | grep backup

# 2. Test backup
./scripts/backup-database.sh

# 3. Check backup file
ls -lh backups/

# 4. Test restore (on test database!)
createdb chaingive_test
# ... restore test ...
dropdb chaingive_test
```

---

## 🎉 **Setup Complete!**

Your database backups are now:
- ✅ Automated daily
- ✅ Compressed for efficiency
- ✅ Retained for 30 days
- ✅ Easy to restore
- ✅ Production-ready

**Next:** Monitor first week to ensure backups run successfully!

---

**Questions?** Check logs: `tail -f logs/backup.log`
