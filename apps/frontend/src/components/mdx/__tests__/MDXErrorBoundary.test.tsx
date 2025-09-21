import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MDXErrorBoundary, withMDXErrorBoundary } from '../MDXErrorBoundary';

// Component that throws an error
const ThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Component rendered successfully</div>;
};

// Custom error fallback component
const CustomErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div data-testid="custom-error">
    Custom error: {error?.message}
  </div>
);

describe('MDXErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <MDXErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </MDXErrorBoundary>
    );

    expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
  });

  it('renders default error fallback when component throws', () => {
    render(
      <MDXErrorBoundary>
        <ThrowingComponent />
      </MDXErrorBoundary>
    );

    expect(screen.getByText('MDX Component Error')).toBeInTheDocument();
    expect(screen.getByText('There was an error rendering this component.')).toBeInTheDocument();
  });

  it('renders custom error fallback when provided', () => {
    render(
      <MDXErrorBoundary fallback={CustomErrorFallback}>
        <ThrowingComponent />
      </MDXErrorBoundary>
    );

    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.getByText('Custom error: Test error message')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <MDXErrorBoundary>
        <ThrowingComponent />
      </MDXErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <MDXErrorBoundary>
        <ThrowingComponent />
      </MDXErrorBoundary>
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('withMDXErrorBoundary HOC', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('wraps component with error boundary', () => {
    const WrappedComponent = withMDXErrorBoundary(ThrowingComponent);

    render(<WrappedComponent shouldThrow={false} />);

    expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withMDXErrorBoundary(ThrowingComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('MDX Component Error')).toBeInTheDocument();
  });

  it('uses custom fallback when provided', () => {
    const WrappedComponent = withMDXErrorBoundary(ThrowingComponent, CustomErrorFallback);

    render(<WrappedComponent />);

    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
  });

  it('sets proper display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withMDXErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withMDXErrorBoundary(TestComponent)');
  });

  it('handles components without display name', () => {
    const TestComponent = () => <div>Test</div>;
    
    const WrappedComponent = withMDXErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withMDXErrorBoundary(TestComponent)');
  });
});