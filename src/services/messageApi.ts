import { apiRequest } from './api';

export interface ChatConversationItem {
  conversationId: string;
  partner: {
    id: string;
    name: string;
    primaryPhoto: string | null;
    isOnline: boolean;
    trustScore?: {
      totalScore: number;
    };
  };
  lastMessage: {
    id: string;
    content: string | null;
    senderId: string;
    messageType: string;
    createdAt: string;
    isOwnMessage: boolean;
  } | null;
  unreadCount: number;
  lastActivityAt: string;
  isMatched: boolean;
  messagesRemaining: number | null;
}

export interface SingleChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  messageType: 'text' | 'image' | 'audio' | 'system';
  mediaUrl?: string | null;
  createdAt: string;
  isOwn: boolean;
  isRead: boolean;
}

export interface ConversationHistory {
  items: SingleChatMessage[];
  isMatched: boolean;
  messagesRemaining: number | null;
}

export async function getConversations(): Promise<ChatConversationItem[]> {
  const payload = await apiRequest<{ conversations: ChatConversationItem[] }>('/api/v1/messages', {
    method: 'GET',
  });
  return payload.conversations;
}

export async function getConversation(
  partnerUserId: string,
  page: number = 1,
  limit: number = 50,
): Promise<ConversationHistory> {
  return apiRequest<ConversationHistory>(
    `/api/v1/messages/${partnerUserId}?page=${page}&limit=${limit}`,
    {
      method: 'GET',
    },
  );
}

export async function sendMessage(payload: {
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'audio';
}): Promise<{
  message: SingleChatMessage;
  isMatched: boolean;
  messagesRemaining: number | null;
}> {
  return apiRequest<{
    message: SingleChatMessage;
    isMatched: boolean;
    messagesRemaining: number | null;
  }>('/api/v1/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function likeConversation(partnerUserId: string): Promise<void> {
  await apiRequest<{ isMatched: boolean }>(
    `/api/v1/messages/${partnerUserId}/like`,
    { method: 'POST' },
  );
}

export async function deleteMessage(messageId: string): Promise<void> {
  await apiRequest(`/api/v1/messages/${messageId}`, {
    method: 'DELETE',
  });
}
