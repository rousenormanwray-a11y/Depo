# ⚡ ChainGive Mobile - Immediate Action Items

**Priority:** 🔴 FIX TODAY  
**Estimated Time:** 6-8 hours

---

## ✅ **QUICK WINS CHECKLIST**

### **1. Environment Setup (30 minutes)**

```bash
# Install dependencies
npm install react-native-dotenv @react-native-community/netinfo

# Create environment files
```

Create these files:

**.env.development**
```env
API_BASE_URL=http://localhost:3000/api/v1
ENVIRONMENT=development
```

**.env.staging**
```env
API_BASE_URL=https://staging-api.chaingive.ng/api/v1
ENVIRONMENT=staging
```

**.env.production**
```env
API_BASE_URL=https://api.chaingive.ng/api/v1
ENVIRONMENT=production
```

**.env.example**
```env
API_BASE_URL=
ENVIRONMENT=
```

Update `babel.config.js`:
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      envName: 'APP_ENV',
      moduleName: '@env',
      path: '.env',
    }],
  ],
};
```

---

### **2. Fix API Client (15 minutes)**

**File:** `src/api/client.ts`

```typescript
import { API_BASE_URL } from '@env';
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = API_BASE_URL || 'https://api.chaingive.ng/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Improve response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const message = (error.response as any)?.data?.error?.message 
      || (error.response as any)?.data?.message
      || error.message 
      || 'Request failed';
    
    // Handle 401 - token expired
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Dispatch logout action
    }
    
    return Promise.reject(new Error(message));
  }
);
```

---

### **3. Remove Mock Fallbacks (2 hours)**

#### **authSlice.ts - Fix loginUser**

```typescript
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email?: string; phoneNumber?: string; password: string }) => {
    const res = await authAPI.login(credentials);
    const data = res.data;
    
    if (!data.token || !data.user) {
      throw new Error('Invalid response from server');
    }
    
    await AsyncStorage.setItem('auth_token', data.token);
    analytics.track('login_success', { userId: data.user.id });
    
    return { user: data.user as User, token: data.token };
  }
);
```

**Remove these lines:**
- Lines 52-64 (mock fallback)
- Do same for `register` (remove lines 84-98)
- Do same for `verifyOTP` (remove lines 110-116)
- Do same for `fetchUserBalance` (remove lines 130-136)

#### **marketplaceSlice.ts - Fix all mocks**

**Delete lines 6-84** (all mock data)

Update `fetchMarketplaceItems`:
```typescript
export const fetchMarketplaceItems = createAsyncThunk(
  'marketplace/fetchItems',
  async (params: { page?: number; limit?: number } | void, { getState }) => {
    const state = getState() as { marketplace: typeof initialState };
    const category = state.marketplace.selectedCategory || undefined;
    const q = state.marketplace.searchQuery || undefined;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    
    const res = await marketplaceAPI.getListings({ limit, category, q, page });
    const data = res.data;
    
    return (data?.items || data || []) as MarketplaceItem[];
  }
);
```

**Remove lines 126-129** (mock fallback)  
**Remove lines 140-143** (mock fallback)  
**Remove lines 166-190** (mock fallback)

---

### **4. Create Agent API Client (1 hour)**

**Create:** `src/api/agent.ts`

```typescript
import { apiClient } from './client';

export const agentAPI = {
  getDashboard: () => {
    return apiClient.get('/agents/dashboard');
  },

  getPendingVerifications: () => {
    return apiClient.get('/agents/verifications/pending');
  },

  processVerification: (data: {
    requestId: string;
    status: 'approved' | 'rejected';
    notes?: string;
  }) => {
    return apiClient.post(`/agents/verifications/${data.requestId}/process`, {
      status: data.status,
      notes: data.notes,
    });
  },

  logCashDeposit: (data: {
    userId: string;
    amount: number;
    phoneNumber: string;
    notes?: string;
  }) => {
    return apiClient.post('/agents/cash-deposits', data);
  },

  updateLocation: (data: {
    state: string;
    city: string;
    address: string;
  }) => {
    return apiClient.patch('/agents/me/location', data);
  },

  getCoinInventory: () => {
    return apiClient.get('/agents/coins/inventory');
  },

  requestCoins: (data: {
    quantity: number;
    cryptoType: 'BTC' | 'USDT' | 'ETH';
    txHash: string;
  }) => {
    return apiClient.post('/agents/coins/purchase', data);
  },
};
```

---

### **5. Fix agentSlice (1 hour)**

**Update:** `src/store/slices/agentSlice.ts`

**Delete lines 4-51** (all mock data)

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent, VerificationRequest } from '../../types';
import { agentAPI } from '../../api/agent';

// ... rest remains same until async thunks

export const fetchAgentData = createAsyncThunk(
  'agent/fetchData',
  async (userId: string) => {
    const res = await agentAPI.getDashboard();
    return res.data;
  }
);

export const processVerificationRequest = createAsyncThunk(
  'agent/processVerification',
  async ({ requestId, status, notes }: { 
    requestId: string; 
    status: 'approved' | 'rejected'; 
    notes?: string;
  }) => {
    const res = await agentAPI.processVerification({ requestId, status, notes });
    return res.data;
  }
);

export const logCashDeposit = createAsyncThunk(
  'agent/logCashDeposit',
  async (depositData: {
    userId: string;
    amount: number;
    phoneNumber: string;
    notes?: string;
  }) => {
    const res = await agentAPI.logCashDeposit(depositData);
    return res.data;
  }
);

export const updateAgentLocation = createAsyncThunk(
  'agent/updateLocation',
  async (location: { state: string; city: string; address: string }) => {
    const res = await agentAPI.updateLocation(location);
    return res.data;
  }
);
```

---

### **6. Add Offline Detection (30 minutes)**

**Create:** `src/hooks/useNetworkStatus.ts`

```typescript
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { showToast } from '../components/common/Toast';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      
      if (!connected) {
        showToast('No internet connection', 'error');
      } else if (connected && !isConnected) {
        showToast('Back online', 'success');
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  return { isConnected };
};
```

**Use in App.tsx:**

```typescript
import { useNetworkStatus } from './hooks/useNetworkStatus';

function App() {
  const { isConnected } = useNetworkStatus();
  
  // Rest of app
}
```

---

### **7. Add Form Validation Helper (1 hour)**

**Create:** `src/utils/validation.ts`

```typescript
export const validators = {
  phoneNumber: (value: string): string | null => {
    if (!value) return 'Phone number is required';
    if (!/^\+234\d{10}$/.test(value)) {
      return 'Phone must be +234 followed by 10 digits';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
  },

  amount: (value: string, min: number = 100, max: number = 1000000): string | null => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'Invalid amount';
    if (num < min) return `Minimum amount is ₦${min.toLocaleString()}`;
    if (num > max) return `Maximum amount is ₦${max.toLocaleString()}`;
    return null;
  },

  accountNumber: (value: string): string | null => {
    if (!value) return 'Account number is required';
    if (!/^\d{10}$/.test(value)) return 'Account number must be 10 digits';
    return null;
  },

  otp: (value: string): string | null => {
    if (!value) return 'OTP is required';
    if (!/^\d{6}$/.test(value)) return 'OTP must be 6 digits';
    return null;
  },
};

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field: string, value: string, validator: (v: string) => string | null) => {
    const error = validator(value);
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
    });
    return !error;
  };

  const validateAll = (
    fields: Record<string, { value: string; validator: (v: string) => string | null }>
  ): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(fields).forEach(([field, { value, validator }]) => {
      const error = validator(value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => setErrors({});

  return { errors, validate, validateAll, clearErrors };
};
```

---

### **8. Add Input Validation to LoginScreen (30 minutes)**

**Update:** `src/screens/auth/LoginScreen.tsx`

```typescript
import { useFormValidation, validators } from '../../utils/validation';

const LoginScreen: React.FC = () => {
  const { errors, validate, validateAll } = useFormValidation();
  
  const handleLogin = async () => {
    const isValid = validateAll({
      phoneNumber: { value: phoneNumber, validator: validators.phoneNumber },
      password: { value: password, validator: validators.password },
    });
    
    if (!isValid) {
      showToast('Please fix the errors', 'error');
      return;
    }
    
    // ... rest of login logic
  };
  
  return (
    // ...
    <TextInput
      value={phoneNumber}
      onChangeText={(text) => {
        setPhoneNumber(text);
        validate('phoneNumber', text, validators.phoneNumber);
      }}
      placeholder="+234XXXXXXXXXX"
    />
    {errors.phoneNumber && (
      <InlineError message={errors.phoneNumber} />
    )}
    
    <TextInput
      value={password}
      onChangeText={(text) => {
        setPassword(text);
        validate('password', text, validators.password);
      }}
      secureTextEntry
    />
    {errors.password && (
      <InlineError message={errors.password} />
    )}
  );
};
```

---

### **9. Test Everything (1 hour)**

**Checklist:**
- [ ] App connects to backend (not localhost)
- [ ] Login fails with invalid credentials (no mock fallback)
- [ ] Login succeeds with valid credentials
- [ ] Shows offline message when network is off
- [ ] Form validation shows errors
- [ ] Form validation prevents invalid submission
- [ ] Agent dashboard shows real data (or error if not agent)
- [ ] Marketplace shows real items (or error)
- [ ] Transactions show real data

---

## 🎯 **SUCCESS CRITERIA**

After completing these fixes:

✅ No mock data in production code  
✅ Environment variables configured  
✅ App works with real backend  
✅ Offline detection working  
✅ Form validation on all auth screens  
✅ Agent functionality uses real APIs  
✅ Clear error messages when API fails  

---

## 📝 **TESTING COMMANDS**

```bash
# Start with development environment
ENVFILE=.env.development npm start

# Test with staging
ENVFILE=.env.staging npm start

# Build for production
ENVFILE=.env.production npm run build
```

---

## ⚠️ **IMPORTANT NOTES**

1. **DO NOT commit .env files** (they're in .gitignore)
2. **DO commit .env.example** (template for team)
3. **Test on both iOS and Android**
4. **Test offline mode**
5. **Verify no console errors**

---

## 🚀 **NEXT STEPS (After These Fixes)**

Tomorrow:
1. Build CoinPurchaseScreen
2. Build LeaderboardScreen
3. Build ReferralScreen

This Week:
1. Add KeyboardAvoidingView to all forms
2. Add haptic feedback
3. Add success animations

Next Week:
1. Add empty states
2. Add loading skeletons
3. Polish UI/UX

---

**Estimated Time:** 6-8 hours  
**Break it down:** 2 hours → lunch → 2 hours → break → 2-4 hours

**START NOW!** 🚀
