import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

// Encryption storage for Zustand
const encryptedStorage = {
  getItem: (name) => {
    const encryptedValue = localStorage.getItem(name);
    if (!encryptedValue) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, process.env.NEXT_PUBLIC_SECRET_REDUX_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt storage:', error);
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, process.env.NEXT_PUBLIC_SECRET_REDUX_KEY).toString();
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error('Failed to encrypt storage:', error);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

// Auth store with improved tokenization
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenExpiry: null,
      refreshTokenExpiry: null,

      // Actions
      setUser: (userData) => {
        set({
          user: userData,
          isAuthenticated: !!userData,
          error: null,
        });
      },

      updateProfile: (profileData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...profileData },
          });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setTokenExpiry: (expiry) => {
        set({ tokenExpiry: expiry });
      },

      setRefreshTokenExpiry: (expiry) => {
        set({ refreshTokenExpiry: expiry });
      },

      // Check if token is expired or about to expire (within 5 minutes)
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        
        const now = Date.now();
        const expiryTime = new Date(tokenExpiry).getTime();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        return now >= (expiryTime - fiveMinutes);
      },

      // Check if refresh token is expired
      isRefreshTokenExpired: () => {
        const { refreshTokenExpiry } = get();
        if (!refreshTokenExpiry) return true;
        
        const now = Date.now();
        const expiryTime = new Date(refreshTokenExpiry).getTime();
        
        return now >= expiryTime;
      },

      // Login action
      login: async (userData, tokenExpiry, refreshTokenExpiry) => {
        set({
          user: userData,
          isAuthenticated: true,
          tokenExpiry,
          refreshTokenExpiry,
          error: null,
        });
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          tokenExpiry: null,
          refreshTokenExpiry: null,
          error: null,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset store
      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          tokenExpiry: null,
          refreshTokenExpiry: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tokenExpiry: state.tokenExpiry,
        refreshTokenExpiry: state.refreshTokenExpiry,
      }),
    }
  )
);

// Selectors for easy access
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);