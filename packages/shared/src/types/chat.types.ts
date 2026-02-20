export interface ChatMessage {
  id: string;
  patient_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface SendMessageDto {
  patient_id: string;
  message: string;
}

export interface ChatResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}
