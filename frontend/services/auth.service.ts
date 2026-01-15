import { api } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.post('/auth/profile', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};