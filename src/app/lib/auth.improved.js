import { useAuthStore } from '../store/auth.store';

// Client-side auth utilities (no JWT operations)

// Generate API access token (for external APIs) - Client-side version
export const generateApiAccessToken = async () => {
  try {
    const response = await fetch('/api/generate-api-token', {
      cache: "no-store",
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to generate API token');
    }

    const data = await response.json();
    return data.success ? data.token : null;
  } catch (error) {
    console.error('Error generating API access token:', error);
    return null;
  }
};

// Auto refresh token functionality
export const setupTokenRefresh = () => {
  const { isTokenExpired, isRefreshTokenExpired, logout } = useAuthStore.getState();
  
  // Check token status every minute
  const interval = setInterval(async () => {
    const state = useAuthStore.getState();
    
    if (!state.isAuthenticated) {
      clearInterval(interval);
      return;
    }

    // If refresh token is expired, logout
    if (state.isRefreshTokenExpired()) {
      console.log('Refresh token expired, logging out...');
      logout();
      clearInterval(interval);
      return;
    }

    // If access token is expired or about to expire, refresh it
    if (state.isTokenExpired()) {
      console.log('Access token expired, refreshing...');
      try {
        const response = await fetch('/api/administrator/user/refresh', {
          cache: "no-store",
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          state.setTokenExpiry(data.tokenExpiry);
          console.log('Token refreshed successfully');
        } else {
          console.error('Token refresh failed');
          logout();
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
        clearInterval(interval);
      }
    }
  }, 60000); // Check every minute

  return interval;
};

// Initialize token refresh on app start
let refreshInterval = null;

export const initializeTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    refreshInterval = setupTokenRefresh();
  }
};

// Stop token refresh
export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Legacy support - keep existing functions for backward compatibility
export const generateJwtToken = () => {
  return generateApiAccessToken();
};

export const genrateApiAccessToken = () => {
  return generateApiAccessToken();
};