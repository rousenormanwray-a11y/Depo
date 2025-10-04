import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import ErrorHandler from '../../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    this.errorHandler.handleGenericError(error, 'component_error');

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Icon name="error-outline" size={64} color={colors.error} />
            </View>
            
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Don't worry, this has been logged and we'll fix it soon.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <Icon name="refresh" size={20} color={colors.white} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <View style={styles.debugContent}>
                  <Text style={styles.debugText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  debugContainer: {
    width: '100%',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  debugTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  debugContent: {
    backgroundColor: colors.white,
    borderRadius: 4,
    padding: spacing.sm,
  },
  debugText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ErrorBoundary;