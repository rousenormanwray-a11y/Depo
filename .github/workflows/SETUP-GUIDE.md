# 🔧 **GITHUB ACTIONS SETUP GUIDE**

**How to set up automated Docker builds and deployments**

---

## 📋 **WHAT THESE WORKFLOWS DO**

### **Workflow 1: docker-build.yml**
- Builds Docker image on every push to main
- Pushes to Docker Hub
- Uses build cache for faster builds
- Tags images properly

### **Workflow 2: deploy-koyeb.yml**
- Auto-deploys to Koyeb after successful build
- Triggered when docker-build completes
- Can also be manually triggered

---

## 🔐 **REQUIRED SECRETS**

You need to add these secrets to your GitHub repository:

### **Step 1: Go to GitHub Secrets**
1. Go to your repo: https://github.com/rousenormanwray-a11y/Depo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### **Step 2: Add Docker Hub Secrets**

**Secret 1: DOCKER_USERNAME**
- Name: `DOCKER_USERNAME`
- Value: Your Docker Hub username (e.g., `rouse456`)
- Click "Add secret"

**Secret 2: DOCKER_PASSWORD**
- Name: `DOCKER_PASSWORD`
- Value: Your Docker Hub Personal Access Token
- How to get:
  1. Go to https://hub.docker.com/settings/security
  2. Click "New Access Token"
  3. Name: "GitHub Actions"
  4. Permissions: Read, Write, Delete
  5. Copy the token
  6. Paste in GitHub secret

### **Step 3: Add Koyeb Secret (Optional)**

**Secret 3: KOYEB_API_TOKEN**
- Name: `KOYEB_API_TOKEN`
- Value: Your Koyeb API token
- How to get:
  1. Go to https://app.koyeb.com/settings/api
  2. Click "Create API token"
  3. Copy the token
  4. Paste in GitHub secret

---

## 🚀 **HOW TO USE**

### **Option A: Automatic (Recommended)**

Just push code to main branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

GitHub Actions will:
1. ✅ Build Docker image
2. ✅ Push to Docker Hub
3. ✅ Deploy to Koyeb (if configured)

### **Option B: Manual Trigger**

1. Go to GitHub → Actions tab
2. Select workflow
3. Click "Run workflow"
4. Click "Run workflow" button

---

## 📊 **WORKFLOW FEATURES**

### **Smart Triggers:**
```yaml
Only builds when:
- Code in chaingive-backend/ changes
- Workflow file changes
- Manual trigger

Skips builds when:
- Only mobile app changes
- Only docs change
```

### **Build Caching:**
```yaml
Uses Docker layer caching:
- Faster builds (2-3x)
- Saves time and money
- Uses Docker Hub registry
```

### **Proper Tagging:**
```yaml
Images tagged with:
- latest (main branch)
- branch name
- git sha
- PR number (for PRs)
```

---

## 🔍 **VERIFY SETUP**

### **Check Docker Hub:**
After first push, check:
```
https://hub.docker.com/r/YOUR_USERNAME/chaingive-backend
```

You should see:
- Repository created
- Image with `latest` tag
- Build cache

### **Check GitHub Actions:**
```
Your Repo → Actions tab
```

You should see:
- Workflow runs
- Green checkmarks
- Build logs

### **Pull Your Image:**
```bash
docker pull YOUR_USERNAME/chaingive-backend:latest
docker run -p 3000:8000 YOUR_USERNAME/chaingive-backend:latest
```

---

## 🎯 **DEPLOYMENT OPTIONS**

### **Option 1: Deploy to Koyeb**
Uses `deploy-koyeb.yml` workflow:
- Add KOYEB_API_TOKEN secret
- Workflow auto-deploys after build

### **Option 2: Deploy to Railway**
Railway can pull from Docker Hub:
1. Railway → Service Settings
2. Source: Docker Image
3. Image: `YOUR_USERNAME/chaingive-backend:latest`
4. Railway pulls on each push

### **Option 3: Manual Deployment**
Pull image anywhere:
```bash
docker pull YOUR_USERNAME/chaingive-backend:latest
docker run -p 8000:8000 \
  -e DATABASE_URL="your-url" \
  -e JWT_SECRET="your-secret" \
  YOUR_USERNAME/chaingive-backend:latest
```

---

## 💡 **ADVANCED CONFIGURATION**

### **Build Only on Backend Changes:**

The workflow already has this:
```yaml
paths:
  - 'chaingive-backend/**'
```

This means mobile app changes won't trigger backend builds!

### **Add Build Notifications:**

Add to workflow:
```yaml
- name: Send notification
  if: always()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

### **Run Tests Before Build:**

Add before build step:
```yaml
- name: Run tests
  run: |
    cd chaingive-backend
    npm install
    npm test
```

---

## 🆘 **TROUBLESHOOTING**

### **Error: "Invalid credentials"**
- Check DOCKER_USERNAME is correct
- Check DOCKER_PASSWORD is valid token (not password!)
- Regenerate Docker Hub token if needed

### **Error: "Permission denied"**
- Docker Hub token needs Write permission
- Regenerate with correct permissions

### **Error: "Repository not found"**
- Create repository on Docker Hub first
- Or let workflow create it automatically

### **Build is slow:**
- First build: ~10-15 minutes (no cache)
- Subsequent builds: ~5-8 minutes (with cache)
- This is normal!

---

## 📋 **CHECKLIST**

```
SETUP:
[ ] Workflows committed to .github/workflows/
[ ] DOCKER_USERNAME secret added
[ ] DOCKER_PASSWORD secret added
[ ] KOYEB_API_TOKEN secret added (optional)

TEST:
[ ] Push to main branch
[ ] Check Actions tab
[ ] Verify build succeeds
[ ] Check Docker Hub for image
[ ] Pull and test image locally

DEPLOY:
[ ] Configure deployment (Koyeb/Railway)
[ ] Test automatic deployment
[ ] Verify service is running
```

---

## 🎊 **BENEFITS**

**With this setup:**

✅ Automated builds on every push
✅ Docker images ready to deploy anywhere
✅ Build cache speeds up builds
✅ Proper versioning with tags
✅ Can deploy to any platform
✅ No manual Docker commands needed
✅ CI/CD best practices

---

## 🚀 **QUICK START**

**Right now:**

1. Add Docker Hub secrets to GitHub
2. Push these workflow files
3. GitHub Actions builds automatically
4. Your image appears on Docker Hub
5. Deploy image anywhere!

**Time to set up: 5 minutes**
**Time per build: 5-10 minutes**
**Result: Automated CI/CD! 🎉**

---

**Need help?** Just ask! 😊
