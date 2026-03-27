"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/app/store/auth.store';
import { useRouter } from 'next/navigation';

const TokenRefreshHandler = () => {
  const { isAuthenticated, isRefreshTokenExpired, logout, setTokenExpiry } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // Check if we have a refresh token but no access token (or expired)
      const hasRefreshToken = document.cookie.includes('refreshToken=');
      const hasAccessToken = document.cookie.includes('token=');

      if (hasRefreshToken && !hasAccessToken && !isAuthenticated) {
        try {
          const response = await fetch('/api/administrator/user/refresh', {
            cache: "no-store",
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            
            // Update token expiry in store
            if (data.tokenExpiry) {
              setTokenExpiry(data.tokenExpiry);
            }

            // Redirect to dashboard if refresh was successful
            router.push('/admin/dashboard');
          } else {
            // Refresh failed, clear any remaining tokens
            logout();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      } else if (isRefreshTokenExpired()) {
        // Refresh token is expired, logout
        logout();
      }
    };

    // Only run this check on login page
    if (window.location.pathname === '/private/login') {
      checkAndRefreshToken();
    }
  }, [isAuthenticated, isRefreshTokenExpired, logout, setTokenExpiry, router]);

  return null; // This component doesn't render anything
};

export default TokenRefreshHandler;