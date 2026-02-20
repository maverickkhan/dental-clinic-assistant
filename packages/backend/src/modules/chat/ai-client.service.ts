import axios from 'axios';
import { ChatMessage } from '@dental-clinic/shared';
import { AppError } from '../../utils/AppError';

/**
 * OPTION 1: REST API Client
 *
 * Simple HTTP client for communicating with Python AI microservice.
 * Synchronous request/response pattern.
 */

interface AIServiceRequest {
  message: string;
  patient_name: string;
  medical_notes: string | null;
  chat_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface AIServiceResponse {
  response: string;
  metadata: any;
  emergency_detected: boolean;
}

export class AIClientService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // AI service URL from environment (e.g., http://localhost:8001)
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds timeout
  }

  /**
   * Generate AI response by calling Python microservice via REST API
   */
  async generateResponse(
    message: string,
    patientName: string,
    medicalNotes: string | null,
    chatHistory: ChatMessage[]
  ): Promise<{ response: string; metadata: any }> {
    try {
      // Transform chat history to AI service format
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Prepare request
      const requestData: AIServiceRequest = {
        message,
        patient_name: patientName,
        medical_notes: medicalNotes,
        chat_history: formattedHistory,
      };

      // Call Python AI service
      const response = await axios.post<AIServiceResponse>(
        `${this.baseURL}/api/chat/generate`,
        requestData,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        response: response.data.response,
        metadata: {
          ...response.data.metadata,
          emergency_detected: response.data.emergency_detected,
          service: 'python-ai-microservice',
        },
      };
    } catch (error: any) {
      console.error('AI Service error:', error.message);

      // Handle specific errors
      if (error.code === 'ECONNREFUSED') {
        throw new AppError('AI service is unavailable. Please try again later.', 503);
      }

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new AppError('AI service request timed out. Please try again.', 504);
      }

      if (error.response?.status === 500) {
        throw new AppError(
          error.response.data?.detail || 'AI service encountered an error',
          500
        );
      }

      throw new AppError('Failed to generate AI response', 500);
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
