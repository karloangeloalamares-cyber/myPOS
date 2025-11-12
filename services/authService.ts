import { User, AuthState } from '../types';

// Authentication Service - Handles user login/logout
// In production, this would connect to a backend API

interface AuthServiceInterface {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  verifyToken(token: string): Promise<boolean>;
  refreshToken(token: string): Promise<string>;
}

export const authService: AuthServiceInterface = {
  async login(email: string, password: string) {
    // TODO: Implement actual API call
    // POST /api/auth/login
    throw new Error('Not implemented - connect to backend');
  },

  async logout() {
    // TODO: Implement logout logic
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async verifyToken(token: string): Promise<boolean> {
    // TODO: Implement token verification
    // POST /api/auth/verify
    return false;
  },

  async refreshToken(token: string): Promise<string> {
    // TODO: Implement token refresh
    // POST /api/auth/refresh
    throw new Error('Not implemented');
  },
};
