# 📱 **MOBILE APP TESTING GUIDE**

**Complete testing checklist for ChainGive mobile app**

---

## ✅ **PRE-TESTING SETUP**

### **1. Backend Status**
```
✅ Backend running on: http://localhost:3000
✅ API Version: v1
✅ Health endpoint: http://localhost:3000/api/v1/health
✅ Database: Connected (Supabase)
✅ Background jobs: Running
✅ Gamification: Initialized
```

### **2. Mobile App Configuration**
```
✅ .env file created
✅ API_BASE_URL set to http://localhost:3000/api/v1
✅ All screens polished
✅ Redux store configured
✅ Navigation set up
```

---

## 🚀 **HOW TO RUN THE MOBILE APP**

### **Option 1: React Native CLI (Recommended)**

```bash
# Terminal 1: Keep backend running
cd /workspace/chaingive-backend
npm run dev

# Terminal 2: Start Metro bundler
cd /workspace/chaingive-mobile
npm start

# Terminal 3: Run on Android
npm run android

# OR Terminal 3: Run on iOS
npm run ios
```

### **Option 2: Expo (If configured)**

```bash
# Terminal 1: Backend
cd /workspace/chaingive-backend
npm run dev

# Terminal 2: Expo
cd /workspace/chaingive-mobile
npx expo start
# Scan QR code with Expo Go app
```

### **Option 3: Build and Install**

```bash
# Android APK
cd /workspace/chaingive-mobile
npm run android -- --mode=release

# iOS (Mac only)
npm run ios -- --configuration Release
```

---

## 🧪 **TESTING CHECKLIST**

### **Phase 1: Authentication Flow** 🔐

#### **Test 1.1: Registration**
- [ ] Open app
- [ ] Tap "Sign Up" / "Register"
- [ ] Fill in registration form:
  - First Name
  - Last Name
  - Email
  - Phone Number
  - Password
  - Referral Code (optional)
- [ ] Submit registration
- [ ] **Expected:** OTP sent to phone
- [ ] **Expected:** Navigate to OTP screen

#### **Test 1.2: OTP Verification**
- [ ] Enter OTP code
- [ ] Submit OTP
- [ ] **Expected:** Account created successfully
- [ ] **Expected:** Navigate to Home screen
- [ ] **Expected:** Welcome toast message

#### **Test 1.3: Login**
- [ ] Logout from app
- [ ] Tap "Login"
- [ ] Enter email and password
- [ ] Submit login
- [ ] **Expected:** Login successful
- [ ] **Expected:** Navigate to Home screen
- [ ] **Expected:** User data loaded

#### **Test 1.4: Forgot Password**
- [ ] Tap "Forgot Password"
- [ ] Enter email
- [ ] Submit
- [ ] **Expected:** OTP sent
- [ ] Enter OTP
- [ ] Enter new password
- [ ] **Expected:** Password reset successful

---

### **Phase 2: Home Screen** 🏠

#### **Test 2.1: Initial Load**
- [ ] Home screen displays
- [ ] **Expected:** StreakWidget visible
- [ ] **Expected:** ProgressRings visible (Give, Earn, Engage)
- [ ] **Expected:** Balance card shows correct amount
- [ ] **Expected:** Charity coins balance visible
- [ ] **Expected:** Quick actions grid displayed

#### **Test 2.2: Streak Widget**
- [ ] Check current streak
- [ ] Check longest streak
- [ ] **Expected:** Streak data loads
- [ ] **Expected:** Flame animation if streak > 0
- [ ] **Expected:** Motivational message displayed

#### **Test 2.3: Progress Rings**
- [ ] View Give ring progress
- [ ] View Earn ring progress
- [ ] View Engage ring progress
- [ ] **Expected:** All three rings visible
- [ ] **Expected:** Progress percentages correct
- [ ] **Expected:** "Perfect Day!" if all complete

#### **Test 2.4: Pull to Refresh**
- [ ] Pull down to refresh
- [ ] **Expected:** Spinner shows
- [ ] **Expected:** Data reloads
- [ ] **Expected:** Haptic feedback
- [ ] **Expected:** Updated data displays

#### **Test 2.5: Quick Actions**
- [ ] Tap "Give" → Navigate to GiveScreen
- [ ] Tap "Deposit" → Navigate to DepositScreen
- [ ] Tap "Withdraw" → Navigate to WithdrawScreen
- [ ] Tap "History" → Navigate to TransactionHistory
- [ ] **Expected:** Haptic feedback on each tap
- [ ] **Expected:** Smooth navigation

---

### **Phase 3: Gamification Features** 🎮

#### **Test 3.1: Daily Missions**
- [ ] Navigate to Missions tab
- [ ] **Expected:** Today's missions listed
- [ ] **Expected:** Each mission shows:
  - Title
  - Description
  - Reward (coins)
  - Status (pending/completed)
- [ ] Complete a mission (e.g., donate)
- [ ] **Expected:** Confetti celebration
- [ ] **Expected:** Coins added to balance
- [ ] **Expected:** Mission marked complete

#### **Test 3.2: Leaderboard**
- [ ] Navigate to Leaderboard tab
- [ ] **Expected:** Global leaderboard loads
- [ ] **Expected:** Your rank visible
- [ ] **Expected:** Top users displayed
- [ ] Switch to "City" view
- [ ] **Expected:** City leaderboard loads
- [ ] Tap "Boost Position"
- [ ] Enter coin amount
- [ ] Submit boost
- [ ] **Expected:** Position improves
- [ ] **Expected:** Coins deducted

#### **Test 3.3: Achievements**
- [ ] Navigate to Achievements (from Home or Profile)
- [ ] **Expected:** Achievement categories listed
- [ ] **Expected:** Locked achievements shown
- [ ] **Expected:** Unlocked achievements highlighted
- [ ] Tap on achievement
- [ ] **Expected:** Detail modal shows
- [ ] **Expected:** Progress bar visible
- [ ] **Expected:** Unlock animation if just unlocked

#### **Test 3.4: Weekly Challenges**
- [ ] Navigate to Weekly Challenges
- [ ] **Expected:** Current week's challenges listed
- [ ] **Expected:** Each challenge shows:
  - Title
  - Progress
  - Reward
  - Time remaining
- [ ] View progress on challenge
- [ ] **Expected:** Progress bar updates
- [ ] Complete a challenge
- [ ] **Expected:** Celebration animation
- [ ] **Expected:** Reward credited

---

### **Phase 4: Referral System** 👥

#### **Test 4.1: View Referral Code**
- [ ] Navigate to Referral tab
- [ ] **Expected:** Your referral code displayed prominently
- [ ] **Expected:** Referral stats visible:
  - Total referrals
  - Coins earned
  - Pending referrals

#### **Test 4.2: Copy Referral Code**
- [ ] Tap "Copy Code" button
- [ ] **Expected:** Scale animation on button
- [ ] **Expected:** Success haptic feedback
- [ ] **Expected:** Toast: "Referral code copied!"
- [ ] Verify clipboard has code

#### **Test 4.3: Share Referral**
- [ ] Tap "Share" button
- [ ] **Expected:** Share sheet opens
- [ ] **Expected:** Message includes:
  - Referral code
  - Download link
  - Benefit description
- [ ] Complete share
- [ ] **Expected:** Confetti celebration
- [ ] **Expected:** Toast: "Shared successfully!"

#### **Test 4.4: Referral History**
- [ ] View list of referrals
- [ ] **Expected:** Each referral shows:
  - Name/initials
  - Status (registered/first_cycle/completed)
  - Coins earned
- [ ] **Expected:** Empty state if no referrals
- [ ] Pull to refresh
- [ ] **Expected:** List updates

---

### **Phase 5: Coin Purchase (P2P with Agents)** 💰

#### **Test 5.1: View Available Agents**
- [ ] Navigate to Buy Coins
- [ ] **Expected:** List of agents displayed
- [ ] **Expected:** Each agent shows:
  - Name
  - Available coins
  - Online status
  - Rating

#### **Test 5.2: Request Coin Purchase**
- [ ] Select an agent
- [ ] Enter coin quantity (e.g., 100)
- [ ] **Expected:** Price calculated
- [ ] **Expected:** Agent's payment info shown
- [ ] Confirm purchase request
- [ ] **Expected:** Purchase enters escrow
- [ ] **Expected:** Agent's coins locked
- [ ] **Expected:** Navigation to payment instructions

#### **Test 5.3: Payment Instructions**
- [ ] View payment instructions
- [ ] **Expected:** Agent's bank details / mobile money
- [ ] **Expected:** Amount to pay shown
- [ ] **Expected:** Reference code shown
- [ ] **Expected:** 30-minute timer displayed

#### **Test 5.4: Payment Confirmation**
- [ ] Make payment to agent
- [ ] Wait for agent to confirm
- [ ] **Expected:** Push notification when confirmed
- [ ] **Expected:** Coins credited to balance
- [ ] **Expected:** Purchase marked complete
- [ ] **Expected:** Success celebration

#### **Test 5.5: Pending Purchases**
- [ ] View pending purchases
- [ ] **Expected:** Active purchases listed
- [ ] **Expected:** Timer shows time remaining
- [ ] **Expected:** Cancel button available
- [ ] Cancel a purchase
- [ ] **Expected:** Escrow released
- [ ] **Expected:** Purchase cancelled

---

### **Phase 6: Donations & Giving** ❤️

#### **Test 6.1: Make a Donation**
- [ ] Navigate to Give screen
- [ ] Select recipient
- [ ] Enter donation amount
- [ ] **Expected:** Validation checks:
  - Minimum amount
  - Sufficient balance
- [ ] Submit donation
- [ ] **Expected:** Confirmation modal
- [ ] Confirm donation
- [ ] **Expected:** Success celebration
- [ ] **Expected:** Balance updated
- [ ] **Expected:** Mission progress updated
- [ ] **Expected:** Progress rings updated

#### **Test 6.2: Donation History**
- [ ] Navigate to Cycle History
- [ ] **Expected:** Past donations listed
- [ ] **Expected:** Each donation shows:
  - Recipient
  - Amount
  - Date
  - Status
- [ ] Tap on donation
- [ ] **Expected:** Detail screen shows
- [ ] **Expected:** Receipt visible

---

### **Phase 7: Profile & Settings** ⚙️

#### **Test 7.1: Profile Display**
- [ ] Navigate to Profile
- [ ] **Expected:** User info displayed:
  - Name
  - Email
  - Phone
  - Role
  - Level
  - XP progress
- [ ] **Expected:** Stats visible:
  - Total donations
  - Coins earned
  - Referrals
- [ ] **Expected:** Achievement showcase
- [ ] **Expected:** Profile completion percentage

#### **Test 7.2: Edit Profile**
- [ ] Tap "Edit Profile"
- [ ] Update profile fields
- [ ] Submit changes
- [ ] **Expected:** Success toast
- [ ] **Expected:** Profile updated
- [ ] **Expected:** Changes reflected immediately

#### **Test 7.3: KYC Verification**
- [ ] Navigate to KYC Verification
- [ ] Upload required documents
- [ ] Submit verification
- [ ] **Expected:** Success message
- [ ] **Expected:** Status changes to "Pending"

---

### **Phase 8: Marketplace** 🛒

#### **Test 8.1: Browse Items**
- [ ] Navigate to Marketplace
- [ ] **Expected:** Items displayed in grid
- [ ] **Expected:** Each item shows:
  - Image
  - Name
  - Price (in charity coins)
  - Category
- [ ] Filter by category
- [ ] **Expected:** Filtered results

#### **Test 8.2: Item Details**
- [ ] Tap on item
- [ ] **Expected:** Detail screen shows
- [ ] **Expected:** Full description
- [ ] **Expected:** Price
- [ ] **Expected:** "Redeem" button

#### **Test 8.3: Redeem Item**
- [ ] Tap "Redeem"
- [ ] **Expected:** Confirmation modal
- [ ] Confirm redemption
- [ ] **Expected:** Coins deducted
- [ ] **Expected:** Redemption recorded
- [ ] **Expected:** Success celebration

---

### **Phase 9: Notifications** 🔔

#### **Test 9.1: View Notifications**
- [ ] Navigate to Notifications
- [ ] **Expected:** List of notifications
- [ ] **Expected:** Unread count badge
- [ ] Tap notification
- [ ] **Expected:** Mark as read
- [ ] **Expected:** Navigate to relevant screen

#### **Test 9.2: Push Notifications**
- [ ] Trigger event (donation received, mission complete)
- [ ] **Expected:** Push notification appears
- [ ] Tap notification
- [ ] **Expected:** App opens to relevant screen

---

### **Phase 10: Error Handling** ⚠️

#### **Test 10.1: Network Errors**
- [ ] Turn off WiFi/Data
- [ ] Try to make API call
- [ ] **Expected:** Error toast: "No internet connection"
- [ ] **Expected:** Retry button
- [ ] Turn on WiFi/Data
- [ ] Tap retry
- [ ] **Expected:** Request succeeds

#### **Test 10.2: Validation Errors**
- [ ] Submit form with invalid data
- [ ] **Expected:** Inline error messages
- [ ] **Expected:** Error shake animation
- [ ] **Expected:** Form not submitted

#### **Test 10.3: Server Errors**
- [ ] Stop backend server
- [ ] Try API call
- [ ] **Expected:** Error toast: "Server error"
- [ ] **Expected:** Helpful error message

---

## 🎨 **POLISH VERIFICATION**

### **Visual Polish**
- [ ] All animations smooth (60fps)
- [ ] No janky scrolling
- [ ] Loading states display correctly
- [ ] Skeleton loaders appear
- [ ] Empty states have illustrations
- [ ] Success celebrations trigger

### **Interaction Polish**
- [ ] Haptic feedback on all buttons
- [ ] Scale animation on button press
- [ ] Smooth page transitions
- [ ] Pull-to-refresh works everywhere
- [ ] Swipe gestures work

### **Data Polish**
- [ ] No placeholder text in production
- [ ] All images load correctly
- [ ] Proper error messages
- [ ] Helpful empty states
- [ ] Correct number formatting

---

## 🐛 **COMMON ISSUES & FIXES**

### **Issue: "Cannot connect to backend"**
**Fix:**
```bash
# Check if backend is running
curl http://localhost:3000/api/v1/health

# If not, start it
cd /workspace/chaingive-backend
npm run dev
```

### **Issue: "Metro bundler not starting"**
**Fix:**
```bash
cd /workspace/chaingive-mobile
# Clear cache
npm start -- --reset-cache
```

### **Issue: "App crashes on launch"**
**Fix:**
```bash
# Check logs
npx react-native log-android
# OR
npx react-native log-ios

# Rebuild app
npm run android
# OR
npm run ios
```

### **Issue: "Animations not smooth"**
**Fix:**
- Enable dev mode
- Check for memory leaks
- Optimize large lists with FlatList
- Use native driver for animations

---

## 📊 **TESTING REPORT TEMPLATE**

```markdown
# ChainGive Mobile Testing Report

**Date:** YYYY-MM-DD  
**Tester:** Your Name  
**Platform:** Android / iOS  
**Device:** Device Model  
**OS Version:** X.X.X  

## Test Results

### Authentication ✅ / ❌
- Registration: [PASS/FAIL]
- Login: [PASS/FAIL]
- OTP: [PASS/FAIL]

### Home Screen ✅ / ❌
- Load: [PASS/FAIL]
- Streak: [PASS/FAIL]
- Progress Rings: [PASS/FAIL]

### Gamification ✅ / ❌
- Missions: [PASS/FAIL]
- Leaderboard: [PASS/FAIL]
- Achievements: [PASS/FAIL]

... (continue for all features)

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## ✅ **TESTING COMPLETE CHECKLIST**

- [ ] All authentication flows work
- [ ] Home screen loads correctly
- [ ] StreakWidget and ProgressRings display
- [ ] Gamification features work
- [ ] Referral system functional
- [ ] Coin purchases work
- [ ] Donations process correctly
- [ ] Profile and settings work
- [ ] Marketplace works
- [ ] Notifications work
- [ ] Error handling proper
- [ ] All polish features present
- [ ] Performance is smooth
- [ ] No crashes during testing

**All checked? App is ready to ship! 🚀**

---

## 📱 **NEXT STEPS AFTER TESTING**

1. **If all tests pass:**
   - Build production APK/IPA
   - Submit to app stores
   - Start beta testing program

2. **If issues found:**
   - Document all issues
   - Prioritize by severity
   - Fix critical issues first
   - Re-test after fixes

3. **Performance optimization:**
   - Profile app with React DevTools
   - Optimize bundle size
   - Implement code splitting
   - Add analytics

---

**Happy Testing! 🧪**
