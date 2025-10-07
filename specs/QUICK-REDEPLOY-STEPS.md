# ⚡ **QUICK KOYEB REDEPLOY STEPS**

**Follow these steps to redeploy after fixing the error**

---

## 🎯 **WHAT WAS FIXED**

### **Issue #1: Missing Dockerfile** ✅ FIXED
- Created optimized multi-stage Dockerfile
- Includes Prisma generation
- Production-ready configuration

### **Issue #2: Port Binding** ✅ FIXED
- Changed from `app.listen(PORT)` to `app.listen(PORT, '0.0.0.0')`
- Koyeb requires binding to 0.0.0.0 for external access
- **This is critical for Docker/cloud deployments**

### **Issue #3: Build Configuration** ✅ FIXED
- Added .dockerignore
- Added .koyeb.yml
- Configured proper build commands

---

## 🚀 **REDEPLOY NOW**

### **Step 1: Push Changes to GitHub** (Already done ✅)

```bash
cd /workspace/chaingive-backend
git add .
git commit -m "fix: Update server to bind to 0.0.0.0 for Koyeb deployment"
git push origin main
```

### **Step 2: In Koyeb Dashboard**

**Option A: Auto-Redeploy** (if GitHub integration enabled)
- Koyeb will automatically detect the push
- New deployment will start in 1-2 minutes
- Watch the build logs

**Option B: Manual Redeploy**
1. Go to https://app.koyeb.com/
2. Click your service (chaingive-backend)
3. Click "Redeploy" button
4. Or click "Settings" → "Redeploy"

### **Step 3: Monitor Deployment**

Watch for these stages:
1. ✅ **Cloning repository**
2. ✅ **Building Docker image** (5-10 min)
3. ✅ **Starting container**
4. ✅ **Health check passing**
5. ✅ **Service running**

### **Step 4: Verify Deployment**

Once deployment completes:

```bash
# Test health endpoint
curl https://your-app-name.koyeb.app/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-10-07T..."
# }

# Test API
curl https://your-app-name.koyeb.app/api/v1/leaderboard/global
```

---

## 🔍 **ENVIRONMENT VARIABLES TO SET**

Before the app will work fully, set these in Koyeb:

### **CRITICAL (Required for app to start):**

```bash
DATABASE_URL=postgresql://postgres.mmxzndkglilnxwukpptt:deoi_101dxx90*@aws-1-us-east-2.pooler.supabase.com:5432/postgres
JWT_SECRET=chaingive-jwt-secret-change-in-production-please
JWT_REFRESH_SECRET=chaingive-refresh-secret-change-in-production-please
NODE_ENV=production
PORT=8000
```

### **How to set in Koyeb:**

1. Go to your service in Koyeb
2. Click "Settings" tab
3. Scroll to "Environment variables"
4. Click "Add variable"
5. For each variable:
   - Name: `DATABASE_URL`
   - Value: `your-database-url`
   - Click "Add"
6. Click "Deploy" to apply changes

---

## ⚠️ **TROUBLESHOOTING**

### **If build still fails:**

#### **1. Check Build Logs**
- Go to Koyeb → Your Service → Deployments
- Click latest deployment
- Click "Build logs"
- Look for specific error

#### **2. Common Errors:**

**Error: "npm ERR! peer dep missing"**
```bash
# Fix: Update dependencies locally
cd /workspace/chaingive-backend
npm install
npm audit fix
git add package*.json
git commit -m "fix: Update dependencies"
git push
```

**Error: "Prisma Client is not generated"**
- ✅ Already fixed in Dockerfile
- Dockerfile runs `npx prisma generate` during build

**Error: "Cannot find module './dist/server.js'"**
```bash
# Fix: Test build locally
cd /workspace/chaingive-backend
npm run build
ls -la dist/server.js  # Should exist

# If it doesn't exist, check tsconfig.json
```

**Error: "Database connection failed"**
- Verify DATABASE_URL is correct
- Use Supabase "Connection pooler" URL (not direct connection)
- Format: `postgresql://user:pass@host:5432/database`

---

## 💡 **QUICK TIPS**

### **1. Test Build Locally:**

```bash
cd /workspace/chaingive-backend

# Build Docker image
docker build -t chaingive-test .

# Run locally
docker run -p 3000:8000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="test-secret" \
  -e NODE_ENV="production" \
  chaingive-test

# Test
curl http://localhost:3000/health
```

### **2. View Runtime Logs:**

In Koyeb:
- Go to your service
- Click "Logs" tab
- Filter by "Runtime logs"
- Look for errors after startup

### **3. Check Health Status:**

```bash
# If deployed to: https://chaingive-backend-xxx.koyeb.app

# Health check
curl https://chaingive-backend-xxx.koyeb.app/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

---

## 🎯 **SUCCESS INDICATORS**

**Deployment is successful when you see:**

✅ Build logs show: "Successfully built"  
✅ Container starts without errors  
✅ Health check passes  
✅ Service status is "Running" (green)  
✅ Can access: `https://your-app.koyeb.app/health`  
✅ Runtime logs show: "Server running on port 8000"  

---

## 📋 **CHECKLIST**

- [x] Dockerfile created
- [x] .dockerignore created
- [x] .koyeb.yml created
- [x] Server.ts updated (bind to 0.0.0.0)
- [x] Changes pushed to GitHub
- [ ] Koyeb redeployed
- [ ] Environment variables set
- [ ] Health check passes
- [ ] API endpoints working

---

## 🔗 **YOUR KOYEB DEPLOYMENT**

**Find your app URL:**
1. Go to https://app.koyeb.com/
2. Click your service
3. Copy the URL under "Public URL"
4. Format: `https://your-app-name.koyeb.app`

**Update mobile app:**

Once deployed, update mobile `.env`:
```bash
# /workspace/chaingive-mobile/.env
API_BASE_URL=https://your-app-name.koyeb.app/api/v1
```

---

## 🆘 **STILL HAVING ISSUES?**

**Share this information:**

1. **Koyeb build logs** (copy full error)
2. **Koyeb runtime logs** (first 50 lines after startup)
3. **Service URL** (to test)
4. **Environment variables** (names only, not values)

**Common fixes:**
- Make sure DATABASE_URL uses connection pooler
- Verify JWT_SECRET is set
- Check NODE_ENV is "production"
- Ensure PORT is 8000 (or let Koyeb set it)

---

## ✅ **AFTER SUCCESSFUL DEPLOYMENT**

1. **Test all endpoints:**
   ```bash
   BASE_URL="https://your-app.koyeb.app"
   
   curl $BASE_URL/health
   curl $BASE_URL/api/v1/leaderboard/global
   curl $BASE_URL/api/v1/marketplace
   ```

2. **Update mobile app API URL**

3. **Test mobile app connection**

4. **Monitor logs for errors**

5. **Set up custom domain** (optional)

---

## 🎊 **YOU'RE READY!**

```
╔═══════════════════════════════════════════════╗
║                                               ║
║  ✅ All files created and fixed              ║
║  ✅ Changes committed to GitHub              ║
║  ✅ Ready to redeploy on Koyeb               ║
║                                               ║
║  Next: Redeploy in Koyeb dashboard!          ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

**Redeploy now and your app should work!** 🚀

---

**Need help?** Share the specific error from Koyeb build logs!
