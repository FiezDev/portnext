'use client';

import { Suspense, ReactNode, Component, ErrorInfo } from 'react';

interface State { hasError: boolean }

class TextureErrorBoundary extends Component<{ children: ReactNode; name?: string }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[v2 scene${this.props.name ? `:${this.props.name}` : ''}] render error:`, error.message, info.componentStack);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export const SceneBoundary = ({ children, name }: { children: ReactNode; name?: string }) => (
  <TextureErrorBoundary name={name}>
    <Suspense fallback={null}>{children}</Suspense>
  </TextureErrorBoundary>
);
