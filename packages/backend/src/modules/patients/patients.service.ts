import { PatientsRepository } from './patients.repository';
import { AppError } from '../../utils/AppError';
import { ERROR_MESSAGES, Patient, CreatePatientDto, UpdatePatientDto, CONFIG } from '@dental-clinic/shared';

export class PatientsService {
  private repository = new PatientsRepository();

  async createPatient(userId: string, data: CreatePatientDto): Promise<Patient> {
    return this.repository.create(userId, data);
  }

  async getPatients(userId: string, page: number, limit: number) {
    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), CONFIG.MAX_LIMIT);

    const { patients, total } = await this.repository.findAllByUser(
      userId,
      validPage,
      validLimit
    );

    const totalPages = Math.ceil(total / validLimit);

    return {
      patients,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        total_pages: totalPages,
      },
    };
  }

  async getPatientById(patientId: string, userId: string): Promise<Patient> {
    const patient = await this.repository.findById(patientId);

    if (!patient) {
      throw new AppError(ERROR_MESSAGES.PATIENT_NOT_FOUND, 404);
    }

    // Check ownership
    if (patient.user_id !== userId) {
      throw new AppError(ERROR_MESSAGES.PATIENT_ACCESS_DENIED, 403);
    }

    return patient;
  }

  async updatePatient(
    patientId: string,
    userId: string,
    data: UpdatePatientDto
  ): Promise<Patient> {
    // Check ownership first
    const hasAccess = await this.repository.checkOwnership(patientId, userId);

    if (!hasAccess) {
      throw new AppError(ERROR_MESSAGES.PATIENT_NOT_FOUND, 404);
    }

    return this.repository.update(patientId, data);
  }

  async deletePatient(patientId: string, userId: string): Promise<void> {
    // Check ownership first
    const hasAccess = await this.repository.checkOwnership(patientId, userId);

    if (!hasAccess) {
      throw new AppError(ERROR_MESSAGES.PATIENT_NOT_FOUND, 404);
    }

    await this.repository.delete(patientId);
  }
}
