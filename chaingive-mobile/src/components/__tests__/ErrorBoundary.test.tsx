import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC = () => {
  throw new Error('Test error');
};

// Component that works fine
const WorkingComponent: React.FC = () => {
  return <Text>Working</Text>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Working')).toBeTruthy();
  });

  it('should render fallback UI when there is an error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText(/Oops! Something went wrong/i)).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should render custom fallback component when provided', () => {
    const CustomFallback = () => <Text>Custom Error UI</Text>;

    const { getByText } = render(
      <ErrorBoundary fallbackComponent={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Custom Error UI')).toBeTruthy();
  });
});
