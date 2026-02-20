import { Response } from 'express';
import axios from 'axios';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SendMessageDto } from '@dental-clinic/shared';
import { PatientsRepository } from '../patients/patients.repository';
import { ChatRepository } from './chat.repository';
import { AppError } from '../../utils/AppError';
import { ERROR_MESSAGES } from '@dental-clinic/shared';

const patientsRepository = new PatientsRepository();
const chatRepository = new ChatRepository();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Stream chat messages from Python AI service to frontend
 * Uses Server-Sent Events (SSE) for real-time streaming
 */
export const streamChatMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { patient_id, message }: SendMessageDto = req.body;

  // Verify patient access
  const patient = await patientsRepository.findById(patient_id);
  if (!patient) {
    throw new AppError(ERROR_MESSAGES.PATIENT_NOT_FOUND, 404);
  }
  if (patient.user_id !== userId) {
    throw new AppError(ERROR_MESSAGES.PATIENT_ACCESS_DENIED, 403);
  }

  // Get chat history
  const chatHistory = await chatRepository.getRecentMessages(patient_id, 5);
  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Save user message immediately
  const userMessage = await chatRepository.createMessage(
    patient_id,
    userId,
    'user',
    message
  );

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial event with user message
  res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMessage })}\n\n`);

  let fullAssistantResponse = '';
  let assistantMetadata: any = {};

  try {
    // Call Python AI service (non-streaming generate endpoint)
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/chat/generate`,
      {
        message,
        patient_name: patient.name,
        medical_notes: patient.medical_notes,
        chat_history: formattedHistory,
      },
      { timeout: 60000 }
    );

    const { response: responseText, metadata, emergency_detected } = aiResponse.data;

    if (emergency_detected) {
      fullAssistantResponse = responseText;
      assistantMetadata = { emergency_detected: true };
      res.write(`data: ${JSON.stringify({ type: 'emergency', text: responseText })}\n\n`);
    } else {
      // Simulate streaming by sending the response word-by-word
      const words = responseText.split(' ');
      for (const word of words) {
        const chunk = word + ' ';
        fullAssistantResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      assistantMetadata = metadata || {};
    }

    // Save assistant message to database
    const assistantMessage = await chatRepository.createMessage(
      patient_id,
      userId,
      'assistant',
      fullAssistantResponse,
      assistantMetadata
    );

    // Send completion event
    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        message: assistantMessage,
      })}\n\n`
    );

    res.end();
  } catch (error: any) {
    console.error('Streaming error:', error.message);

    // Send error event
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        error: 'Failed to generate AI response',
      })}\n\n`
    );

    res.end();
  }
});
