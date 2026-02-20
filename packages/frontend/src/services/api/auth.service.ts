import { apiClient } from './client';
import { API_ROUTES, LoginDto, RegisterDto, AuthResponse, User, ApiResponse } from '@dental-clinic/shared';

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH.REGISTER,
      data
    );
    return response.data.data!;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH.LOGIN,
      data
    );
    return response.data.data!;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ROUTES.AUTH.ME
    );
    return response.data.data!;
  },
};
