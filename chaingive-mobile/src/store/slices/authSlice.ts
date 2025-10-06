import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../api/auth';
import { walletAPI } from '../../api/wallet';

// Mock user data
const mockUser: User = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+2348012345678',
  tier: 'Tier 1',
  trustScore: 85,
  isAgent: false,
  isVerified: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
// For compatibility with existing screens using loginUser
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email?: string; phoneNumber?: string; password: string }) => {
    try {
      const res = await authAPI.login(credentials as any);
      const data: any = res.data;
      const token: string = data.token || 'mock-jwt-token-' + Date.now();
      await AsyncStorage.setItem('auth_token', token);
      return { user: data.user as User, token };
    } catch (_err) {
      // Graceful fallback to mock
      await new Promise((r) => setTimeout(r, 800));
      const token = 'mock-jwt-token-' + Date.now();
      await AsyncStorage.setItem('auth_token', token);
      return {
        user: {
          ...mockUser,
          email: credentials.email || mockUser.email,
          phoneNumber: credentials.phoneNumber || mockUser.phoneNumber,
        },
        token,
      };
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
  }) => {
    try {
      const res = await authAPI.register(userData as any);
      const data: any = res.data;
      const token: string = data.token || 'mock-jwt-token-' + Date.now();
      await AsyncStorage.setItem('auth_token', token);
      return { user: data.user as User, token };
    } catch (_err) {
      await new Promise((r) => setTimeout(r, 2000));
      const newUser: User = {
        ...mockUser,
        id: 'new-user-' + Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const token = 'mock-jwt-token-' + Date.now();
      await AsyncStorage.setItem('auth_token', token);
      return { user: newUser, token };
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
    try {
      const res = await authAPI.verifyOTP({ phoneNumber, otp });
      return res.data as { verified: boolean };
    } catch (_err) {
      await new Promise((r) => setTimeout(r, 1000));
      if (otp.length !== 6) {
        throw new Error('Invalid OTP code');
      }
      return { verified: true };
    }
  }
);

export const fetchUserBalance = createAsyncThunk(
  'auth/fetchUserBalance',
  async (userId: string) => {
    try {
      const res = await walletAPI.getBalance();
      const data: any = res.data || {};
      return {
        balance: Number(data.balance ?? Math.floor(Math.random() * 100000)),
        charityCoins: Number(data.charityCoins ?? Math.floor(Math.random() * 500)),
      } as Pick<User, 'balance' | 'charityCoins'>;
    } catch (_err) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        balance: Math.floor(Math.random() * 100000),
        charityCoins: Math.floor(Math.random() * 500),
      } as Pick<User, 'balance' | 'charityCoins'>;
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch (_err) {
      // ignore
    } finally {
      await AsyncStorage.removeItem('auth_token');
    }
    return {};
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login (loginUser)
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.isVerified = true;
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'OTP verification failed';
      })

      // Fetch user balance snapshot
      .addCase(fetchUserBalance.fulfilled, (state, action) => {
        if (state.user) {
          state.user.balance = action.payload.balance;
          state.user.charityCoins = action.payload.charityCoins;
        }
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;