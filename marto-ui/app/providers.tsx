'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { CartProvider } from '@/providers/CartContext';
import { SingleSellerModal } from '@/components/shared/SingleSellerModal';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { isApiNotAvailableError } from '@/lib/api/errors';

function AuthBootstrap() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if (isApiNotAvailableError(error)) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthBootstrap />
        {children}
        <SingleSellerModal />
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            className: 'font-sans',
          }}
        />
      </CartProvider>
    </QueryClientProvider>
  );
}
