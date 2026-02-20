import { z } from 'zod';

export const sendMessageSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

export type SendMessageSchema = z.infer<typeof sendMessageSchema>;
