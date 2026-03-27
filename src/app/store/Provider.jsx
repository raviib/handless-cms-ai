'use client';

import { useEffect } from 'react';
import { useAuthStore } from './auth.store';
import { initializeTokenRefresh, stopTokenRefresh } from '../lib/auth.improved';

export default function StoreProvider({ children }) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize token refresh when user is authenticated
    if (isAuthenticated) {
      initializeTokenRefresh();
    } else {
      stopTokenRefresh();
    }

    // Cleanup on unmount
    return () => {
      stopTokenRefresh();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}