import React, { useState, useEffect, useRef } from 'react';
import { Patient, ChatMessage as ChatMessageType } from '@dental-clinic/shared';
import { chatService } from '../../services/api/chat.service';
import { useToast } from '../../hooks/useToast';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ChatContainerProps {
  patient: Patient;
  onClose: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ patient, onClose }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, [patient.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(patient.id);
      setMessages(history);
    } catch (error: any) {
      showToast('error', 'Failed to load chat history');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Use streaming API for ChatGPT-like experience
      await chatService.sendMessageStream(
        {
          patient_id: patient.id,
          message,
        },
        {
          onUserMessage: (msg) => {
            // Add user message immediately
            setMessages((prev) => [...prev, msg]);
          },
          onChunk: (text) => {
            // Accumulate streaming text
            setStreamingMessage((prev) => prev + text);
            setIsStreaming(true);
          },
          onComplete: (assistantMsg) => {
            // Add complete assistant message
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamingMessage('');
            setIsStreaming(false);
          },
          onError: (error) => {
            showToast('error', error);
            setStreamingMessage('');
            setIsStreaming(false);
          },
        }
      );
    } catch (error: any) {
      showToast('error', error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Chat with {patient.name}
            </h2>
            <p className="text-sm text-gray-500">AI-powered dental assistant</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isFetching ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-500 mb-2">No messages yet</p>
                <p className="text-sm text-gray-400">
                  Start a conversation to get dental assistance
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {/* Streaming message (appears while AI is typing) */}
          {isStreaming && streamingMessage && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-purple-600">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-3 rounded-lg bg-gray-100 text-gray-900">
                  <p className="text-sm whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator (before streaming starts) */}
          {isLoading && !isStreaming && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-purple-600">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
