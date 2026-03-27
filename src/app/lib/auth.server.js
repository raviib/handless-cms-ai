// Server-side only auth utilities
import jwt from 'jsonwebtoken';

// Generate access token (short-lived) - Server-side only
export const generateAccessToken = (payload = {}) => {
  try {
    return jwt.sign(
      { 
        ...payload,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY,
      { 
        expiresIn: '15m', // 15 minutes for access token
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    console.error('Error generating access token:', error);
    return null;
  }
};

// Generate refresh token (long-lived) - Server-side only
export const generateRefreshToken = (payload = {}) => {
  try {
    return jwt.sign(
      { 
        ...payload,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY,
      { 
        expiresIn: '7d', // 7 days for refresh token
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    console.error('Error generating refresh token:', error);
    return null;
  }
};

// Generate API access token (for external APIs) - Server-side only
export const generateApiAccessToken = () => {
  try {
    return jwt.sign(
      { 
        from: "Admin Dashboard",
        type: 'api',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.NEXT_PUBLIC_JWT_SECRET_KEY,
      { 
        expiresIn: '30s', // 30 seconds for API calls
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    console.error('Error generating API access token:', error);
    return null;
  }
};

// Verify token - Server-side only
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET_KEY);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Get token expiry date - Server-side only
export const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};