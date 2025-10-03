# 📱 **ChainGive React Native Architecture Guide**

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Document Owner:** Engineering Team

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Technology Stack](#3-technology-stack)
4. [State Management](#4-state-management)
5. [Navigation](#5-navigation)
6. [API Integration](#6-api-integration)
7. [Authentication Flow](#7-authentication-flow)
8. [Component Library](#8-component-library)
9. [Performance Optimization](#9-performance-optimization)
10. [Testing Strategy](#10-testing-strategy)
11. [Build & Deployment](#11-build--deployment)
12. [Code Standards](#12-code-standards)

---

## 1. Project Overview

### App Specifications

**Name:** ChainGive  
**Platforms:** iOS 12+, Android 8+ (API level 26+)  
**Target Size:** <15MB (APK/IPA)  
**Languages:** English, Pidgin, Yoruba, Hausa, Igbo  

### Key Features

- User authentication (phone/email + password)
- Wallet management (deposits, withdrawals, balance)
- Donation cycles (give/receive)
- Matching algorithm interface
- Charity Coin marketplace
- Agent dashboard
- Push notifications
- Offline mode (view history, cached data)

---

## 2. Folder Structure

```
chaingive-mobile/
├── android/                  # Android native code
├── ios/                      # iOS native code
├── src/
│   ├── api/                  # API client & endpoints
│   │   ├── client.ts         # Axios instance
│   │   ├── auth.ts           # Auth endpoints
│   │   ├── wallet.ts         # Wallet endpoints
│   │   ├── donations.ts      # Donation endpoints
│   │   ├── marketplace.ts    # Marketplace endpoints
│   │   └── index.ts          # Exports
│   │
│   ├── assets/               # Images, fonts, icons
│   │   ├── icons/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── animations/       # Lottie files
│   │
│   ├── components/           # Reusable components
│   │   ├── buttons/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   └── TextButton.tsx
│   │   ├── cards/
│   │   │   ├── DonationCard.tsx
│   │   │   ├── LeaderboardCard.tsx
│   │   │   └── MarketplaceCard.tsx
│   │   ├── forms/
│   │   │   ├── Input.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Checkbox.tsx
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   ├── Header.tsx
│   │   │   └── BottomNav.tsx
│   │   └── common/
│   │       ├── Icon.tsx
│   │       ├── Badge.tsx
│   │       ├── ProgressBar.tsx
│   │       └── Alert.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   ├── useDonations.ts
│   │   ├── useNotifications.ts
│   │   └── useNetwork.ts
│   │
│   ├── navigation/           # React Navigation
│   │   ├── AppNavigator.tsx  # Main navigator
│   │   ├── AuthNavigator.tsx # Auth flow
│   │   ├── MainNavigator.tsx # Logged-in flow
│   │   └── linking.ts        # Deep linking config
│   │
│   ├── screens/              # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── OTPScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── wallet/
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── DepositScreen.tsx
│   │   │   └── WithdrawScreen.tsx
│   │   ├── donations/
│   │   │   ├── GiveScreen.tsx
│   │   │   ├── ReceiveScreen.tsx
│   │   │   └── CycleHistoryScreen.tsx
│   │   ├── marketplace/
│   │   │   ├── MarketplaceScreen.tsx
│   │   │   ├── ItemDetailScreen.tsx
│   │   │   └── CheckoutScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       └── KYCScreen.tsx
│   │
│   ├── store/                # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── walletSlice.ts
│   │   │   ├── donationSlice.ts
│   │   │   └── marketplaceSlice.ts
│   │   ├── store.ts          # Configure store
│   │   └── hooks.ts          # Typed hooks (useAppDispatch, etc.)
│   │
│   ├── theme/                # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── types/                # TypeScript types
│   │   ├── user.ts
│   │   ├── wallet.ts
│   │   ├── donation.ts
│   │   ├── marketplace.ts
│   │   └── index.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── validation.ts     # Form validators
│   │   ├── formatting.ts     # Number, date formatting
│   │   ├── storage.ts        # AsyncStorage helpers
│   │   ├── permissions.ts    # Camera, notifications
│   │   └── constants.ts      # App constants
│   │
│   ├── services/             # Business logic
│   │   ├── authService.ts
│   │   ├── walletService.ts
│   │   ├── notificationService.ts
│   │   └── analyticsService.ts
│   │
│   └── App.tsx               # Root component
│
├── __tests__/                # Test files
├── .env                      # Environment variables
├── .eslintrc.js              # Linting rules
├── .prettierrc               # Code formatting
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # Developer docs
```

---

## 3. Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    
    "Navigation": {
      "@react-navigation/native": "^6.1.9",
      "@react-navigation/stack": "^6.3.20",
      "@react-navigation/bottom-tabs": "^6.5.11"
    },
    
    "State Management": {
      "@reduxjs/toolkit": "^2.0.1",
      "react-redux": "^9.0.4",
      "redux-persist": "^6.0.0"
    },
    
    "API & Networking": {
      "axios": "^1.6.2",
      "@react-native-async-storage/async-storage": "^1.21.0"
    },
    
    "UI Components": {
      "react-native-paper": "^5.11.3",
      "react-native-vector-icons": "^10.0.3",
      "react-native-svg": "^14.1.0"
    },
    
    "Forms": {
      "react-hook-form": "^7.48.2",
      "yup": "^1.3.3"
    },
    
    "Notifications": {
      "@react-native-firebase/app": "^18.7.3",
      "@react-native-firebase/messaging": "^18.7.3"
    },
    
    "Utilities": {
      "date-fns": "^3.0.6",
      "i18next": "^23.7.8",
      "react-i18next": "^14.0.0"
    },
    
    "Analytics": {
      "mixpanel-react-native": "^3.0.0"
    }
  },
  
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-native": "^0.72.8",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.2",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

---

## 4. State Management

### Redux Toolkit Setup

**store/store.ts**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import donationReducer from './slices/donationSlice';
import marketplaceReducer from './slices/marketplaceSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'wallet'], // Only persist these
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(persistConfig, authReducer),
    wallet: walletReducer,
    donation: donationReducer,
    marketplace: marketplaceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**store/hooks.ts**
```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Example Slice: authSlice.ts

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../api/auth';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { phone_number: string; password: string }) => {
    const response = await authAPI.login(credentials);
    return response.data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    phone_number: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    const response = await authAPI.register(userData);
    return response.data;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authAPI.logout();
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Registration failed';
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
```

---

## 5. Navigation

### Navigation Structure

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../store/hooks';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { linking } from './linking';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Auth Navigator

```typescript
// navigation/AuthNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTP: { phone_number: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
}
```

### Main Navigator (Bottom Tabs)

```typescript
// navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/common/Icon';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
import DonationsNavigator from './DonationsNavigator';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Give: undefined;
  Marketplace: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Give':
              iconName = 'heart';
              break;
            case 'Marketplace':
              iconName = 'shopping-bag';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutralMedium,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Give" component={DonationsNavigator} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

---

## 6. API Integration

### API Client Setup

```typescript
// api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const BASE_URL = Config.API_URL || 'https://api.chaingive.ng/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '2.4.0',
    'X-Platform': 'mobile',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      await AsyncStorage.removeItem('auth_token');
      // Dispatch logout action (import from store)
    }

    const message = error.response?.data?.error?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
```

### API Modules

```typescript
// api/auth.ts
import { apiClient } from './client';

export const authAPI = {
  login: (credentials: { phone_number: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  register: (userData: any) => apiClient.post('/auth/register', userData),

  verifyOTP: (data: { phone_number: string; otp: string }) =>
    apiClient.post('/auth/verify-otp', data),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
};

// api/wallet.ts
export const walletAPI = {
  getBalance: () => apiClient.get('/wallet/balance'),

  deposit: (data: { amount: number; payment_method: string }) =>
    apiClient.post('/wallet/deposit', data),

  withdraw: (data: {
    amount: number;
    bank_code: string;
    account_number: string;
  }) => apiClient.post('/wallet/withdraw', data),

  getTransactions: (params: { limit: number; offset: number }) =>
    apiClient.get('/wallet/transactions', { params }),
};

// api/donations.ts
export const donationsAPI = {
  getCycles: (params: { status?: string; limit: number; offset: number }) =>
    apiClient.get('/cycles', { params }),

  give: (data: {
    amount: number;
    recipient_preference: string;
    recipient_id?: string;
  }) => apiClient.post('/donations/give', data),

  confirmReceipt: (data: { transaction_id: string; confirm: boolean }) =>
    apiClient.post('/cycles/confirm-receipt', data),

  getPendingMatches: () => apiClient.get('/matches/pending'),

  acceptMatch: (matchId: string) =>
    apiClient.post(`/matches/${matchId}/accept`),
};

// api/marketplace.ts
export const marketplaceAPI = {
  getListings: (params: { category?: string; limit: number; offset: number }) =>
    apiClient.get('/marketplace/listings', { params }),

  redeem: (data: { listing_id: string; quantity: number }) =>
    apiClient.post('/marketplace/redeem', data),

  getRedemptions: () => apiClient.get('/marketplace/redemptions'),
};
```

---

## 7. Authentication Flow

### Login Screen Example

```typescript
// screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import Input from '../../components/forms/Input';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Alert from '../../components/common/Alert';
import { spacing } from '../../theme/spacing';

const schema = yup.object().shape({
  phone_number: yup
    .string()
    .matches(/^\+234\d{10}$/, 'Phone number must be in format +234XXXXXXXXXX')
    .required('Phone number is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export default function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    await dispatch(login(data));
  };

  return (
    <View style={styles.container}>
      {error && <Alert type="error" message={error} />}

      <Controller
        control={control}
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Phone Number"
            placeholder="+234XXXXXXXXXX"
            keyboardType="phone-pad"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={errors.phone_number?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={errors.password?.message}
          />
        )}
      />

      <PrimaryButton
        title="Log In"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
      />

      <TextButton
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
});
```

---

## 8. Component Library

### PrimaryButton Component

```typescript
// components/buttons/PrimaryButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    backgroundColor: colors.neutralMedium,
    opacity: 0.5,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
});
```

### DonationCard Component

```typescript
// components/cards/DonationCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../common/Icon';
import PrimaryButton from '../buttons/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface DonationCardProps {
  amount: number;
  donorName: string;
  location: string;
  timeAgo: string;
  onConfirm: () => void;
}

export default function DonationCard({
  amount,
  donorName,
  location,
  timeAgo,
  onConfirm,
}: DonationCardProps) {
  return (
    <View style={styles.card}>
      <Icon name="heart" size={32} color={colors.primary} />

      <Text style={styles.amount}>
        You received ₦{amount.toLocaleString()}
      </Text>

      <Text style={styles.donor}>
        from {donorName} in {location}
      </Text>

      <Text style={styles.timestamp}>{timeAgo}</Text>

      <PrimaryButton title="Confirm Receipt" onPress={onConfirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  amount: {
    ...typography.h2,
    color: colors.charcoal,
    marginTop: spacing.sm,
  },
  donor: {
    ...typography.bodyRegular,
    color: colors.charcoal,
    marginTop: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.neutralMedium,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
});
```

---

## 9. Performance Optimization

### Lazy Loading

```typescript
import React, { lazy, Suspense } from 'react';

const MarketplaceScreen = lazy(() => import('./screens/marketplace/MarketplaceScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MarketplaceScreen />
    </Suspense>
  );
}
```

### Memoization

```typescript
import React, { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => /* expensive operation */);
  }, [data]);

  // Memoize callbacks
  const handlePress = useCallback(() => {
    console.log('Pressed');
  }, []);

  return <FlatList data={processedData} onPress={handlePress} />;
}

export default React.memo(ExpensiveComponent);
```

### Image Optimization

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.high }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.image}
/>
```

---

## 10. Testing Strategy

### Unit Tests (Jest)

```typescript
// __tests__/components/PrimaryButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../../src/components/buttons/PrimaryButton';

describe('PrimaryButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={onPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} loading />
    );
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
// __tests__/screens/LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import LoginScreen from '../../src/screens/auth/LoginScreen';

describe('LoginScreen', () => {
  it('successfully logs in user', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    fireEvent.changeText(
      getByPlaceholderText('+234XXXXXXXXXX'),
      '+2348012345678'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'SecurePass123!'
    );

    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
  });
});
```

---

## 11. Build & Deployment

### Environment Variables

**.env**
```
API_URL=https://api.chaingive.ng/v1
MIXPANEL_TOKEN=your_token
FIREBASE_API_KEY=your_key
```

### Build Commands

**Android:**
```bash
# Debug
npx react-native run-android

# Release
cd android && ./gradlew assembleRelease
```

**iOS:**
```bash
# Debug
npx react-native run-ios

# Release
cd ios && xcodebuild -workspace ChainGive.xcworkspace -scheme ChainGive -configuration Release
```

### CI/CD (GitHub Actions)

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: cd android && ./gradlew assembleRelease
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

---

## 12. Code Standards

### ESLint Configuration

**.eslintrc.js**
```javascript
module.exports = {
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
```

### Prettier Configuration

**.prettierrc**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

---

**Version:** 2.4  
**Last Updated:** October 3, 2025

*"Clean code is simple and direct. Clean code reads like well-written prose." — Grady Booch*
