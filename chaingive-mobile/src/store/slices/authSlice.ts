import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { walletService } from '../../services/walletService';

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
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login({
      phoneNumber: credentials.email, // Can be email or phone
      password: credentials.password,
    });
    return response;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
    const response = await authService.verifyOTP({ phoneNumber, otp });
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

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      
      // Fetch Balance
      .addCase(fetchUserBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBalance.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.balance = action.payload.balance;
          state.user.charityCoins = action.payload.charityCoins;
        }
      })
      .addCase(fetchUserBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch balance';
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