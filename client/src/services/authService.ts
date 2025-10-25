import api from './api';
import { LoginRequestDTO, LoginResponseDTO, UserRegisterDTO, ResponseDTO } from '../types';

export const authService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    const response = await api.post<LoginResponseDTO>('/users/auth', credentials);
    return response.data;
  },

  async register(userData: UserRegisterDTO): Promise<ResponseDTO<string>> {
    const response = await api.post<ResponseDTO<string>>('/users/register', userData);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<ResponseDTO<string>> {
    const response = await api.post<ResponseDTO<string>>('/users/password-reset/request', { email });
    return response.data;
  },

  async resetPassword(data: { email: string; token: string; newPassword: string }): Promise<ResponseDTO<string>> {
    const response = await api.post<ResponseDTO<string>>('/users/password-reset/confirm', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },
};
