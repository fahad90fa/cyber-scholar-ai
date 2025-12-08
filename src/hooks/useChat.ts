import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { chatAPI } from '@/services/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isWarning?: boolean;
}

interface UseChatOptions {
  module?: string;
  userId?: string;
}

export function useChat(moduleContextOrOptions?: string | UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const options = typeof moduleContextOrOptions === 'string' 
    ? { module: moduleContextOrOptions } 
    : moduleContextOrOptions || {};

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response: any = await chatAPI.sendMessage(content.trim(), sessionId || undefined);
      
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      setMessages(prev => [...prev, {
        id: response.message?.id || crypto.randomUUID(),
        role: 'assistant',
        content: response.ai_response,
        timestamp: new Date(),
        isWarning: response.ai_response?.includes('EDUCATIONAL DISCLAIMER'),
      }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = error.message || 'Failed to send message';
      
      if (error.status === 403) {
        if (error.message?.includes('No tokens available')) {
          errorMessage = 'You\'ve used all your available tokens. Upgrade your plan or wait for your free tokens to reset on the 1st of the month.';
        } else if (error.message?.includes('subscription')) {
          errorMessage = 'An error occurred. Please try again or contact support.';
        }
        toast.error(errorMessage);
      } else if (error.status === 401) {
        errorMessage = 'Please log in to use chat functionality.';
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages, sessionId };
}
