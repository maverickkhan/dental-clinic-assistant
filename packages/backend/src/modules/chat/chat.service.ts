import { ChatRepository } from './chat.repository';
import { PatientsRepository } from '../patients/patients.repository';
import { AIClientService } from './ai-client.service';
import { AppError } from '../../utils/AppError';
import { ERROR_MESSAGES, ChatResponse, ChatMessage } from '@dental-clinic/shared';

export class ChatService {
  private chatRepository = new ChatRepository();
  private patientsRepository = new PatientsRepository();
  private aiService = new AIClientService();

  async sendMessage(
    patientId: string,
    userId: string,
    message: string
  ): Promise<ChatResponse> {
    // Verify patient exists and user has access
    const patient = await this.patientsRepository.findById(patientId);

    if (!patient) {
      throw new AppError(ERROR_MESSAGES.PATIENT_NOT_FOUND, 404);
    }

    if (patient.user_id !== userId) {
      throw new AppError(ERROR_MESSAGES.PATIENT_ACCESS_DENIED, 403);
    }

    // Get chat history for context
    const chatHistory = await this.chatRepository.getRecentMessages(patientId, 5);

    // Generate AI response using Python microservice
    const aiResult = await this.aiService.generateResponse(
      message,
      patient.name,
      patient.medical_notes,
      chatHistory
    );

    const assistantResponse = aiResult.response;
    const metadata = aiResult.metadata;

    // Save user message
    const userMessage = await this.chatRepository.createMessage(
      patientId,
      userId,
      'user',
      message
    );

    // Save assistant response
    const assistantMessage = await this.chatRepository.createMessage(
      patientId,
      userId,
      'assistant',
      assistantResponse,
      metadata
    );

    return {
      user_message: userMessage,
      assistant_message: assistantMessage,
    };
  }

  async getChatHistory(patientId: string, userId: string): Promise<ChatMessage[]> {
    // Verify patient exists and user has access
    const patient = await this.patientsRepository.findById(patientId);

    if (!patient) {
      throw new AppError(ERROR_MESSAGES.PATIENT_NOT_FOUND, 404);
    }

    if (patient.user_id !== userId) {
      throw new AppError(ERROR_MESSAGES.PATIENT_ACCESS_DENIED, 403);
    }

    return this.chatRepository.getMessagesByPatient(patientId);
  }
}
