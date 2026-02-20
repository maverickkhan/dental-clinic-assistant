import { prisma } from '../../lib/prisma';
import { ChatMessage } from '@dental-clinic/shared';

export class ChatRepository {
  async createMessage(
    patientId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata: any = null
  ): Promise<ChatMessage> {
    const message = await prisma.chatMessage.create({
      data: {
        patientId,
        userId,
        role,
        content,
        metadata: metadata || null,
      },
    });

    // Map camelCase to snake_case for response
    return {
      id: message.id,
      patient_id: message.patientId,
      user_id: message.userId,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      metadata: message.metadata as Record<string, any> | null,
      created_at: message.createdAt.toISOString(),
    };
  }

  async getMessagesByPatient(patientId: string): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'asc' },
    });

    // Map camelCase to snake_case for response
    return messages.map((msg) => ({
      id: msg.id,
      patient_id: msg.patientId,
      user_id: msg.userId,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      metadata: msg.metadata as Record<string, any> | null,
      created_at: msg.createdAt.toISOString(),
    }));
  }

  async getRecentMessages(patientId: string, limit: number = 10): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Reverse to get chronological order and map to snake_case
    return messages.reverse().map((msg) => ({
      id: msg.id,
      patient_id: msg.patientId,
      user_id: msg.userId,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      metadata: msg.metadata as Record<string, any> | null,
      created_at: msg.createdAt.toISOString(),
    }));
  }
}
