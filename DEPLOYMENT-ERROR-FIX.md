# 🔴 Prisma Runtime Error - Quick Fix Guide

## 🚨 ERROR:
```
at ei.handleAndLogRequestError (/app/node_modules/@prisma/client/runtime/library.js:121:6593)
```

This is a **Prisma database error** occurring at runtime.

---

## 🔍 **MOST COMMON CAUSES:**

### 1. **Database Connection Not Configured** ❌ (90% of cases)
Your `DATABASE_URL` environment variable is not set or incorrect.

### 2. **Migrations Not Run** ❌
Database tables don't exist yet.

### 3. **Schema Mismatch** ❌
Code expects different schema than what's in database.

---

## ✅ **FIX #1: Set DATABASE_URL Environment Variable**

### **For Railway:**
```bash
# Go to Railway dashboard
# Click your project → Variables tab
# Add this variable:

DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```

### **For Render:**
```bash
# Go to Render dashboard
# Click your service → Environment tab
# Add:

DATABASE_URL=your_supabase_postgres_url
```

### **For Koyeb/Fly.io:**
```bash
# CLI method:
railway variables set DATABASE_URL="your_url"
# or
flyctl secrets set DATABASE_URL="your_url"
```

---

## ✅ **FIX #2: Run Prisma Migrations**

After setting `DATABASE_URL`, run migrations:

```bash
# SSH into your deployment or run as deploy command:
npx prisma migrate deploy
```

### **Auto-run migrations on deploy:**

**Railway (`railway.json`):**
```json
{
  "build": {
    "buildCommand": "npm ci && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/server.js"
  }
}
```

**Render (`render.yaml`):**
```yaml
services:
  - type: web
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npx prisma migrate deploy && node dist/server.js
```

**Dockerfile:**
```dockerfile
# Already configured ✅
CMD npx prisma migrate deploy && node dist/server.js
```

---

## ✅ **FIX #3: Verify Supabase Connection**

### **Get your DATABASE_URL from Supabase:**

1. Go to Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **Settings** → **Database**
4. Copy **Connection String** → **URI**
5. It looks like:
   ```
   postgresql://postgres.xxx:[PASSWORD]@aws-0-xxx.pooler.supabase.com:5432/postgres
   ```
6. Replace `[PASSWORD]` with your actual database password

---

## 🔧 **DEBUGGING STEPS:**

### **Step 1: Check if DATABASE_URL is set**

Add this to your deployment logs/health check:

```typescript
// In server.ts (temporarily)
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✅' : 'MISSING ❌');
```

### **Step 2: Test Prisma connection**

```typescript
// In server.ts
import prisma from './utils/prisma';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
```

### **Step 3: Check migration status**

```bash
# Run in deployment terminal:
npx prisma migrate status
```

---

## 📋 **COMPLETE DEPLOYMENT CHECKLIST:**

### **Environment Variables to Set:**

```env
# Required:
DATABASE_URL=postgresql://...  # From Supabase
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Optional but recommended:
NODE_ENV=production
PORT=8000
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### **Generate Secrets:**

```bash
# Generate JWT secrets (run locally):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output for JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output for JWT_REFRESH_SECRET
```

---

## 🚀 **QUICK FIX COMMANDS:**

### **If using Railway:**

```bash
# 1. Set DATABASE_URL
railway variables set DATABASE_URL="your_supabase_url"

# 2. Set JWT secrets
railway variables set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
railway variables set JWT_REFRESH_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

# 3. Redeploy (migrations will auto-run)
railway up
```

### **If using Render:**

```bash
# 1. Go to Dashboard → Environment
# 2. Add all variables above
# 3. Click "Manual Deploy" → "Deploy latest commit"
```

---

## 🔍 **GET MORE ERROR DETAILS:**

To see the full error message, add logging:

```typescript
// In src/server.ts
process.on('unhandledRejection', (error) => {
  console.error('🔴 UNHANDLED REJECTION:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🔴 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});
```

Then check your deployment logs for the full error message.

---

## 💡 **MOST LIKELY SOLUTION:**

Based on your error, **90% chance** it's:

```
❌ DATABASE_URL not set in deployment environment variables
```

**Fix:**
1. Go to your hosting dashboard
2. Add environment variable: `DATABASE_URL=your_supabase_postgres_url`
3. Redeploy
4. ✅ Should work!

---

## 📞 **Still Not Working?**

**Check deployment logs and share:**
1. Full error message
2. First 100 lines of startup logs
3. Platform you're using (Railway/Render/etc.)

---

## ✅ **VERIFICATION:**

After fixing, your app should:
1. ✅ Connect to database successfully
2. ✅ Run migrations automatically
3. ✅ Start without errors
4. ✅ Respond to `/health` endpoint

Test: `curl https://your-app.com/health`
Expected: `{"status":"ok"}`

---

**Most common fix: Add DATABASE_URL environment variable! 🎯**
