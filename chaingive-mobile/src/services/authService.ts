import { apiClient, handleApiError } from './api';

export interface RegisterData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginData {
  phoneNumber: string;
  password: string;
}

export interface OTPData {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    tier: string;
    trustScore: number;
    isAgent: boolean;
    isVerified: boolean;
    balance?: number;
    charityCoins?: number;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Store tokens
      if (response.data.accessToken) {
        await apiClient.setToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        await apiClient.setRefreshToken(response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      
      // Store tokens
      if (response.data.accessToken) {
        await apiClient.setToken(response.data.accessToken);
      }
      if (response.data.refreshToken) {
        await apiClient.setRefreshToken(response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: OTPData): Promise<{ verified: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/verify-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(phoneNumber: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/resend-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(phoneNumber: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { phoneNumber });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: {
    phoneNumber: string;
    otp: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
