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
}

export interface SingleChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: 'text' | 'image' | 'audio' | 'system';
  mediaUrl?: string | null;
  createdAt: string;
  isOwn: boolean;
}

// 1. Get Inbox Conversations List
export async function getConversations(): Promise<ChatConversationItem[]> {
  try {
    const payload = await apiRequest<{ conversations: ChatConversationItem[] }>('/api/v1/messages', {
      method: 'GET',
    });
    return payload?.conversations || [];
  } catch (error) {
    console.warn('Failed to load conversations:', error);
    return [];
  }
}

// 2. Get Messages with a Specific User
export async function getConversation(
  partnerUserId: string,
  page: number = 1,
  limit: number = 50,
): Promise<SingleChatMessage[]> {
  try {
    const messages = await apiRequest<SingleChatMessage[]>(
      `/api/v1/messages/${partnerUserId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      },
    );
    return messages || [];
  } catch (error) {
    console.warn('Failed to load conversation history:', error);
    return [];
  }
}

// 3. Send Message
export async function sendMessage(payload: {
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'audio';
}): Promise<SingleChatMessage> {
  const result = await apiRequest<{ message: SingleChatMessage }>('/api/v1/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.message;
}

// 4. Delete Message
export async function deleteMessage(messageId: string): Promise<void> {
  await apiRequest(`/api/v1/messages/${messageId}`, {
    method: 'DELETE',
  });
}
