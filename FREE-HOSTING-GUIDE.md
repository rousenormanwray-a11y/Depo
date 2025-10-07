# 🚀 Free Hosting Guide for ChainGive

**Date:** October 6, 2025  
**Stack:** React Native + Node.js + Supabase  
**Goal:** 100% Free Hosting Setup

---

## 📋 **YOUR STACK**

✅ **Database:** Supabase (already set up)  
🔧 **Backend:** Node.js + Express + Prisma  
📱 **Frontend:** React Native mobile app  

---

## 🎯 **RECOMMENDED FREE HOSTING**

### **Best Options for Your Setup:**

| Service | Backend | Mobile App | Free Tier | Best For |
|---------|---------|------------|-----------|----------|
| **Railway** | ✅ Yes | ❌ No | $5 credit/month | Backend API |
| **Render** | ✅ Yes | ❌ No | 750 hrs/month | Backend API |
| **Fly.io** | ✅ Yes | ❌ No | 3 VMs free | Backend API |
| **Expo EAS** | ❌ No | ✅ Yes | 30 builds/month | Mobile builds |
| **Vercel** | ✅ Yes | ❌ No | Unlimited | Serverless |

---

## 🏆 **RECOMMENDED SETUP (100% FREE)**

```
┌─────────────┐
│   MOBILE    │  Expo EAS Build (Free)
│   APP       │  → APK/IPA hosting
└──────┬──────┘
       │
       ↓ API Calls
┌─────────────┐
│   BACKEND   │  Railway/Render (Free)
│   Node.js   │  → API Endpoints
└──────┬──────┘
       │
       ↓ Database Queries
┌─────────────┐
│  SUPABASE   │  Already set up
│  PostgreSQL │  Free tier
└─────────────┘
```

---

## 🔧 **OPTION 1: RAILWAY (BEST FOR BACKEND)**

### **Why Railway?**
✅ $5 free credit per month  
✅ Easy GitHub integration  
✅ Automatic deployments  
✅ PostgreSQL addon (if needed)  
✅ Custom domains  
✅ Environment variables  
✅ Logs & monitoring  

### **Setup Backend on Railway:**

**Step 1: Sign Up**
```
1. Go to: https://railway.app
2. Sign up with GitHub
3. Authorize Railway
```

**Step 2: Create New Project**
```
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select "chaingive-backend" folder
```

**Step 3: Configure Environment Variables**
```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=*
```

**Step 4: Configure Build**
```yaml
# railway.json (create in chaingive-backend/)
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npx prisma migrate deploy"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Step 5: Deploy**
```
✅ Push to GitHub main branch
✅ Railway auto-deploys
✅ Get your API URL: https://your-app.railway.app
```

**Your Railway URL:**
```
https://chaingive-backend-production.up.railway.app
```

---

## 🎨 **OPTION 2: RENDER (ALTERNATIVE BACKEND)**

### **Why Render?**
✅ 750 free hours/month (enough for 1 instance)  
✅ Automatic HTTPS  
✅ Auto-deploy from GitHub  
✅ Custom domains  
✅ Free PostgreSQL (if needed)  
✅ Persistent disk storage  

### **Setup Backend on Render:**

**Step 1: Sign Up**
```
1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render
```

**Step 2: Create Web Service**
```
1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repo
4. Choose "chaingive-backend"
```

**Step 3: Configure Service**
```yaml
Name: chaingive-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: chaingive-backend

Build Command:
npm install && npx prisma generate && npx prisma migrate deploy

Start Command:
npm start
```

**Step 4: Add Environment Variables**
```
DATABASE_URL=your-supabase-url
JWT_SECRET=your-secret
NODE_ENV=production
PORT=3000
```

**Step 5: Deploy**
```
✅ Click "Create Web Service"
✅ Render builds and deploys
✅ Get your URL: https://your-app.onrender.com
```

**⚠️ Note:** Free tier spins down after 15 minutes of inactivity (cold starts ~30s)

---

## 📱 **MOBILE APP: EXPO EAS BUILD**

### **Why Expo EAS?**
✅ 30 free builds per month  
✅ Automatic APK/IPA generation  
✅ OTA updates  
✅ App Store submission  
✅ TestFlight integration  

### **Setup Expo EAS:**

**Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

**Step 2: Login to Expo**
```bash
eas login
```

**Step 3: Configure EAS**
```bash
cd chaingive-mobile
eas build:configure
```

**Step 4: Create `eas.json`**
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "release"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Step 5: Update API Base URL**
```typescript
// chaingive-mobile/src/services/api.ts
const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://your-backend.railway.app/v1'  // Railway URL
    : 'http://localhost:3000/v1';
```

**Step 6: Build APK**
```bash
# Build Android APK
eas build --platform android --profile preview

# Build iOS IPA (requires Apple Developer account)
eas build --platform ios --profile preview
```

**Step 7: Download & Distribute**
```
✅ Get APK link from Expo dashboard
✅ Share with testers
✅ Or submit to Play Store
```

---

## 🌐 **OPTION 3: FLY.IO (ALTERNATIVE)**

### **Why Fly.io?**
✅ 3 VMs free (256MB RAM each)  
✅ Global edge network  
✅ Automatic HTTPS  
✅ Fast deployments  
✅ Docker-based  

### **Setup Backend on Fly.io:**

**Step 1: Install Flyctl**
```bash
curl -L https://fly.io/install.sh | sh
```

**Step 2: Login**
```bash
flyctl auth login
```

**Step 3: Launch App**
```bash
cd chaingive-backend
flyctl launch

# Answer prompts:
# App name: chaingive-backend
# Region: Choose closest
# PostgreSQL: No (using Supabase)
# Redis: No
# Deploy now: Yes
```

**Step 4: Set Environment Variables**
```bash
flyctl secrets set \
  DATABASE_URL="your-supabase-url" \
  JWT_SECRET="your-secret" \
  NODE_ENV="production"
```

**Step 5: Deploy**
```bash
flyctl deploy
```

---

## 💰 **COST COMPARISON**

| Service | Free Tier | Limits | Cold Start | Best For |
|---------|-----------|--------|------------|----------|
| **Railway** | $5/month credit | ~100 hours | No | Production |
| **Render** | 750 hours/month | 1 instance | Yes (30s) | Side projects |
| **Fly.io** | 3 VMs (256MB) | RAM limited | No | Global apps |
| **Vercel** | Unlimited | Serverless | No | API routes |
| **Expo EAS** | 30 builds/month | Build minutes | N/A | Mobile apps |

---

## 🎯 **RECOMMENDED SETUP FOR CHAINGIVE**

### **Production Setup (100% Free):**

```
1. BACKEND → Railway (Best performance, no cold starts)
   - API URL: https://chaingive-backend.up.railway.app
   - $5 credit = ~100 hours/month
   - Enough for development/testing

2. MOBILE → Expo EAS Build
   - 30 builds/month
   - OTA updates
   - TestFlight/Play Store ready

3. DATABASE → Supabase (Already using)
   - 500MB storage
   - 2GB bandwidth
   - Unlimited API requests
```

### **Alternative Setup (If Railway credit runs out):**

```
1. BACKEND → Render (750 hours/month)
   - ⚠️ Has cold starts (30s)
   - Free forever
   - Good for low-traffic apps

2. MOBILE → Expo EAS
   - Same as above

3. DATABASE → Supabase
   - Same as above
```

---

## 📝 **STEP-BY-STEP DEPLOYMENT**

### **Phase 1: Setup Backend**

```bash
# 1. Choose Railway (recommended)
# 2. Sign up at https://railway.app
# 3. Connect GitHub repo
# 4. Select chaingive-backend
# 5. Add environment variables
# 6. Deploy
# 7. Copy API URL
```

### **Phase 2: Setup Mobile App**

```bash
# 1. Update API_BASE_URL in api.ts
cd chaingive-mobile/src/services
# Edit api.ts with Railway URL

# 2. Install EAS CLI
npm install -g eas-cli

# 3. Login to Expo
eas login

# 4. Configure EAS
eas build:configure

# 5. Build Android APK
eas build --platform android --profile preview

# 6. Download APK
# Go to: https://expo.dev/accounts/[username]/projects/chaingive-mobile/builds
```

### **Phase 3: Configure Supabase**

```bash
# 1. Get Supabase connection string
# Dashboard → Project Settings → Database → Connection string

# 2. Add to Railway/Render
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# 3. Run migrations (if needed)
npx prisma migrate deploy
```

---

## 🔐 **ENVIRONMENT VARIABLES**

**For Backend (Railway/Render):**

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# CORS
ALLOWED_ORIGINS=*

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn

# BTCPay (if using)
BTCPAY_SERVER_URL=https://btcpay.example.com
BTCPAY_API_KEY=your-api-key
BTCPAY_STORE_ID=your-store-id
```

---

## 🧪 **TESTING YOUR DEPLOYMENT**

### **Test Backend:**
```bash
# Health check
curl https://your-backend.railway.app/health

# Test API
curl https://your-backend.railway.app/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "password": "test123"}'
```

### **Test Mobile App:**
```bash
# Install APK on Android device
adb install app-release.apk

# Or share APK link with testers
```

---

## 🚨 **IMPORTANT NOTES**

### **Railway:**
✅ Best for production  
✅ No cold starts  
⚠️ $5 credit = ~100 hours (enough for development)  
⚠️ Need to add payment method after trial  

### **Render:**
✅ Truly free forever  
✅ 750 hours = 31.25 days (enough for 1 instance)  
⚠️ Cold starts after 15 min inactivity  
⚠️ First request takes 30-60 seconds  

### **Expo EAS:**
✅ 30 builds/month is enough  
✅ Each build ~5-10 minutes  
⚠️ Need Expo account  
⚠️ iOS builds require Apple Developer ($99/year)  

---

## 📊 **MONITORING & LOGS**

### **Railway:**
```
1. Go to Railway dashboard
2. Click your project
3. View "Deployments" tab
4. See real-time logs
5. Monitor CPU/RAM usage
```

### **Render:**
```
1. Go to Render dashboard
2. Click your service
3. View "Logs" tab
4. See deployment history
5. Monitor metrics
```

### **Expo:**
```
1. Go to https://expo.dev
2. Click "Builds"
3. View build history
4. Download APK/IPA
5. Share with testers
```

---

## 🎁 **BONUS: GITHUB ACTIONS CI/CD**

Auto-deploy on push to main:

**`.github/workflows/deploy-backend.yml`:**
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'chaingive-backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

---

## ✅ **FINAL CHECKLIST**

### **Backend Deployment:**
- [ ] Railway/Render account created
- [ ] GitHub repo connected
- [ ] Environment variables set
- [ ] Migrations run successfully
- [ ] API responding at public URL
- [ ] Health check passes
- [ ] CORS configured correctly

### **Mobile App:**
- [ ] Expo account created
- [ ] EAS CLI installed
- [ ] `eas.json` configured
- [ ] API_BASE_URL updated
- [ ] Android APK built
- [ ] APK tested on device
- [ ] Ready to distribute

### **Database:**
- [ ] Supabase project active
- [ ] Connection string copied
- [ ] Tables created (via migrations)
- [ ] Backend connected successfully

---

## 🎉 **YOU'RE DONE!**

Your full-stack app is now hosted 100% FREE:

```
✅ Mobile App: Built with Expo EAS
✅ Backend API: Hosted on Railway/Render  
✅ Database: Running on Supabase
✅ Total Cost: $0/month
```

**API URL:** `https://your-app.railway.app/v1`  
**APK Download:** `https://expo.dev/builds/...`  
**Database:** `Supabase Dashboard`

---

## 🆘 **NEED HELP?**

**Railway Support:** https://railway.app/help  
**Render Docs:** https://render.com/docs  
**Expo Docs:** https://docs.expo.dev  
**Supabase Docs:** https://supabase.com/docs

---

**Happy Deploying! 🚀**
