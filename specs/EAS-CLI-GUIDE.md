# 🚀 **EAS CLI COMPLETE SETUP GUIDE**

**Step-by-step guide to deploy ChainGive mobile app with EAS**

---

## ✅ **EAS CLI INSTALLED**

```
✅ EAS CLI Version: 16.20.1
✅ Node Version: 22.20.0
✅ Installation: Global
```

---

## 🔐 **STEP 1: LOGIN TO EAS**

### **If you have an Expo account:**

```bash
cd /workspace/chaingive-mobile
eas login
```

Enter your:
- Email or Username
- Password

### **If you DON'T have an Expo account:**

1. Sign up at: https://expo.dev/signup
2. Verify your email
3. Then run: `eas login`

---

## 🏗️ **STEP 2: INITIALIZE EAS PROJECT**

```bash
cd /workspace/chaingive-mobile
eas init
```

This will:
- Create EAS project
- Generate project ID
- Update app.json with project ID

**Choose:**
- Project name: `chaingive-mobile`
- Use existing Expo account

---

## ⚙️ **STEP 3: CONFIGURE EAS BUILD**

```bash
cd /workspace/chaingive-mobile
eas build:configure
```

This will:
- Create `eas.json` (already exists!)
- Set up build profiles
- Configure credentials

**Choose:**
- Platform: `All` (iOS and Android)
- Use existing eas.json: `Yes`

---

## 📱 **STEP 4: FIRST BUILD - ANDROID (PREVIEW)**

### **Preview Build (Internal Testing):**

```bash
cd /workspace/chaingive-mobile
eas build --platform android --profile preview
```

**What happens:**
1. Code uploaded to EAS servers
2. Dependencies installed
3. Android APK built (~10-15 minutes)
4. Download link provided

**During build, you'll be asked:**
- Generate Android keystore? → **Yes**
- Store credentials in Expo? → **Yes**

---

## 📱 **STEP 5: FIRST BUILD - iOS (OPTIONAL)**

### **For iOS (requires Apple Developer account):**

```bash
cd /workspace/chaingive-mobile
eas build --platform ios --profile preview
```

**Requirements:**
- Apple Developer account ($99/year)
- Or use simulator build (free)

**For simulator only:**
```bash
eas build --platform ios --profile development
```

---

## 🎯 **BUILD PROFILES EXPLAINED**

### **Development:**
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```
- For active development
- Fastest builds
- Development tools enabled

### **Preview:**
```json
{
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```
- For internal testing
- Production-like
- Installable APK

### **Production:**
```json
{
  "distribution": "store",
  "android": { "buildType": "aab" }
}
```
- For app stores
- Optimized builds
- AAB for Google Play, IPA for App Store

---

## 📊 **MONITOR BUILD PROGRESS**

### **View Builds:**
```bash
eas build:list
```

### **View Specific Build:**
```bash
eas build:view [build-id]
```

### **Or check web dashboard:**
👉 https://expo.dev/accounts/[your-account]/projects/chaingive-mobile/builds

---

## 📥 **DOWNLOAD & TEST BUILD**

### **After build completes:**

```bash
# Download build
eas build:download --platform android --profile preview

# Or scan QR code from build page to download on device
```

### **Install on Android device:**
1. Transfer APK to phone
2. Enable "Install from unknown sources"
3. Install APK
4. Test app!

---

## 🔄 **SUBSEQUENT BUILDS**

### **Quick rebuild:**
```bash
# Android
eas build -p android --profile preview

# iOS
eas build -p ios --profile preview

# Both platforms
eas build --platform all --profile preview
```

### **No-wait option (async):**
```bash
eas build -p android --profile preview --no-wait
```

---

## 🎯 **PRODUCTION BUILD**

When ready for app stores:

```bash
# Build for Google Play
eas build --platform android --profile production

# Build for App Store
eas build --platform ios --profile production
```

This creates:
- Android: AAB file (for Google Play)
- iOS: IPA file (for App Store)

---

## 📤 **SUBMIT TO APP STORES**

### **Submit to Google Play:**
```bash
eas submit --platform android --latest
```

### **Submit to App Store:**
```bash
eas submit --platform ios --latest
```

**Requirements:**
- Google Play: Google Service Account JSON
- App Store: Apple ID & App-Specific Password

---

## 🔧 **TROUBLESHOOTING**

### **Error: "Not logged in"**
```bash
eas login
```

### **Error: "Project not configured"**
```bash
eas init
```

### **Error: "Build failed"**
- Check build logs on Expo dashboard
- Common issues:
  - Missing dependencies in package.json
  - Invalid app.json configuration
  - Network issues during upload

### **Error: "Credentials error"**
```bash
eas credentials
# Select platform and action to manage credentials
```

---

## 💡 **USEFUL COMMANDS**

```bash
# Check current status
eas whoami

# View project info
eas project:info

# View builds
eas build:list

# View credentials
eas credentials

# View channels
eas channel:list

# View updates
eas update:list

# Open project in browser
eas open
```

---

## 🚀 **QUICK START WORKFLOW**

```bash
# 1. Login
eas login

# 2. Initialize project
eas init

# 3. Configure build
eas build:configure

# 4. Build preview APK
eas build --platform android --profile preview

# 5. Wait 10-15 minutes

# 6. Download and test!
```

---

## 📱 **UPDATE APP WITHOUT REBUILDING**

### **For JavaScript/React changes only:**

```bash
cd /workspace/chaingive-mobile

# Create update
eas update --branch production --message "Bug fix"
```

**Benefits:**
- No rebuild needed
- Updates in seconds
- Users get updates immediately
- Only works for JS changes (not native)

---

## 🎯 **BUILD OPTIMIZATION**

### **Faster builds:**
- Use `--no-wait` for async builds
- EAS caches dependencies
- Subsequent builds are faster

### **Build time:**
- First build: 10-15 minutes
- Subsequent builds: 5-10 minutes
- Depends on project size

---

## 💰 **EAS PRICING**

### **Free Tier:**
- ✅ Unlimited EAS Update
- ✅ 30 builds/month (iOS + Android combined)
- ✅ 1 concurrent build
- ✅ 15GB bandwidth

### **Production ($29/month):**
- ✅ Unlimited builds
- ✅ 2 concurrent builds
- ✅ Priority support
- ✅ More bandwidth

---

## ✅ **SUCCESS CHECKLIST**

```
SETUP:
[ ] EAS CLI installed
[ ] Logged in to Expo account
[ ] Project initialized
[ ] Build configured

FIRST BUILD:
[ ] Android preview build started
[ ] Build completed successfully
[ ] APK downloaded
[ ] Tested on device

READY FOR:
[ ] iOS build
[ ] Production builds
[ ] App store submission
```

---

## 🎊 **YOU'RE READY!**

**EAS CLI is set up and ready to build your mobile app!**

**Next commands to run:**

1. `eas login` - Log in to your Expo account
2. `eas init` - Initialize your project
3. `eas build --platform android --profile preview` - Build first APK!

**Time to first build: ~15-20 minutes**

---

**Need help?** Run `eas --help` or check https://docs.expo.dev/build/introduction/

**Let's build your app! 🚀**
