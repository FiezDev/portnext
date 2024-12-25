import { ReactNode, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import Fallback from './Fallback';

interface Props {
  children: ReactNode;
  text?: string;
  errorText?: string;
}

const SuspenseWrapper = ({ children, text, errorText }: Props) => {
  return (
    <ErrorBoundary errorText={errorText}>
      <Suspense fallback={<Fallback text={text} />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default SuspenseWrapper;
