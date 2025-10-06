import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Use environment variable with fallback
const BASE_URL = API_BASE_URL || 'https://api.chaingive.ng/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased for slower networks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
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

// Response interceptor - Enhanced error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // TODO: Dispatch logout action to Redux
    }
    
    // Extract error message with better fallback chain
    const message = 
      (error.response as any)?.data?.error?.message || 
      (error.response as any)?.data?.message ||
      error.message || 
      'Request failed';
    
    return Promise.reject(new Error(message));
  }
);
