# 🔧 **KOYEB BUILDPACK ERROR - COMPLETE FIX**

**Error:** "No buildpack groups passed detection"

**Cause:** Koyeb is trying to auto-detect build method instead of using Docker

---

## ✅ **THE FIX (2 METHODS)**

### **METHOD 1: CONFIGURE IN KOYEB DASHBOARD** ⭐ RECOMMENDED

#### **Step 1: Delete Current Service**
1. Go to https://app.koyeb.com/
2. Find your service (chaingive-backend)
3. Click the service
4. Go to Settings → General
5. Scroll down and click "Delete service"
6. Confirm deletion

#### **Step 2: Create New Service with Docker**
1. Click "Create Service" button
2. Select "GitHub" as source
3. Connect your GitHub account (if not connected)
4. Select repository: `Depo` (or your repo name)
5. Select branch: `main`
6. **IMPORTANT:** Click "Override" under "Builder"
7. Select **"Docker"** from dropdown (NOT "Buildpack")
8. Set these configurations:
   - **Dockerfile path:** `chaingive-backend/Dockerfile`
   - **Docker build context:** `chaingive-backend`
   - **Port:** `8000`
   - **Health check path:** `/health`

#### **Step 3: Configure Service**
Scroll down and configure:

**Instance:**
- Type: `nano` (free tier)
- Regions: `fra` (Frankfurt) or nearest

**Environment Variables:** Click "Add variable" for each:
```
DATABASE_URL = postgresql://postgres.mmxzndkglilnxwukpptt:deoi_101dxx90*@aws-1-us-east-2.pooler.supabase.com:5432/postgres
JWT_SECRET = chaingive-jwt-secret-change-in-production-please
JWT_REFRESH_SECRET = chaingive-refresh-secret-change-in-production-please
NODE_ENV = production
PORT = 8000
API_VERSION = v1
```

#### **Step 4: Deploy**
1. Click "Deploy" button
2. Wait 10-15 minutes
3. Monitor build logs

---

### **METHOD 2: UPDATE EXISTING SERVICE**

If you don't want to delete:

#### **Step 1: Go to Service Settings**
1. Click your service
2. Click "Settings" tab
3. Click "General" section

#### **Step 2: Change Builder**
1. Find "Builder" section
2. Click "Edit"
3. Change from "Buildpack" to **"Docker"**
4. Set **Dockerfile path:** `chaingive-backend/Dockerfile`
5. Set **Build context:** `chaingive-backend`
6. Click "Save"

#### **Step 3: Update Port Configuration**
1. In Settings, find "Ports" section
2. Click "Edit"
3. Set Port to `8000`
4. Protocol: `HTTP`
5. Click "Save"

#### **Step 4: Redeploy**
1. Click "Deploy" or "Redeploy"
2. Wait for build to complete

---

## 🎯 **KEY CONFIGURATION**

**Most Important Settings:**

```yaml
Builder: Docker (NOT Buildpack!)
Dockerfile: chaingive-backend/Dockerfile
Context: chaingive-backend
Port: 8000
Health Check: /health
```

---

## 📸 **VISUAL GUIDE**

### **Where to Set Docker:**

```
Create Service
  ↓
Select GitHub
  ↓
Select Repository (Depo)
  ↓
Select Branch (main)
  ↓
⚠️ CRITICAL STEP ⚠️
  ↓
Builder: Click "Override"
  ↓
Select "Docker" from dropdown
  ↓
Dockerfile path: chaingive-backend/Dockerfile
  ↓
Context: chaingive-backend
  ↓
Continue with environment variables
  ↓
Deploy!
```

---

## 🔍 **WHY THIS HAPPENS**

**Koyeb has two build methods:**

1. **Buildpacks** (Auto-detect)
   - Automatically detects Node.js, Python, etc.
   - Looks for package.json in root
   - **Your issue:** Looks in wrong directory

2. **Docker** (Manual)
   - Uses your Dockerfile
   - More control
   - **What you need!**

**Your error occurred because:**
- Koyeb defaulted to Buildpack
- Looked in repo root for package.json
- Found `/chaingive-backend/package.json` (subdirectory)
- Couldn't detect → Error!

**Solution:** Use Docker mode!

---

## ✅ **CORRECT CONFIGURATION**

### **In Koyeb Dashboard:**

**Service Name:** chaingive-backend

**Source:**
- Repository: github.com/yourusername/Depo
- Branch: main

**Build:**
- **Method: Docker** ← CRITICAL!
- Dockerfile: chaingive-backend/Dockerfile
- Context: chaingive-backend

**Deployment:**
- Port: 8000
- Health check: /health
- Instance: nano

**Environment:**
- DATABASE_URL: your-supabase-url
- JWT_SECRET: your-secret
- NODE_ENV: production

---

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **Complete Process:**

1. **Delete old service** (if exists)
   ```
   Settings → General → Delete service
   ```

2. **Create new service**
   ```
   Click "Create Service"
   ```

3. **Select source**
   ```
   GitHub → Select repo → Select branch
   ```

4. **Configure builder** ⚠️ MOST IMPORTANT
   ```
   Click "Override" on Builder
   Select "Docker"
   Dockerfile: chaingive-backend/Dockerfile
   Context: chaingive-backend
   ```

5. **Set environment variables**
   ```
   Add all required variables
   DATABASE_URL, JWT_SECRET, etc.
   ```

6. **Deploy**
   ```
   Click "Deploy" button
   Wait 10-15 minutes
   ```

7. **Verify**
   ```
   Check build logs
   Test: curl https://your-app.koyeb.app/health
   ```

---

## 💡 **ALTERNATIVE: MOVE FILES TO ROOT**

If you want to use buildpacks instead:

### **Option: Restructure Repository**

```bash
# Move backend files to root
cd /workspace
mv chaingive-backend/* .
mv chaingive-backend/.* . 2>/dev/null

# Update paths
# Then Koyeb can auto-detect

# But Docker is better! Recommended to keep structure.
```

**NOT RECOMMENDED** - Docker is better for your setup!

---

## 🔧 **TROUBLESHOOTING**

### **Error: "Cannot find Dockerfile"**

**Fix:** Check paths
```
Dockerfile path: chaingive-backend/Dockerfile
NOT: /chaingive-backend/Dockerfile
NOT: Dockerfile
```

### **Error: "Context not found"**

**Fix:** Set correct context
```
Build context: chaingive-backend
NOT: /chaingive-backend
NOT: . (dot)
```

### **Error: "Build failed - npm not found"**

**Fix:** Using wrong base image
```
Dockerfile should start with:
FROM node:20-alpine
```

### **Error: "Port not accessible"**

**Fix:** Check port configuration
```
In Dockerfile: EXPOSE 8000
In Koyeb: Port: 8000
In server.ts: PORT = process.env.PORT || 3000
```

---

## 📋 **VERIFICATION CHECKLIST**

After creating service:

```
CONFIGURATION:
[ ] Builder set to "Docker"
[ ] Dockerfile path: chaingive-backend/Dockerfile
[ ] Build context: chaingive-backend
[ ] Port: 8000
[ ] Health check: /health

ENVIRONMENT:
[ ] DATABASE_URL set
[ ] JWT_SECRET set
[ ] JWT_REFRESH_SECRET set
[ ] NODE_ENV = production
[ ] PORT = 8000

DEPLOYMENT:
[ ] Service created
[ ] Build started
[ ] No errors in build logs
[ ] Container started
[ ] Health check passed
[ ] Service running
```

---

## 🎯 **EXPECTED BUILD OUTPUT**

**Correct build logs should show:**

```
✅ Cloning repository
✅ Checking out branch main
✅ Building Docker image
   → FROM node:20-alpine
   → COPY package*.json
   → RUN npm ci
   → RUN npx prisma generate
   → RUN npm run build
   → COPY dist/
✅ Image built successfully
✅ Pushing image
✅ Starting container
✅ Health check passed
✅ Service running on port 8000
```

---

## ⚡ **QUICK FIX SUMMARY**

**The Problem:**
- Koyeb using Buildpack instead of Docker

**The Solution:**
1. Delete service (or edit settings)
2. Create new service
3. **Select "Docker" as builder** ← KEY STEP
4. Set Dockerfile path: `chaingive-backend/Dockerfile`
5. Set context: `chaingive-backend`
6. Add environment variables
7. Deploy

**Time to fix:** 5 minutes  
**Build time:** 10-15 minutes  
**Total:** 15-20 minutes to success!

---

## 🆘 **STILL STUCK?**

**Share this info:**
1. Screenshot of "Builder" configuration
2. Screenshot of "Dockerfile path" setting
3. Full build logs from Koyeb
4. Your repository structure

**I'll help you fix it immediately!**

---

## ✅ **SUCCESS INDICATORS**

**You've succeeded when:**

```
✅ Service created with Docker builder
✅ Build logs show "Building Docker image"
✅ Build completes without errors
✅ Service shows "Running" status
✅ Health check responds
✅ Can access: https://your-app.koyeb.app/health
```

---

**DO THIS NOW:**

1. Go to Koyeb dashboard
2. Delete existing service
3. Create new service
4. **SELECT DOCKER (not buildpack!)**
5. Set paths correctly
6. Deploy

**This will 100% fix your error!** 🚀
