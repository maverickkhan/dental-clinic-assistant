// Auth validation
export { loginSchema, registerSchema } from './auth.schemas';
export type { LoginSchema, RegisterSchema } from './auth.schemas';

// Patient validation
export {
  createPatientSchema,
  updatePatientSchema,
  paginationSchema,
} from './patient.schemas';
export type {
  CreatePatientSchema,
  UpdatePatientSchema,
  PaginationSchema,
} from './patient.schemas';

// Chat validation
export { sendMessageSchema } from './chat.schemas';
export type { SendMessageSchema } from './chat.schemas';
