import React from 'react';
import { ChatMessage as ChatMessageType } from '@dental-clinic/shared';
import { formatDateTime } from '@dental-clinic/shared';
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 ${isUser ? 'text-primary-600' : 'text-purple-600'}`}>
        {isUser ? (
          <UserCircleIcon className="w-8 h-8" />
        ) : (
          <SparklesIcon className="w-8 h-8" />
        )}
      </div>

      <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDateTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};
