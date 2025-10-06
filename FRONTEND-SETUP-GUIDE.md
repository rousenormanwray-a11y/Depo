# 📱 ChainGive Mobile Frontend - Setup Guide

**Last Updated:** October 6, 2025

---

## 🚀 Quick Start

### 1. Install New Dependencies

```bash
cd chaingive-mobile
npm install axios @react-native-async-storage/async-storage
```

### 2. Link Native Dependencies (if using React Native < 0.60)

```bash
npx react-native link @react-native-async-storage/async-storage
```

### 3. Create Environment Configuration

Create a `.env` file in the root of `chaingive-mobile/`:

```env
# API Configuration
API_BASE_URL=http://localhost:3000/v1

# For Production
# API_BASE_URL=https://api.chaingive.ng/v1

# Payment Providers
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_APP_ID=your_app_id
FIREBASE_API_KEY=your_api_key
```

### 4. Install Environment Variables Package

```bash
npm install react-native-dotenv
npm install --save-dev @types/react-native-dotenv
```

### 5. Update `babel.config.js`

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
```

### 6. Create Environment Type Definitions

Create `chaingive-mobile/src/types/env.d.ts`:

```typescript
declare module '@env' {
  export const API_BASE_URL: string;
  export const FLUTTERWAVE_PUBLIC_KEY: string;
  export const PAYSTACK_PUBLIC_KEY: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_API_KEY: string;
}
```

---

## 📁 File Structure

New files added:

```
chaingive-mobile/src/
├── services/
│   ├── api.ts                 ✅ NEW - API client
│   ├── authService.ts         ✅ NEW - Auth endpoints
│   ├── walletService.ts       ✅ NEW - Wallet endpoints
│   ├── donationService.ts     ✅ NEW - Donation endpoints
│   ├── cycleService.ts        ✅ NEW - Cycle endpoints
│   ├── marketplaceService.ts  ✅ NEW - Marketplace endpoints
│   └── agentService.ts        ✅ NEW - Agent endpoints
│
├── components/common/
│   ├── Button.tsx             ✅ NEW - Reusable button
│   ├── Input.tsx              ✅ NEW - Reusable input
│   ├── Modal.tsx              ✅ NEW - Bottom sheet modal
│   └── Toast.tsx              ✅ NEW - Toast notifications
│
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx    (existing)
│   │   └── OTPScreen.tsx      ✅ NEW - OTP verification
│   │
│   ├── donations/
│   │   └── GiveScreen.tsx     ✅ NEW - Give donation
│   │
│   └── wallet/
│       ├── DepositScreen.tsx  ✅ NEW - Deposit funds
│       └── WithdrawScreen.tsx ✅ NEW - Withdraw funds
```

---

## 🔄 Navigation Updates

Update your navigation files to include the new screens:

### `src/navigation/AuthNavigator.tsx`

```typescript
import OTPScreen from '../screens/auth/OTPScreen';

const Stack = createStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      {/* ... other screens */}
    </Stack.Navigator>
  );
};
```

### `src/navigation/HomeNavigator.tsx`

```typescript
import GiveScreen from '../screens/donations/GiveScreen';
import DepositScreen from '../screens/wallet/DepositScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';

const Stack = createStackNavigator();

export const HomeNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="GiveScreen" component={GiveScreen} />
      <Stack.Screen name="DepositScreen" component={DepositScreen} />
      <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} />
      {/* ... other screens */}
    </Stack.Navigator>
  );
};
```

---

## 🔌 Update Redux Slices

### Update `authSlice.ts`

Replace mock implementation with real API calls:

```typescript
import { authService } from '../../services/authService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login({
      phoneNumber: credentials.email, // or phoneNumber if using that
      password: credentials.password,
    });
    return response;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const fetchUserBalance = createAsyncThunk(
  'auth/fetchBalance',
  async (userId: string) => {
    const response = await walletService.getBalance();
    return response;
  }
);
```

---

## 🧪 Testing the Integration

### 1. Start Backend Server

```bash
cd chaingive-backend
npm run dev
```

### 2. Start Metro Bundler

```bash
cd chaingive-mobile
npm start
```

### 3. Run on Device/Emulator

```bash
# iOS
npm run ios

# Android
npm run android
```

### 4. Test Critical Flows

1. ✅ **Registration & OTP**
   - Register new user
   - Receive OTP (check backend logs)
   - Verify OTP
   - Navigate to main app

2. ✅ **Login**
   - Login with credentials
   - Token stored in AsyncStorage
   - Navigate to home

3. ✅ **Deposit**
   - Select payment method
   - Enter amount
   - Initiate deposit
   - Payment URL opens (for online methods)

4. ✅ **Withdraw**
   - Enter bank details
   - Enter amount
   - Confirm withdrawal
   - Check backend for transaction

5. ✅ **Give Donation**
   - Enter amount
   - Find match
   - Confirm donation
   - Funds in escrow

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to localhost"

**Solution:** Update API URL for physical devices:

```env
# For Android emulator
API_BASE_URL=http://10.0.2.2:3000/v1

# For iOS simulator
API_BASE_URL=http://localhost:3000/v1

# For physical device (replace with your computer's IP)
API_BASE_URL=http://192.168.1.100:3000/v1
```

### Issue 2: "Network request failed"

**Solutions:**
- Ensure backend is running
- Check if firewall is blocking connections
- Verify API_BASE_URL is correct
- Check device/emulator has internet

### Issue 3: "AsyncStorage not found"

**Solution:**
```bash
cd ios && pod install && cd ..
npm run ios
```

### Issue 4: "Token not persisting"

**Solution:**
Check AsyncStorage permissions and clear app data:
```bash
# iOS
npm run ios -- --reset-cache

# Android
adb shell pm clear com.chaingive
```

---

## 📊 API Integration Status

| Feature | Screen | Service | Status |
|---------|--------|---------|--------|
| Login | LoginScreen | authService.login() | ✅ |
| Register | (TBD) | authService.register() | ⚠️ |
| OTP | OTPScreen | authService.verifyOTP() | ✅ |
| Deposit | DepositScreen | walletService.initiateDeposit() | ✅ |
| Withdraw | WithdrawScreen | walletService.initiateWithdrawal() | ✅ |
| Give | GiveScreen | donationService.giveDonation() | ✅ |
| Balance | HomeScreen | walletService.getBalance() | ⚠️ |
| Transactions | (TBD) | walletService.getTransactions() | ⚠️ |
| Cycles | (TBD) | cycleService.getCycles() | ⚠️ |
| Marketplace | CheckoutScreen | marketplaceService.redeemItem() | ⚠️ |
| Agent | AgentDashboardScreen | agentService.getDashboard() | ⚠️ |

**Legend:**
- ✅ Fully integrated
- ⚠️ Service ready, needs screen connection

---

## 🔐 Security Best Practices

1. **Never commit `.env` file**
   - Add to `.gitignore`
   - Use different values for dev/prod

2. **Token Storage**
   - Tokens stored securely in AsyncStorage
   - Automatic refresh on expiry
   - Clear tokens on logout

3. **API Calls**
   - Always use HTTPS in production
   - Validate all inputs
   - Handle errors gracefully

---

## 📱 Platform-Specific Notes

### iOS

1. Update `Info.plist` for HTTP (dev only):
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

2. Install pods:
```bash
cd ios && pod install
```

### Android

1. Update `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

2. Enable clear text (dev only) in `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables

```env
API_BASE_URL=https://api.chaingive.ng/v1
```

### 2. Remove Dev Configurations

- Remove `usesCleartextTraffic` from Android
- Remove `NSAllowsArbitraryLoads` from iOS
- Ensure HTTPS only

### 3. Build for Production

```bash
# iOS
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release

# Android
cd android
./gradlew assembleRelease
```

---

## 📚 Additional Resources

- Backend API Docs: `chaingive-backend/API-QUICK-REFERENCE.md`
- Service Documentation: Check JSDoc comments in service files
- Component Documentation: Check prop types in component files

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env` file created
- [ ] Backend server running
- [ ] Navigation updated
- [ ] Redux slices updated
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Error handling tested
- [ ] Token refresh tested
- [ ] All critical flows working

---

**Setup by:** AI Development Team  
**Last Updated:** October 6, 2025  
**Questions?** Check the service files for inline documentation
