import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from './patients.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createPatientSchema,
  updatePatientSchema,
  paginationSchema,
} from '@dental-clinic/shared';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

router.post('/', validateBody(createPatientSchema), createPatient);
router.get('/', validateQuery(paginationSchema), getPatients);
router.get('/:id', getPatientById);
router.put('/:id', validateBody(updatePatientSchema), updatePatient);
router.delete('/:id', deletePatient);

export default router;
