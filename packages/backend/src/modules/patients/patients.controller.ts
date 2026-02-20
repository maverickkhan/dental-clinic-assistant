import { Response } from 'express';
import { PatientsService } from './patients.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CreatePatientDto, UpdatePatientDto } from '@dental-clinic/shared';

const patientsService = new PatientsService();

export const createPatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const data: CreatePatientDto = req.body;

  const patient = await patientsService.createPatient(userId, data);

  res.status(201).json({
    success: true,
    data: patient,
  });
});

export const getPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { page = 1, limit = 10 } = req.query as any;

  const result = await patientsService.getPatients(userId, Number(page), Number(limit));

  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
});

export const getPatientById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const patient = await patientsService.getPatientById(id, userId);

  res.status(200).json({
    success: true,
    data: patient,
  });
});

export const updatePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  const data: UpdatePatientDto = req.body;

  const patient = await patientsService.updatePatient(id, userId, data);

  res.status(200).json({
    success: true,
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  await patientsService.deletePatient(id, userId);

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully',
  });
});
