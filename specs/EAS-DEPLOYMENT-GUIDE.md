# 🚀 **EAS EXPO DEPLOYMENT FROM GITHUB**

**Complete guide to deploy ChainGive mobile app to EAS Build**

---

## 📋 **TABLE OF CONTENTS**

1. [Prerequisites](#prerequisites)
2. [Step 1: Install EAS CLI](#step-1-install-eas-cli)
3. [Step 2: Configure EAS](#step-2-configure-eas)
4. [Step 3: Create EAS Configuration](#step-3-create-eas-configuration)
5. [Step 4: Set Up GitHub Actions](#step-4-set-up-github-actions)
6. [Step 5: Configure GitHub Secrets](#step-5-configure-github-secrets)
7. [Step 6: First Build](#step-6-first-build)
8. [Step 7: Automated Deployment](#step-7-automated-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 **PREREQUISITES**

### **What You Need:**

1. ✅ **Expo Account**
   - Sign up at: https://expo.dev/signup
   - Free for open source projects

2. ✅ **GitHub Repository**
   - Your ChainGive repo (already have this)
   - Admin access to configure secrets

3. ✅ **Development Tools**
   ```bash
   Node.js >= 16
   npm or yarn
   Git
   ```

4. ✅ **Apple Developer Account** (for iOS builds)
   - $99/year
   - Required for App Store deployment
   - Optional for testing builds

5. ✅ **Google Play Console Account** (for Android builds)
   - $25 one-time fee
   - Required for Play Store deployment

---

## 📦 **STEP 1: INSTALL EAS CLI**

### **Option A: Install Globally**

```bash
npm install -g eas-cli
```

### **Option B: Install Locally (Recommended for CI/CD)**

```bash
cd /workspace/chaingive-mobile
npm install --save-dev eas-cli
```

### **Login to Expo**

```bash
eas login
# Enter your Expo username and password
```

### **Verify Installation**

```bash
eas whoami
# Should show your username
```

---

## ⚙️ **STEP 2: CONFIGURE EAS**

### **1. Link Project to EAS**

```bash
cd /workspace/chaingive-mobile
eas build:configure
```

This will:
- Create `eas.json` configuration file
- Generate a project ID
- Update `app.json` with the project ID

### **2. Update app.json**

The `projectId` will be automatically added:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id-here"
      }
    }
  }
}
```

---

## 📝 **STEP 3: CREATE EAS CONFIGURATION**

### **Create `eas.json` in `/workspace/chaingive-mobile/`**

This file defines build profiles for different environments.

**Full `eas.json` configuration:**

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      },
      "env": {
        "API_URL": "http://localhost:3000/api/v1"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "API_URL": "https://staging-api.chaingive.ng/api/v1"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "aab"
      },
      "env": {
        "API_URL": "https://api.chaingive.ng/api/v1"
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./secrets/google-play-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

---

## 🔄 **STEP 4: SET UP GITHUB ACTIONS**

### **Create `.github/workflows/eas-build.yml`**

```yaml
name: EAS Build

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - android
          - ios
      profile:
        description: 'Build profile'
        required: true
        default: 'preview'
        type: choice
        options:
          - development
          - preview
          - production

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    
    steps:
      - name: 🏗 Setup repo
        uses: actions/checkout@v3

      - name: 🏗 Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: npm

      - name: 🏗 Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 📦 Install dependencies
        run: |
          cd chaingive-mobile
          npm ci

      - name: 🚀 Build Android (Preview)
        if: github.ref == 'refs/heads/develop'
        run: |
          cd chaingive-mobile
          eas build --platform android --profile preview --non-interactive --no-wait

      - name: 🚀 Build iOS (Preview)
        if: github.ref == 'refs/heads/develop'
        run: |
          cd chaingive-mobile
          eas build --platform ios --profile preview --non-interactive --no-wait

      - name: 🚀 Build Production (Android)
        if: github.ref == 'refs/heads/main'
        run: |
          cd chaingive-mobile
          eas build --platform android --profile production --non-interactive --no-wait

      - name: 🚀 Build Production (iOS)
        if: github.ref == 'refs/heads/main'
        run: |
          cd chaingive-mobile
          eas build --platform ios --profile production --non-interactive --no-wait

      - name: 📝 Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 EAS Build started! Check your Expo dashboard for progress.'
            })
```

### **Create `.github/workflows/eas-submit.yml` (Auto-Submit to Stores)**

```yaml
name: EAS Submit to Stores

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to submit'
        required: true
        type: choice
        options:
          - android
          - ios
          - all

jobs:
  submit:
    name: Submit to App Stores
    runs-on: ubuntu-latest
    
    steps:
      - name: 🏗 Setup repo
        uses: actions/checkout@v3

      - name: 🏗 Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x

      - name: 🏗 Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 📦 Install dependencies
        run: |
          cd chaingive-mobile
          npm ci

      - name: 📱 Submit to Google Play
        if: ${{ github.event.inputs.platform == 'android' || github.event.inputs.platform == 'all' }}
        run: |
          cd chaingive-mobile
          eas submit --platform android --latest --non-interactive

      - name: 📱 Submit to App Store
        if: ${{ github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'all' }}
        run: |
          cd chaingive-mobile
          eas submit --platform ios --latest --non-interactive
```

---

## 🔐 **STEP 5: CONFIGURE GITHUB SECRETS**

### **1. Get Your Expo Token**

```bash
# Login to Expo
eas login

# Generate access token
eas build:configure

# OR visit: https://expo.dev/settings/access-tokens
# Click "Create Token"
# Copy the token
```

### **2. Add Secrets to GitHub**

Go to your GitHub repo:
```
Settings → Secrets and variables → Actions → New repository secret
```

**Add these secrets:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EXPO_TOKEN` | Your Expo access token | Required for EAS builds |
| `ANDROID_KEYSTORE_BASE64` | Base64 encoded keystore | For Android signing |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | Android signing |
| `ANDROID_KEY_ALIAS` | Key alias | Android signing |
| `ANDROID_KEY_PASSWORD` | Key password | Android signing |
| `APPLE_ID` | your-apple-id@example.com | For iOS submission |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password | For iOS submission |

### **3. Generate Android Keystore**

```bash
# Generate new keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore chaingive-release.keystore \
  -alias chaingive-key \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass your-keystore-password \
  -keypass your-key-password

# Convert to base64 for GitHub secret
cat chaingive-release.keystore | base64 > keystore.base64.txt

# Copy contents of keystore.base64.txt to ANDROID_KEYSTORE_BASE64 secret
```

### **4. iOS Credentials**

For iOS, you'll need:
- Apple Developer account
- App Store Connect API key
- OR let EAS handle it automatically (recommended)

```bash
# EAS will prompt you to set up credentials
eas credentials
```

---

## 🎯 **STEP 6: FIRST BUILD (LOCAL TEST)**

### **Test Build Locally First**

```bash
cd /workspace/chaingive-mobile

# Build for Android (Preview/Internal testing)
eas build --platform android --profile preview

# Build for iOS (Preview/Internal testing)
eas build --platform ios --profile preview

# Build for both platforms
eas build --platform all --profile preview
```

### **What Happens:**
1. ✅ Code is uploaded to EAS servers
2. ✅ Dependencies are installed
3. ✅ Build runs in the cloud
4. ✅ You get a download link for the APK/IPA
5. ✅ Build takes ~10-20 minutes

### **Check Build Status**

```bash
# View builds
eas build:list

# View specific build
eas build:view <build-id>

# Or visit: https://expo.dev/accounts/[your-account]/projects/chaingive-mobile/builds
```

---

## 🤖 **STEP 7: AUTOMATED DEPLOYMENT**

### **How It Works:**

1. **Push to `develop` branch:**
   - Triggers preview builds
   - Creates internal testing APK/IPA
   - Accessible via Expo Go or standalone

2. **Push to `main` branch:**
   - Triggers production builds
   - Creates store-ready AAB/IPA
   - Ready for submission

3. **Manual workflow dispatch:**
   - Choose platform (Android/iOS/All)
   - Choose profile (dev/preview/production)
   - Trigger from GitHub Actions tab

### **Trigger Manual Build:**

```bash
# From GitHub UI:
# 1. Go to Actions tab
# 2. Select "EAS Build" workflow
# 3. Click "Run workflow"
# 4. Select options
# 5. Click "Run workflow" button
```

### **Auto-Submit to Stores:**

Once build completes:

```bash
# Submit latest build to stores
cd /workspace/chaingive-mobile

# Android to Google Play (internal track)
eas submit --platform android --latest

# iOS to TestFlight
eas submit --platform ios --latest
```

---

## 📱 **BUILD PROFILES EXPLAINED**

### **Development Profile**
- Purpose: Active development
- Distribution: Internal
- Features: Fast builds, development tools
- Use: Daily development

### **Preview Profile**
- Purpose: QA and testing
- Distribution: Internal testing
- Features: Production-like, installable APK/IPA
- Use: Beta testing, stakeholder reviews

### **Production Profile**
- Purpose: App store releases
- Distribution: App Store & Google Play
- Features: Optimized, signed, production-ready
- Use: Public releases

---

## 🎨 **OPTIONAL: EXPO UPDATES (OTA)**

Deploy JavaScript updates without rebuilding:

```yaml
# .github/workflows/eas-update.yml
name: EAS Update

on:
  push:
    branches:
      - main
    paths:
      - 'chaingive-mobile/src/**'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: |
          cd chaingive-mobile
          npm ci
          eas update --branch production --message "Deploy from GitHub"
```

**Instant updates without app store review!**

---

## 🔍 **TROUBLESHOOTING**

### **Error: "No EAS project found"**
```bash
cd /workspace/chaingive-mobile
eas build:configure
# This creates eas.json and links project
```

### **Error: "Build failed - Native dependencies"**
```bash
# Your app uses Expo packages but is bare workflow
# Solution: Ensure all expo packages are compatible
npx expo install --check
```

### **Error: "Invalid credentials"**
```bash
# Re-login to Expo
eas logout
eas login

# Or regenerate token
# Visit: https://expo.dev/settings/access-tokens
```

### **Build takes too long**
- Normal build time: 10-20 minutes
- First build: Can take 30+ minutes
- Subsequent builds: Faster due to caching

### **App crashes after build**
- Check environment variables in eas.json
- Verify API_URL is correct
- Check native dependencies are installed
- Test in development profile first

---

## 📚 **USEFUL COMMANDS**

```bash
# View all builds
eas build:list

# View specific build
eas build:view [build-id]

# Download build artifact
eas build:download [build-id]

# View credentials
eas credentials

# View project info
eas project:info

# View updates
eas update:list

# View channels
eas channel:list

# Test local build
eas build --local

# Clear cache
eas build:clear-cache
```

---

## 🎯 **QUICK START CHECKLIST**

### **Phase 1: Setup (30 minutes)**
- [ ] Create Expo account
- [ ] Install EAS CLI globally
- [ ] Login to Expo
- [ ] Run `eas build:configure`
- [ ] Update app.json with projectId
- [ ] Create eas.json configuration

### **Phase 2: Local Test (1-2 hours)**
- [ ] Run first local build
- [ ] Test preview APK on Android device
- [ ] Test preview IPA on iOS device
- [ ] Verify all features work

### **Phase 3: GitHub Setup (30 minutes)**
- [ ] Create GitHub Actions workflows
- [ ] Add EXPO_TOKEN to GitHub secrets
- [ ] Add Android keystore secrets
- [ ] Add iOS credentials (or let EAS handle)
- [ ] Test workflow with push

### **Phase 4: Production (Ongoing)**
- [ ] Build production APK/IPA
- [ ] Submit to Google Play (internal)
- [ ] Submit to TestFlight
- [ ] Get feedback
- [ ] Promote to production

---

## 🚀 **DEPLOYMENT WORKFLOW**

```
┌─────────────────────────────────────────┐
│  Code Change                            │
│  (Push to GitHub)                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GitHub Actions Triggered               │
│  - Checkout code                        │
│  - Install dependencies                 │
│  - Run EAS build command                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  EAS Build (Cloud)                      │
│  - Install dependencies                 │
│  - Generate native code                 │
│  - Compile & sign                       │
│  - Upload artifact                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Build Complete                         │
│  - Download APK/IPA                     │
│  - Test locally                         │
│  - OR auto-submit to stores             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  App Store / Play Store                 │
│  - Internal testing                     │
│  - Beta testing                         │
│  - Production release                   │
└─────────────────────────────────────────┘
```

---

## 💡 **PRO TIPS**

1. **Use Branches:**
   - `develop` → Preview builds (beta testing)
   - `main` → Production builds (app stores)

2. **Environment Variables:**
   - Store API URLs in eas.json
   - Use different URLs per profile
   - Keep secrets in GitHub Secrets

3. **Build Optimization:**
   - Enable caching in GitHub Actions
   - Use `--no-wait` for async builds
   - Build only changed platforms

4. **Testing:**
   - Always test preview builds first
   - Use TestFlight/Internal testing
   - Get feedback before production

5. **Version Management:**
   - Use `autoIncrement` in production profile
   - Keep version in sync with backend
   - Document changes in CHANGELOG

---

## 📖 **RESOURCES**

- EAS Build Docs: https://docs.expo.dev/build/introduction/
- EAS Submit Docs: https://docs.expo.dev/submit/introduction/
- GitHub Actions: https://docs.expo.dev/build/building-on-ci/
- Expo Dashboard: https://expo.dev/
- App Store Connect: https://appstoreconnect.apple.com/
- Google Play Console: https://play.google.com/console/

---

**Ready to deploy? Start with Phase 1!** 🚀
