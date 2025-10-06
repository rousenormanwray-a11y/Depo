import { useState } from 'react';

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

  required: (value: string): string | null => {
    if (!value || value.trim() === '') return 'This field is required';
    return null;
  },

  minLength: (min: number) => (value: string): string | null => {
    if (!value) return 'This field is required';
    if (value.length < min) return `Minimum length is ${min} characters`;
    return null;
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (value && value.length > max) return `Maximum length is ${max} characters`;
    return null;
  },
};

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (
    field: string, 
    value: string, 
    validator: (v: string) => string | null
  ): boolean => {
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

  const clearError = (field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  return { 
    errors, 
    validate, 
    validateAll, 
    clearErrors, 
    clearError 
  };
};
