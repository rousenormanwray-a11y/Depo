export const colors = {
  // Primary Colors
  primary: '#2E8B57',      // Growth Green
  secondary: '#1E90FF',    // Trust Blue
  tertiary: '#FFD700',     // Honor Gold
  
  // Status Colors
  success: '#28A745',      // Forest Green
  warning: '#FFC107',      // Amber
  error: '#DC3545',        // Crimson
  info: '#17A2B8',         // Teal
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#1A1D20',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
  },
  
  // Text Colors
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    tertiary: '#ADB5BD',
    inverse: '#FFFFFF',
  },
  
  // Border Colors
  border: {
    light: '#E9ECEF',
    medium: '#DEE2E6',
    dark: '#CED4DA',
  },
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Charity Coin Colors
  coin: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
  
  // Trust Score Colors
  trust: {
    excellent: '#28A745',  // 90-100
    good: '#17A2B8',       // 70-89
    fair: '#FFC107',       // 50-69
    poor: '#DC3545',       // 0-49
  },
};

export type Colors = typeof colors;