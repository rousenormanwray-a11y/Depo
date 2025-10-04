import { TextStyle } from 'react-native';

export const typography = {
  // Font Family
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  
  // Line Heights
  lineHeight: {
    xs: 14,
    sm: 16,
    base: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 44,
  },
  
  // Text Styles
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  
  bodyRegular: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Medium',
    fontWeight: '500' as TextStyle['fontWeight'],
  },
};

export type Typography = typeof typography;