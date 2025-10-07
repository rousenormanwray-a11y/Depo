# 🚂 **RAILWAY DEPLOYMENT GUIDE**

**Deploy ChainGive backend to Railway in 5 minutes!**

---

## 🎯 **WHY RAILWAY?**

```
✅ Auto-detects Docker in subdirectories
✅ Perfect for monorepos
✅ Easier than Koyeb
✅ Great free tier ($5 credit/month)
✅ No configuration headaches
✅ Fast deployments
```

---

## 🚀 **METHOD 1: DEPLOY FROM GITHUB** ⭐ **EASIEST**

### **Step 1: Go to Railway** (1 minute)
👉 **https://railway.app/**

- Click **"Login"**
- Select **"Login with GitHub"**
- Authorize Railway

### **Step 2: Create New Project** (1 minute)
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose repository: **`Depo`**
- Railway scans for services

### **Step 3: Select Service** (30 seconds)
Railway should auto-detect `chaingive-backend`!

If it doesn't, click **"Add a service"** → **"GitHub Repo"** → Select directory: `chaingive-backend`

### **Step 4: Configure Settings** (1 minute)

Click your service → **Settings** tab:

**Root Directory:**
```
chaingive-backend
```

**Build:**
Railway auto-detects Dockerfile! ✅

**Port:** Railway auto-detects from Dockerfile ✅

### **Step 5: Add Environment Variables** (2 minutes)

Click **"Variables"** tab → Add each variable:

**CRITICAL:**
```bash
DATABASE_URL
postgresql://postgres.mmxzndkglilnxwukpptt:deoi_101dxx90*@aws-1-us-east-2.pooler.supabase.com:5432/postgres

JWT_SECRET
chaingive-jwt-secret-change-in-production-please

JWT_REFRESH_SECRET
chaingive-refresh-secret-change-in-production-please

NODE_ENV
production
```

**OPTIONAL:**
```bash
API_VERSION
v1

ALLOWED_ORIGINS
https://chaingive.ng,https://chaingive-backend-production.up.railway.app

JWT_EXPIRES_IN
24h

JWT_REFRESH_EXPIRES_IN
30d
```

### **Step 6: Deploy!** (Auto)
Railway deploys automatically after you add variables!

Watch the build logs in real-time.

### **Step 7: Get Your URL** (30 seconds)
- Click **"Settings"** tab
- Scroll to **"Networking"** section
- Click **"Generate Domain"**
- Copy URL: `https://chaingive-backend-production.up.railway.app`

### **Step 8: Test** (30 seconds)
```bash
curl https://chaingive-backend-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-07T..."
}
```

✅ **DONE! Your backend is live!**

---

## 🚀 **METHOD 2: DEPLOY FROM DOCKER IMAGE**

If you want to pre-build and push to Docker Hub:

### **Step 1: Build Docker Image Locally**

```bash
cd /workspace/chaingive-backend

# Build image
docker build -t yourusername/chaingive-backend:latest -f Dockerfile.railway .

# Test locally
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="test" \
  -e NODE_ENV="production" \
  yourusername/chaingive-backend:latest
```

### **Step 2: Push to Docker Hub**

```bash
# Login to Docker Hub
docker login

# Push image
docker push yourusername/chaingive-backend:latest
```

### **Step 3: Deploy to Railway from Docker Hub**

1. Go to Railway → New Project
2. Select **"Deploy a Docker Image"**
3. Enter: `yourusername/chaingive-backend:latest`
4. Add environment variables
5. Deploy!

**But Method 1 is easier!** No need to build/push manually.

---

## 📊 **DEPLOYMENT TIMELINE**

```
00:00 - Railway starts build
00:01 - Cloning repository ✅
00:02 - Detected Dockerfile ✅
00:03 - Building Docker image...
00:05 - Installing dependencies...
00:08 - Building TypeScript...
00:10 - Image built successfully ✅
00:11 - Deploying container...
00:12 - Health check passed ✅
00:13 - Service live! 🎉
```

**Total: ~10-13 minutes**

---

## 🎯 **RAILWAY VS KOYEB**

| Feature | Railway | Koyeb |
|---------|---------|-------|
| **Monorepo Support** | ✅ Perfect | ⚠️ Issues |
| **Setup Time** | 5 min | 30+ min (issues) |
| **Docker Detection** | ✅ Auto | ⚠️ Manual |
| **Free Tier** | $5 credit/mo | Good |
| **UI** | Clean | Complex |
| **Build Speed** | Fast | Medium |
| **Subdirectories** | ✅ Easy | ⚠️ Complex |

**Winner: Railway! 🏆**

---

## 💰 **RAILWAY FREE TIER**

```
✅ $5 free credit per month
✅ No credit card required to start
✅ ~500 hours of usage
✅ Perfect for development
✅ Upgrade to Pro ($20/mo) when ready
```

**Your free tier includes:**
- 512 MB RAM
- 1 GB disk
- Shared CPU
- Custom domain
- Free SSL

---

## ✅ **SUCCESS CHECKLIST**

```
SETUP:
[✅] Railway account created
[✅] GitHub connected
[✅] Repository selected
[✅] Service detected

CONFIGURATION:
[✅] Root directory set: chaingive-backend
[✅] Dockerfile detected
[✅] Environment variables added
[✅] DATABASE_URL set
[✅] JWT secrets set

DEPLOYMENT:
[✅] Build completed
[✅] Container started
[✅] Health check passed
[✅] Domain generated
[✅] Service running
```

---

## 🔍 **VERIFY DEPLOYMENT**

### **Check Service Status:**
- Railway Dashboard → Your Service
- Should show: **🟢 Active**

### **View Logs:**
- Click **"Deployments"** tab
- Click latest deployment
- View build logs and runtime logs

### **Test Endpoints:**
```bash
# Set your Railway URL
RAILWAY_URL="https://chaingive-backend-production.up.railway.app"

# Health check
curl $RAILWAY_URL/health

# API test
curl $RAILWAY_URL/api/v1/leaderboard/global

# Marketplace
curl $RAILWAY_URL/api/v1/marketplace
```

---

## 📱 **UPDATE MOBILE APP**

Once backend is live on Railway:

```bash
cd /workspace/chaingive-mobile

# Edit .env file:
API_BASE_URL=https://chaingive-backend-production.up.railway.app/api/v1

# Save and rebuild mobile app
```

Now your mobile app connects to Railway backend!

---

## 🆘 **TROUBLESHOOTING**

### **Build Failed - Prisma Error**
**Fix:** Make sure DATABASE_URL is set in Variables

### **Build Failed - npm Error**
**Fix:** Railway auto-installs dependencies, check package.json

### **Health Check Failed**
**Fix:** Check runtime logs, verify server.ts binds to 0.0.0.0

### **Can't Access Service**
**Fix:** Make sure domain is generated in Networking section

### **Environment Variables Not Working**
**Fix:** Redeploy after adding variables (click Redeploy button)

---

## 💡 **PRO TIPS**

### **1. Auto-Deploy on Push**
Railway auto-deploys when you push to main branch! 🎉

### **2. Custom Domain**
- Settings → Networking → Custom Domain
- Add your domain (e.g., api.chaingive.ng)
- Update DNS records
- Free SSL included!

### **3. View Metrics**
- Click **"Metrics"** tab
- See CPU, RAM, Network usage
- Monitor performance

### **4. Scale Up**
- Settings → Resources
- Increase RAM/CPU as needed
- Only pay for what you use

### **5. Multiple Environments**
- Create staging environment
- Deploy from `develop` branch
- Test before production

---

## 🎊 **ADVANTAGES OF RAILWAY**

**Why developers love Railway:**

✨ **Zero Configuration**
- Just connect GitHub
- Railway does the rest

✨ **Great DX (Developer Experience)**
- Clean UI
- Real-time logs
- Easy debugging

✨ **Fast Deployments**
- Average build: 10 minutes
- Instant rollbacks
- Preview deployments

✨ **Transparent Pricing**
- Pay only for usage
- No hidden costs
- Free tier is generous

✨ **Excellent Support**
- Active Discord community
- Great documentation
- Fast response times

---

## 📚 **RESOURCES**

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Railway Templates: https://railway.app/templates
- Railway CLI: https://docs.railway.app/develop/cli

---

## 🚀 **QUICK RECAP**

**To deploy to Railway:**

1. ✅ Go to https://railway.app/
2. ✅ Login with GitHub
3. ✅ New Project → Deploy from GitHub
4. ✅ Select `Depo` repository
5. ✅ Set root directory: `chaingive-backend`
6. ✅ Add environment variables
7. ✅ Generate domain
8. ✅ Test endpoint
9. ✅ Done!

**Time: 5-10 minutes**

**Result: Backend live on Railway! 🎉**

---

## 🎯 **NEXT STEPS**

**After successful deployment:**

1. ✅ Update mobile app with Railway URL
2. ✅ Test all API endpoints
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring (Sentry, etc.)
5. ✅ Deploy mobile app to EAS/App stores
6. ✅ Launch! 🚀

---

**Railway is the easiest way to deploy your backend!** 🚂

**Any issues? Let me know!** 😊
