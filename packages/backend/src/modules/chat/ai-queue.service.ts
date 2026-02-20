// import Redis from 'ioredis'; // Commented out - not using Redis queue for now
import { ChatMessage } from '@dental-clinic/shared';
import { AppError } from '../../utils/AppError';

/**
 * OPTION 2: Message Queue with Redis (NOT CURRENTLY USED - using REST API instead)
 *
 * Asynchronous communication using Redis as a message broker.
 * Better for handling slow AI responses and high load.
 *
 * Flow:
 * 1. Express publishes message to "ai_requests" queue
 * 2. Python service consumes from queue
 * 3. Python service publishes result to "ai_responses:{requestId}" queue
 * 4. Express polls for response
 */

interface AIQueueRequest {
  request_id: string;
  message: string;
  patient_name: string;
  medical_notes: string | null;
  chat_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface AIQueueResponse {
  request_id: string;
  response: string;
  metadata: any;
  emergency_detected: boolean;
  error?: string;
}

export class AIQueueService {
  private redis: any; // Redis - commented out, not currently used
  private requestTimeout: number;

  constructor() {
    // const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    // this.redis = new Redis(redisUrl); // Commented out - not using Redis
    this.redis = null; // Placeholder
    this.requestTimeout = 30000; // 30 seconds
  }

  /**
   * Generate AI response using message queue
   */
  async generateResponse(
    message: string,
    patientName: string,
    medicalNotes: string | null,
    chatHistory: ChatMessage[]
  ): Promise<{ response: string; metadata: any }> {
    const requestId = this.generateRequestId();

    try {
      // Transform chat history
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Prepare request
      const request: AIQueueRequest = {
        request_id: requestId,
        message,
        patient_name: patientName,
        medical_notes: medicalNotes,
        chat_history: formattedHistory,
      };

      // Publish to request queue
      await this.redis.lpush('ai_requests', JSON.stringify(request));

      // Wait for response with timeout
      const response = await this.waitForResponse(requestId);

      if (response.error) {
        throw new AppError(response.error, 500);
      }

      return {
        response: response.response,
        metadata: {
          ...response.metadata,
          emergency_detected: response.emergency_detected,
          service: 'python-ai-microservice-queue',
        },
      };
    } catch (error: any) {
      console.error('AI Queue error:', error.message);

      if (error.message === 'Request timeout') {
        throw new AppError('AI service request timed out. Please try again.', 504);
      }

      throw new AppError('Failed to generate AI response', 500);
    }
  }

  /**
   * Wait for AI response from queue
   */
  private async waitForResponse(requestId: string): Promise<AIQueueResponse> {
    const responseKey = `ai_responses:${requestId}`;
    const startTime = Date.now();

    while (Date.now() - startTime < this.requestTimeout) {
      // Check for response
      const result = await this.redis.rpop(responseKey);

      if (result) {
        // Clean up
        await this.redis.del(responseKey);
        return JSON.parse(result);
      }

      // Wait 100ms before checking again
      await this.sleep(100);
    }

    throw new Error('Request timeout');
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
