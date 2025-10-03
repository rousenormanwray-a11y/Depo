# 📱 ChainGive Mobile App

> The Ethical Peer-to-Peer Altruism Engine

**Version:** 2.4.0  
**Platform:** React Native (iOS & Android)

---

## 🎯 About ChainGive

ChainGive is Nigeria's first peer-to-peer giving platform where generosity flows freely, transparently, and sustainably.

**Core Features:**
- ✅ Peer-to-peer donation cycles
- ✅ Wallet management
- ✅ Charity Coin rewards system
- ✅ Marketplace (airtime, data, vouchers)
- ✅ Trust score & gamification
- ✅ Mock data for development/testing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Clone the repository
cd chaingive-mobile

# Install dependencies
npm install

# iOS only: Install pods
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 📂 Project Structure

```
chaingive-mobile/
├── src/
│   ├── api/                  # API integration (future)
│   ├── components/           # Reusable UI components
│   │   ├── buttons/          # Button components
│   │   ├── forms/            # Form inputs
│   │   └── cards/            # Card components
│   ├── navigation/           # React Navigation setup
│   │   ├── AppNavigator.tsx  # Root navigator
│   │   ├── AuthNavigator.tsx # Auth flow
│   │   └── MainNavigator.tsx # Main app tabs
│   ├── screens/              # App screens
│   │   ├── auth/             # Login, Register
│   │   ├── home/             # Home dashboard
│   │   ├── marketplace/      # Marketplace
│   │   └── profile/          # User profile
│   ├── store/                # Redux state management
│   │   ├── slices/           # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   ├── walletSlice.ts
│   │   │   ├── donationSlice.ts
│   │   │   └── marketplaceSlice.ts
│   │   ├── store.ts          # Redux store config
│   │   └── hooks.ts          # Typed hooks
│   ├── theme/                # Design system
│   │   ├── colors.ts         # Color palette
│   │   ├── typography.ts     # Typography scale
│   │   └── spacing.ts        # Spacing system
│   ├── types/                # TypeScript types
│   └── App.tsx               # Root component
├── package.json
└── tsconfig.json
```

---

## 🎨 Design System

### Colors

Based on ChainGive UI/UX Specification Guide:

```typescript
colors.primary       // #2E8B57 - Growth Green
colors.secondary     // #1E90FF - Trust Blue
colors.tertiary      // #FFD700 - Honor Gold
colors.success       // #28A745 - Forest Green
colors.warning       // #FFC107 - Amber
colors.error         // #DC3545 - Crimson
```

### Typography

```typescript
typography.h1        // 24px, Bold
typography.h2        // 20px, Bold
typography.h3        // 18px, SemiBold
typography.bodyLarge // 16px, Regular
typography.bodyRegular // 14px, Regular
typography.caption   // 12px, Regular
```

---

## 🧪 Mock Data

The app currently uses **mock data** for development. No backend API required.

**Mock Credentials (Login):**
- Phone: Any number (e.g., +2348012345678)
- Password: Any password

**Features with Mock Data:**
- ✅ User authentication (login/register)
- ✅ Wallet balance & transactions
- ✅ Donation cycles
- ✅ Marketplace listings
- ✅ User profile & stats

---

## 📱 Key Screens

### 1. Authentication
- **LoginScreen**: User login with phone/password
- **RegisterScreen**: New user registration

### 2. Home Dashboard
- Wallet balance & Charity Coins
- Cycle progress indicator
- Quick actions (Give, Shop)
- Recent activity feed

### 3. Marketplace
- Browse listings by category
- Filter: Airtime, Data, Vouchers, Services
- Display Charity Coin prices

### 4. Profile
- User info & tier badge
- Trust score display
- Achievement badges
- Account settings menu
- Logout

---

## 🛠️ State Management

Using **Redux Toolkit** with the following slices:

| Slice | Purpose | State |
|-------|---------|-------|
| **authSlice** | User authentication | user, token, isAuthenticated |
| **walletSlice** | Wallet & transactions | wallet, transactions |
| **donationSlice** | Cycles & matches | cycles, pendingMatches |
| **marketplaceSlice** | Listings | listings |

**Redux Persist:**
- Only `authSlice` is persisted to AsyncStorage
- Other slices reset on app restart

---

## 🎯 Next Steps (Connecting to Real Backend)

### 1. API Integration

Update `src/api/client.ts`:

```typescript
const BASE_URL = 'https://api.chaingive.ng/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Update Redux Thunks

Replace mock data calls in slices with real API calls:

```typescript
// src/store/slices/authSlice.ts
export const login = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    const response = await authAPI.login(credentials);
    return response.data;
  }
);
```

### 3. Environment Variables

Create `.env` file:

```
API_URL=https://api.chaingive.ng/v1
MIXPANEL_TOKEN=your_token
FIREBASE_API_KEY=your_key
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

---

## 📦 Building for Production

### iOS

```bash
cd ios
xcodebuild -workspace ChainGive.xcworkspace \
  -scheme ChainGive \
  -configuration Release
```

### Android

```bash
cd android
./gradlew assembleRelease
```

---

## 📄 Documentation

See parent directory for complete documentation:

- **Product Bible v2.4**: Complete product specification
- **UI/UX Specification Guide**: Design system
- **Technical Architecture**: Full backend architecture
- **Testing & QA**: Test cases and benchmarks

---

## 🎨 Design Assets

All design specifications follow the **ChainGive UI/UX Specification Guide**:

- Color palette (WCAG AA compliant)
- Typography scale (Inter font family)
- 8-point spacing grid
- Accessibility guidelines

---

## 🐛 Known Limitations (Demo Version)

- ❌ No real backend API integration
- ❌ Mock authentication (any credentials work)
- ❌ Static mock data (doesn't persist)
- ❌ No push notifications
- ❌ No payment integration
- ❌ No blockchain logging

**This is a fully functional UI demo** showcasing the complete ChainGive user experience with mock data.

---

## 📞 Support

For questions or issues:

**Email:** dev@chaingive.ng  
**Docs:** See `/workspace` directory for full documentation

---

## 📜 License

Copyright © 2025 ChainGive Technologies Limited

---

**Built with 💚 in Lagos, Nigeria**

*"You don't donate to get back. You donate because someone once gave to you."*
