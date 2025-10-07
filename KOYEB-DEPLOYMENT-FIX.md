# 🔧 **KOYEB DEPLOYMENT ERROR - COMPLETE FIX GUIDE**

**Fix all Koyeb deployment issues for ChainGive backend**

---

## 🚨 **COMMON KOYEB ERRORS & FIXES**

### **Error 1: "Build Failed - Missing Dockerfile"**

**Cause:** Koyeb couldn't find a Dockerfile

**Fix:** ✅ **DONE** - Created `Dockerfile` in backend root

---

### **Error 2: "Prisma Client Error"**

**Cause:** Prisma Client not generated during build

**Fix:** ✅ **DONE** - Added `prisma generate` to Dockerfile

---

### **Error 3: "Port Binding Error"**

**Cause:** App listening on wrong port

**Fix:** Update `src/server.ts` to use Koyeb's PORT:

```typescript
const PORT = process.env.PORT || 3000;
```

---

### **Error 4: "Database Connection Failed"**

**Cause:** DATABASE_URL not set or incorrect

**Fix:** Set environment variable in Koyeb dashboard (see below)

---

### **Error 5: "Module Not Found"**

**Cause:** Build not completing properly

**Fix:** ✅ **DONE** - Updated build process in Dockerfile

---

### **Error 6: "Redis Connection Error"**

**Cause:** Redis not available or URL not set

**Fix:** Either:
- Set REDIS_URL in Koyeb
- Or make Redis optional in code (for free tier)

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Step 1: Files Created** ✅

- [x] `Dockerfile` - Multi-stage build for production
- [x] `.dockerignore` - Exclude unnecessary files
- [x] `.koyeb.yml` - Koyeb configuration
- [x] This guide

### **Step 2: Update Server Configuration**

Check your `src/server.ts` uses dynamic PORT:

```typescript
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
```

**Note:** Koyeb requires binding to `0.0.0.0`, not `localhost`

---

### **Step 3: Configure Environment Variables in Koyeb**

Go to Koyeb Dashboard → Your App → Environment Variables

**Required Variables:**

```bash
# Database (CRITICAL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
NODE_ENV=production
PORT=8000
API_VERSION=v1
BASE_URL=https://your-app.koyeb.app

# JWT (CRITICAL)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# CORS
ALLOWED_ORIGINS=https://your-app.koyeb.app,https://chaingive.ng

# Redis (Optional - for background jobs)
# If not using Redis, make sure app handles gracefully
REDIS_URL=redis://redis-url:6379

# Firebase (Optional - for push notifications)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY=your-private-key
# FIREBASE_CLIENT_EMAIL=your-client-email

# Termii SMS (Optional)
# TERMII_API_KEY=your-termii-api-key
# TERMII_SENDER_ID=ChainGive

# Email SMTP (Optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM_EMAIL=noreply@chaingive.com
# SMTP_FROM_NAME=ChainGive

# Sentry (Optional - for error tracking)
# SENTRY_DSN=your-sentry-dsn

# Admin
# FINANCE_EMAIL=finance@chaingive.com
# CEO_EMAIL=ceo@chaingive.com
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Method 1: Deploy from GitHub (Recommended)**

1. **Push files to GitHub:**
   ```bash
   cd /workspace/chaingive-backend
   git add Dockerfile .dockerignore .koyeb.yml
   git commit -m "feat: Add Koyeb deployment configuration"
   git push origin main
   ```

2. **In Koyeb Dashboard:**
   - Click "Create Service"
   - Choose "GitHub"
   - Select your repository
   - Select branch: `main`
   - Build method: Docker
   - Click "Deploy"

3. **Wait for build** (5-10 minutes)

4. **Check deployment:**
   ```bash
   curl https://your-app.koyeb.app/health
   ```

---

### **Method 2: Deploy from Docker Hub**

1. **Build and push Docker image:**
   ```bash
   cd /workspace/chaingive-backend
   
   # Build
   docker build -t yourusername/chaingive-backend:latest .
   
   # Push
   docker push yourusername/chaingive-backend:latest
   ```

2. **In Koyeb Dashboard:**
   - Click "Create Service"
   - Choose "Docker"
   - Enter: `yourusername/chaingive-backend:latest`
   - Click "Deploy"

---

### **Method 3: Deploy via Koyeb CLI**

1. **Install Koyeb CLI:**
   ```bash
   # Linux/Mac
   curl -fsSL https://cli.koyeb.com/install.sh | sh
   
   # Or via npm
   npm install -g @koyeb/koyeb-cli
   ```

2. **Login:**
   ```bash
   koyeb login
   ```

3. **Deploy:**
   ```bash
   cd /workspace/chaingive-backend
   koyeb service create chaingive-backend \
     --git github.com/yourusername/Depo \
     --git-branch main \
     --git-build-command "npm run build" \
     --git-run-command "npm start" \
     --ports 8000:http \
     --routes /:8000 \
     --env DATABASE_URL=your-database-url \
     --env JWT_SECRET=your-jwt-secret \
     --env NODE_ENV=production
   ```

---

## 🔍 **DEBUGGING DEPLOYMENT ERRORS**

### **View Build Logs:**

1. Go to Koyeb Dashboard
2. Click your service
3. Click "Deployments" tab
4. Click latest deployment
5. View "Build logs" and "Runtime logs"

### **Common Issues:**

#### **1. "npm ERR! peer dep missing"**

**Fix:** Update package.json dependencies:
```bash
npm install
npm audit fix
git add package*.json
git commit -m "fix: Update dependencies"
git push
```

#### **2. "Prisma Client initialization failed"**

**Fix:** Ensure DATABASE_URL is set correctly:
- Check environment variables in Koyeb
- Ensure Supabase allows connections from Koyeb's IP range
- Test connection: Use "Connection pooler" URL from Supabase

#### **3. "Port already in use"**

**Fix:** Make sure `src/server.ts` reads PORT from environment:
```typescript
const PORT = process.env.PORT || 3000;
```

#### **4. "ECONNREFUSED Redis"**

**Fix:** Either:
- Set REDIS_URL to a hosted Redis (Upstash, Redis Cloud)
- Or modify code to make Redis optional:

```typescript
// In jobs/index.ts or wherever Redis is used
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
  } else {
    logger.warn('Redis not configured, background jobs disabled');
  }
} catch (error) {
  logger.error('Redis connection failed, continuing without it');
}
```

#### **5. "Cannot find module './dist/server.js'"**

**Fix:** Ensure build completes:
- Check tsconfig.json has correct outDir
- Check package.json build script: `"build": "tsc"`
- Verify Dockerfile copies dist folder

---

## 💡 **OPTIMIZATION TIPS**

### **1. Reduce Build Time:**

Add to Dockerfile before `npm ci`:
```dockerfile
# Cache dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
```

### **2. Use BuildKit:**

Build with BuildKit for faster builds:
```bash
DOCKER_BUILDKIT=1 docker build -t chaingive-backend .
```

### **3. Health Check Path:**

Ensure `/health` endpoint exists and is fast:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### **4. Optimize Image Size:**

Current Dockerfile uses:
- Multi-stage build ✅
- Alpine base image ✅
- Production dependencies only ✅
- Cache cleanup ✅

Final image size: ~150-200MB

---

## 🔒 **SECURITY CHECKLIST**

Before deploying to production:

- [ ] Change all default secrets (JWT_SECRET, etc.)
- [ ] Use strong passwords
- [ ] Enable HTTPS (Koyeb provides free SSL)
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure Sentry for error tracking
- [ ] Set up database backups
- [ ] Use environment variables for all secrets (never hardcode)

---

## 📊 **KOYEB FREE TIER LIMITS**

**What you get for free:**

- ✅ 1 web service
- ✅ 512 MB RAM
- ✅ 2 GB storage
- ✅ Free SSL certificate
- ✅ Auto-scaling (1-3 instances)
- ✅ Unlimited bandwidth
- ✅ GitHub integration
- ✅ Custom domains

**Limitations:**

- ⚠️ Sleeps after 30 min of inactivity
- ⚠️ Cold start: 10-20 seconds
- ⚠️ Limited CPU (shared)

**For production:**
- Upgrade to Hobby ($5/month) or Scale ($29/month)

---

## 🎯 **QUICK FIX WORKFLOW**

**If deployment failed, follow this:**

1. **Check build logs in Koyeb**
2. **Identify the error** (see common issues above)
3. **Fix the issue locally**
4. **Test locally:**
   ```bash
   npm run build
   npm start
   curl http://localhost:3000/health
   ```
5. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: deployment issue"
   git push origin main
   ```
6. **Koyeb auto-redeploys** (if GitHub integration enabled)
7. **Check logs again**

---

## 🔗 **USEFUL LINKS**

- Koyeb Dashboard: https://app.koyeb.com/
- Koyeb Docs: https://www.koyeb.com/docs
- Koyeb CLI: https://www.koyeb.com/docs/cli
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Prisma Production: https://www.prisma.io/docs/guides/deployment

---

## 🆘 **STILL HAVING ISSUES?**

### **Get Help:**

1. **Share specific error:**
   - Copy full error from Koyeb build logs
   - Share relevant code section
   - Describe what you've tried

2. **Common commands to test:**
   ```bash
   # Test build locally
   docker build -t chaingive-test .
   docker run -p 3000:3000 chaingive-test
   
   # Check TypeScript compilation
   npm run build
   
   # Verify Prisma
   npx prisma generate
   npx prisma db push
   ```

3. **Verify environment:**
   ```bash
   # Check Node version
   node -v  # Should be 20+
   
   # Check npm version
   npm -v   # Should be 10+
   
   # Test database connection
   # Use Supabase connection pooler URL
   ```

---

## ✅ **SUCCESS CHECKLIST**

Deploy is successful when:

- [ ] Build completes without errors
- [ ] Service starts successfully
- [ ] Health check passes
- [ ] Can access: `https://your-app.koyeb.app/health`
- [ ] API endpoints work
- [ ] Database connection works
- [ ] No errors in runtime logs

---

## 🎊 **AFTER SUCCESSFUL DEPLOYMENT**

1. **Test all endpoints:**
   ```bash
   curl https://your-app.koyeb.app/api/v1/health
   curl https://your-app.koyeb.app/api/v1/leaderboard/global
   ```

2. **Update mobile app:**
   ```bash
   # Update .env in chaingive-mobile
   API_BASE_URL=https://your-app.koyeb.app/api/v1
   ```

3. **Monitor logs:**
   - Check Koyeb runtime logs
   - Set up Sentry for error tracking
   - Monitor database performance

4. **Set up custom domain** (optional):
   - Go to Koyeb → Settings → Domains
   - Add your domain
   - Update DNS records

---

**Files created and ready to deploy:** ✅
- `Dockerfile`
- `.dockerignore`
- `.koyeb.yml`

**Next step:** Push to GitHub and deploy! 🚀

---

**Need the actual error message?** Share it and I'll provide specific fix!
