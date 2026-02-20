import { apiClient } from './client';
import {
  API_ROUTES,
  ChatMessage,
  ChatResponse,
  SendMessageDto,
  ApiResponse,
} from '@dental-clinic/shared';

interface StreamCallbacks {
  onUserMessage: (message: ChatMessage) => void;
  onChunk: (text: string) => void;
  onComplete: (message: ChatMessage) => void;
  onError: (error: string) => void;
}

export const chatService = {
  /**
   * Send message with streaming response (ChatGPT-like experience)
   */
  async sendMessageStream(
    data: SendMessageDto,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const token = localStorage.getItem('auth_token');

    // Use EventSource for Server-Sent Events
    const url = new URL(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1/chat/stream`
    );

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to chat service');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream not available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));

            if (data.type === 'user_message') {
              callbacks.onUserMessage(data.message);
            } else if (data.type === 'chunk') {
              callbacks.onChunk(data.text);
            } else if (data.type === 'emergency') {
              callbacks.onChunk(data.text);
            } else if (data.type === 'done') {
              callbacks.onComplete(data.message);
            } else if (data.type === 'error') {
              callbacks.onError(data.error);
            }
          }
        }
      }
    } catch (error: any) {
      callbacks.onError(error.message || 'Failed to send message');
    }
  },

  /**
   * Send message without streaming (original implementation)
   */
  async sendMessage(data: SendMessageDto): Promise<ChatResponse> {
    const response = await apiClient.post<ApiResponse<ChatResponse>>(
      API_ROUTES.CHAT.SEND,
      data
    );
    return response.data.data!;
  },

  async getChatHistory(patientId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
      API_ROUTES.CHAT.HISTORY(patientId)
    );
    return response.data.data!;
  },
};
