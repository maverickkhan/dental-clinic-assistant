import { Response } from 'express';
import { ChatService } from './chat.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SendMessageDto } from '@dental-clinic/shared';

const chatService = new ChatService();

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { patient_id, message }: SendMessageDto = req.body;

  const result = await chatService.sendMessage(patient_id, userId, message);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getChatHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { patientId } = req.params;

  const messages = await chatService.getChatHistory(patientId, userId);

  res.status(200).json({
    success: true,
    data: messages,
  });
});
