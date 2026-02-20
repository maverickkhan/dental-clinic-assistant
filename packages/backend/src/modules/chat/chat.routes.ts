import { Router } from 'express';
import { sendMessage, getChatHistory } from './chat.controller';
import { streamChatMessage } from './chat-streaming.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { chatLimiter } from '../../middleware/rateLimiter.middleware';
import { sendMessageSchema } from '@dental-clinic/shared';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// Non-streaming endpoint (original)
router.post('/', chatLimiter, validateBody(sendMessageSchema), sendMessage);

// Streaming endpoint (NEW - for real-time ChatGPT-like experience)
router.post('/stream', chatLimiter, validateBody(sendMessageSchema), streamChatMessage);

// Get chat history
router.get('/history/:patientId', getChatHistory);

export default router;
