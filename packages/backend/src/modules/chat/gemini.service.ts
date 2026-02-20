import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { ERROR_MESSAGES, CONFIG, ChatMessage } from '@dental-clinic/shared';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new AppError('GEMINI_API_KEY is required when using embedded Gemini service', 500);
    }
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
    });
  }

  async generateResponse(
    userMessage: string,
    patientName: string,
    medicalNotes: string | null,
    chatHistory: ChatMessage[]
  ): Promise<{ response: string; metadata: any }> {
    try {
      // Build system prompt with patient context
      const systemPrompt = this.buildSystemPrompt(patientName, medicalNotes);

      // Build conversation history
      const conversationHistory = this.buildConversationHistory(chatHistory);

      // Combine prompt parts
      const fullPrompt = `${systemPrompt}\n\n${conversationHistory}\n\nUser: ${userMessage}\n\nAssistant:`;

      // Generate response
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: CONFIG.GEMINI_TEMPERATURE,
          maxOutputTokens: CONFIG.GEMINI_MAX_OUTPUT_TOKENS,
        },
      });

      const response = result.response;
      const text = response.text();

      // Extract metadata
      const metadata = {
        model: env.GEMINI_MODEL,
        finishReason: response.candidates?.[0]?.finishReason,
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };

      return {
        response: text.trim(),
        metadata,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);

      // Handle specific error cases
      if (error.message?.includes('API key')) {
        throw new AppError('AI service configuration error', 500);
      }

      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new AppError('AI service temporarily unavailable due to high demand', 503);
      }

      throw new AppError(ERROR_MESSAGES.AI_SERVICE_ERROR, 500);
    }
  }

  private buildSystemPrompt(patientName: string, medicalNotes: string | null): string {
    const truncatedNotes = medicalNotes
      ? medicalNotes.substring(0, CONFIG.MAX_MEDICAL_NOTES_CONTEXT)
      : 'No medical notes available';

    return `You are a knowledgeable and empathetic dental assistant AI helping clinic staff communicate with patients.

IMPORTANT GUIDELINES:
- Provide professional, concise (2-3 paragraphs max), non-technical responses
- Focus on dental procedures, care instructions, and general dental health questions
- Use simple, patient-friendly language
- Be warm, empathetic, and reassuring
- NEVER diagnose medical conditions or prescribe treatments
- NEVER provide specific medical advice - always defer to the dentist
- For emergencies (severe pain, bleeding, trauma), advise immediate contact with clinic or emergency services
- If unsure, recommend scheduling an appointment with the dentist

PATIENT CONTEXT:
- Patient Name: ${patientName}
- Medical Notes: ${truncatedNotes}

Remember: You are assisting clinic staff in communicating with patients, not replacing professional dental advice.`;
  }

  private buildConversationHistory(chatHistory: ChatMessage[]): string {
    if (chatHistory.length === 0) {
      return '';
    }

    // Get last N messages for context
    const recentMessages = chatHistory.slice(-CONFIG.MAX_CHAT_HISTORY);

    return recentMessages
      .map((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');
  }

  async detectEmergency(message: string): Promise<boolean> {
    const emergencyKeywords = [
      'severe pain',
      'bleeding',
      'swollen',
      'emergency',
      'accident',
      'broken tooth',
      'knocked out',
      'unbearable',
      'can\'t eat',
      'can\'t sleep',
      'infection',
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some((keyword) => lowerMessage.includes(keyword));
  }
}
