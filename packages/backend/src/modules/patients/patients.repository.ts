import { prisma } from '../../lib/prisma';
import { Patient, CreatePatientDto, UpdatePatientDto } from '@dental-clinic/shared';

export class PatientsRepository {
  async create(userId: string, data: CreatePatientDto): Promise<Patient> {
    const patient = await prisma.patient.create({
      data: {
        userId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        medicalNotes: data.medical_notes || null,
      },
    });

    // Map camelCase to snake_case for response
    return {
      id: patient.id,
      user_id: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth?.toISOString() ?? null,
      medical_notes: patient.medicalNotes,
      created_at: patient.createdAt.toISOString(),
      updated_at: patient.updatedAt.toISOString(),
    };
  }

  async findAllByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ patients: Patient[]; total: number }> {
    const offset = (page - 1) * limit;

    // Get total count and patients in parallel
    const [total, patients] = await Promise.all([
      prisma.patient.count({
        where: { userId },
      }),
      prisma.patient.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    // Map camelCase to snake_case for response
    return {
      patients: patients.map((p) => ({
        id: p.id,
        user_id: p.userId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        date_of_birth: p.dateOfBirth?.toISOString() ?? null,
        medical_notes: p.medicalNotes,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      })),
      total,
    };
  }

  async findById(patientId: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) return null;

    // Map camelCase to snake_case for response
    return {
      id: patient.id,
      user_id: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth?.toISOString() ?? null,
      medical_notes: patient.medicalNotes,
      created_at: patient.createdAt.toISOString(),
      updated_at: patient.updatedAt.toISOString(),
    };
  }

  async update(patientId: string, data: UpdatePatientDto): Promise<Patient> {
    // Build update data object dynamically
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.date_of_birth !== undefined) {
      updateData.dateOfBirth = data.date_of_birth ? new Date(data.date_of_birth) : null;
    }
    if (data.medical_notes !== undefined) {
      updateData.medicalNotes = data.medical_notes || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: updateData,
    });

    // Map camelCase to snake_case for response
    return {
      id: patient.id,
      user_id: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth?.toISOString() ?? null,
      medical_notes: patient.medicalNotes,
      created_at: patient.createdAt.toISOString(),
      updated_at: patient.updatedAt.toISOString(),
    };
  }

  async delete(patientId: string): Promise<void> {
    await prisma.patient.delete({
      where: { id: patientId },
    });
  }

  async checkOwnership(patientId: string, userId: string): Promise<boolean> {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId,
      },
      select: { id: true },
    });

    return patient !== null;
  }
}
