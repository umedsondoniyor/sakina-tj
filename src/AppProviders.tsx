import type { PropsWithChildren } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';

type AppProvidersProps = PropsWithChildren<{
  helmetContext?: Record<string, unknown>;
}>;

export default function AppProviders({ children, helmetContext }: AppProvidersProps) {
  const isBrowser = typeof window !== 'undefined';

  return (
    <HelmetProvider context={helmetContext}>
      <CartProvider>
        {isBrowser ? <Toaster position="top-right" /> : null}
        {children}
      </CartProvider>
    </HelmetProvider>
  );
}
