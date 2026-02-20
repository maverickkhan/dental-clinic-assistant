import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  medical_notes: z.string().optional().or(z.literal('')),
});

export const updatePatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  medical_notes: z.string().optional().or(z.literal('')),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreatePatientSchema = z.infer<typeof createPatientSchema>;
export type UpdatePatientSchema = z.infer<typeof updatePatientSchema>;
export type PaginationSchema = z.infer<typeof paginationSchema>;
