import { apiClient } from './client';
import {
  API_ROUTES,
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PaginatedResponse,
  ApiResponse,
} from '@dental-clinic/shared';

export const patientService = {
  async createPatient(data: CreatePatientDto): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<Patient>>(
      API_ROUTES.PATIENTS.BASE,
      data
    );
    return response.data.data!;
  },

  async getPatients(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Patient>> {
    const response = await apiClient.get<PaginatedResponse<Patient>>(
      API_ROUTES.PATIENTS.BASE,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(
      API_ROUTES.PATIENTS.BY_ID(id)
    );
    return response.data.data!;
  },

  async updatePatient(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<Patient>>(
      API_ROUTES.PATIENTS.BY_ID(id),
      data
    );
    return response.data.data!;
  },

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.PATIENTS.BY_ID(id));
  },
};
