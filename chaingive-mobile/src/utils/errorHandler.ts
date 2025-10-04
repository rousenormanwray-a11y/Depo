import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  action?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Log error for debugging and analytics
  logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // In production, send to analytics service
    if (__DEV__) {
      console.error('App Error:', error);
    }
  }

  // Handle network errors
  handleNetworkError(error: any, action?: string): AppError {
    let message = 'Network connection failed';
    let code = 'NETWORK_ERROR';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      switch (status) {
        case 400:
          message = 'Invalid request. Please check your input.';
          code = 'BAD_REQUEST';
          break;
        case 401:
          message = 'Authentication failed. Please log in again.';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = 'Access denied. You don\'t have permission for this action.';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = 'The requested resource was not found.';
          code = 'NOT_FOUND';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          code = 'RATE_LIMITED';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          code = 'SERVER_ERROR';
          break;
        default:
          message = `Server error (${status}). Please try again.`;
          code = 'HTTP_ERROR';
      }
    } else if (error.request) {
      // Network request failed
      message = 'No internet connection. Please check your network.';
      code = 'NO_NETWORK';
    }

    const appError: AppError = {
      code,
      message,
      details: error,
      timestamp: new Date(),
      action,
    };

    this.logError(appError);
    return appError;
  }

  // Handle validation errors
  handleValidationError(field: string, value: any, rule: string): AppError {
    let message = `Invalid ${field}`;
    
    switch (rule) {
      case 'required':
        message = `${field} is required`;
        break;
      case 'email':
        message = 'Please enter a valid email address';
        break;
      case 'phone':
        message = 'Please enter a valid phone number';
        break;
      case 'minLength':
        message = `${field} must be at least ${value} characters`;
        break;
      case 'maxLength':
        message = `${field} must not exceed ${value} characters`;
        break;
      case 'numeric':
        message = `${field} must be a number`;
        break;
      case 'positive':
        message = `${field} must be a positive number`;
        break;
    }

    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message,
      details: { field, value, rule },
      timestamp: new Date(),
    };

    this.logError(appError);
    return appError;
  }

  // Handle authentication errors
  handleAuthError(error: any): AppError {
    let message = 'Authentication failed';
    let code = 'AUTH_ERROR';

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          code = 'USER_NOT_FOUND';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          code = 'WRONG_PASSWORD';
          break;
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          code = 'EMAIL_IN_USE';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak';
          code = 'WEAK_PASSWORD';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          code = 'INVALID_EMAIL';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          code = 'TOO_MANY_REQUESTS';
          break;
      }
    }

    const appError: AppError = {
      code,
      message,
      details: error,
      timestamp: new Date(),
      action: 'authentication',
    };

    this.logError(appError);
    return appError;
  }

  // Handle payment/transaction errors
  handlePaymentError(error: any): AppError {
    let message = 'Payment failed';
    let code = 'PAYMENT_ERROR';

    if (error.code) {
      switch (error.code) {
        case 'insufficient_funds':
          message = 'Insufficient funds in your account';
          code = 'INSUFFICIENT_FUNDS';
          break;
        case 'card_declined':
          message = 'Your card was declined';
          code = 'CARD_DECLINED';
          break;
        case 'expired_card':
          message = 'Your card has expired';
          code = 'EXPIRED_CARD';
          break;
        case 'invalid_card':
          message = 'Invalid card details';
          code = 'INVALID_CARD';
          break;
        case 'transaction_limit':
          message = 'Transaction limit exceeded';
          code = 'TRANSACTION_LIMIT';
          break;
      }
    }

    const appError: AppError = {
      code,
      message,
      details: error,
      timestamp: new Date(),
      action: 'payment',
    };

    this.logError(appError);
    return appError;
  }

  // Show user-friendly error alert
  showErrorAlert(error: AppError, onRetry?: () => void): void {
    const buttons: any[] = [{ text: 'OK', style: 'default' }];
    
    if (onRetry) {
      buttons.unshift({ text: 'Retry', onPress: onRetry });
    }

    Alert.alert(
      'Error',
      error.message,
      buttons,
      { cancelable: true }
    );
  }

  // Get error logs for debugging
  getErrorLogs(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error logs
  clearErrorLogs(): void {
    this.errorLog = [];
  }

  // Handle generic errors
  handleGenericError(error: any, action?: string): AppError {
    let message = 'An unexpected error occurred';
    let code = 'GENERIC_ERROR';

    if (error.message) {
      message = error.message;
    }

    if (error.code) {
      code = error.code;
    }

    const appError: AppError = {
      code,
      message,
      details: error,
      timestamp: new Date(),
      action,
    };

    this.logError(appError);
    return appError;
  }
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};

export const validatePositive = (value: number): boolean => {
  return value > 0;
};

// Error boundary helper
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return class extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleGenericError(error, 'component_error');
    }

    render() {
      if (this.state.hasError) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Something went wrong. Please restart the app.</Text>
          </View>
        );
      }

      return <Component {...this.props} />;
    }
  };
};

export default ErrorHandler;