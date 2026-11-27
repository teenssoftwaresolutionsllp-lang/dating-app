import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from './api';
import { authStorage } from './authStorage';

export type SocketMessageCallback = (message: {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  messageType?: string;
  createdAt: string;
  metadata?: any;
}) => void;

export type SocketMessagesReadCallback = (data: {
  partnerId?: string;
  conversationId?: string | null;
}) => void;

export type TypingCallback = (data: {
  userId: string;
  conversationId?: string;
  isTyping: boolean;
}) => void;

export type SocketLikeCallback = (data: {
  likerId: string;
  likerName: string;
  likerPhoto: string | null;
  isSuperLike: boolean;
  createdAt: string;
}) => void;

export type SocketMatchCallback = (data: {
  matchId: string;
  matchedUser: {
    id: string;
    name: string;
  };
}) => void;

export type SocketProfileViewCallback = (data: {
  id: string;
  name: string;
  subtitle: string;
  time: string;
  avatar: string | null;
  viewedAt: string;
  unreadCount?: number;
}) => void;

export type SocketCallStatusCallback = (data: {
  callId: string;
  action: 'accept' | 'reject' | 'busy' | 'end';
  responderId: string;
}) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;
  private messageListeners: Set<SocketMessageCallback> = new Set();
  private typingListeners: Set<TypingCallback> = new Set();
  private likeListeners: Set<SocketLikeCallback> = new Set();
  private matchListeners: Set<SocketMatchCallback> = new Set();
  private profileViewListeners: Set<SocketProfileViewCallback> = new Set();
  private callStatusListeners: Set<SocketCallStatusCallback> = new Set();
  private messagesReadListeners: Set<SocketMessagesReadCallback> = new Set();
  private isConnecting: boolean = false;

  /**
   * Initializes and connects WebSocket with the backend server
   */
  public async init(userId: string): Promise<void> {
    if (this.socket?.connected && this.currentUserId === userId) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;
    this.currentUserId = userId;

    try {
      const token = await authStorage.getToken();
      const serverUrl = getBaseUrl();

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      console.info(`[WebSocket] Connecting to ${serverUrl} for user: ${userId}`);

      this.socket = io(serverUrl, {
        auth: {
          token: token || undefined,
        },
        query: {
          userId,
          token: token || '',
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.info(`[WebSocket] Connected with socket ID: ${this.socket?.id}`);
      });

      this.socket.on('disconnect', (reason) => {
        console.info(`[WebSocket] Disconnected: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.warn(`[WebSocket] Connection error:`, error.message);
      });

      // Handle incoming messages
      this.socket.on('new_message', (msg: any) => {
        this.messageListeners.forEach((listener) => {
          try {
            listener(msg);
          } catch (err) {
            console.warn('[WebSocket] Listener error:', err);
          }
        });
      });

      // Handle incoming call signaling
      this.socket.on('incoming_call', (callData: any) => {
        const payload = {
          id: `call_${callData.callId || Date.now()}`,
          senderId: callData.callerId || '',
          receiverId: userId,
          content: 'Incoming Call',
          messageType: 'call',
          createdAt: new Date().toISOString(),
          metadata: {
            event: 'INCOMING_CALL',
            ...callData,
          },
        };

        this.messageListeners.forEach((listener) => {
          try {
            listener(payload);
          } catch (err) {
            console.warn('[WebSocket] Call listener error:', err);
          }
        });
      });

      // Handle typing status
      this.socket.on('user_typing', (data: any) => {
        this.typingListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.warn('[WebSocket] Typing listener error:', err);
          }
        });
      });

      // Handle real-time likes
      this.socket.on('new_like', (data: any) => {
        this.likeListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.warn('[WebSocket] Like listener error:', err);
          }
        });
      });

      // Handle real-time mutual matches
      this.socket.on('new_match', (data: any) => {
        this.matchListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.warn('[WebSocket] Match listener error:', err);
          }
        });
      });

      // Handle real-time profile views
      this.socket.on('profile_viewed', (data: any) => {
        this.profileViewListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.warn('[WebSocket] Profile view listener error:', err);
          }
        });
      });

      // Handle call status signaling (reject, end, accept, busy)
      this.socket.on('call_status', (data: any) => {
        this.callStatusListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.warn('[WebSocket] Call status listener error:', err);
          }
        });
      });

      // Handle conversation read synchronization
      this.socket.on('messages_read', (data: any) => {
        this.messagesReadListeners.forEach((listener) => {
          try {
            listener(data || {});
          } catch (err) {
            console.warn('[WebSocket] Messages read listener error:', err);
          }
        });
      });
    } catch (err) {
      console.warn('[WebSocket] Initialization failed:', err);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Subscribes to a conversation room
   */
  public async subscribeToConversation(conversationId: string): Promise<void> {
    if (!conversationId) return;
    this.socket?.emit('join_conversation', conversationId);
  }

  /**
   * Publishes a real-time message to a recipient
   */
  public async publishRealtimeMessage(recipientId: string, message: any): Promise<void> {
    if (!recipientId || !message) return;

    if (!this.socket?.connected) {
      console.warn('[WebSocket] Socket not currently connected. Queuing/Skipping instant broadcast.');
      return;
    }

    // If sending an incoming call invitation
    if (message.metadata?.event === 'INCOMING_CALL') {
      this.socket.emit('call_user', {
        receiverId: recipientId,
        callId: message.metadata.callId,
        callType: message.metadata.callType || 'video',
        channelName: message.metadata.channelName,
        callerName: message.metadata.callerName,
        callerAvatar: message.metadata.callerAvatar,
      });
      return;
    }

    // Standard chat message
    this.socket.emit('send_message', {
      recipientId,
      message,
      conversationId: message.conversationId,
    });
  }

  /**
   * Notify typing status
   */
  public sendTyping(recipientId: string, isTyping: boolean, conversationId?: string): void {
    if (!this.socket?.connected || !recipientId) return;
    this.socket.emit(isTyping ? 'typing_start' : 'typing_stop', {
      recipientId,
      conversationId,
    });
  }

  /**
   * Listen for incoming messages & call events
   */
  public onMessage(callback: SocketMessageCallback): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  /**
   * Listen for typing events
   */
  public onTyping(callback: TypingCallback): () => void {
    this.typingListeners.add(callback);
    return () => {
      this.typingListeners.delete(callback);
    };
  }

  /**
   * Listen for incoming real-time likes
   */
  public onLike(callback: SocketLikeCallback): () => void {
    this.likeListeners.add(callback);
    return () => {
      this.likeListeners.delete(callback);
    };
  }

  /**
   * Listen for incoming real-time mutual matches
   */
  public onMatch(callback: SocketMatchCallback): () => void {
    this.matchListeners.add(callback);
    return () => {
      this.matchListeners.delete(callback);
    };
  }

  /**
   * Listen for incoming real-time profile views
   */
  public onProfileView(callback: SocketProfileViewCallback): () => void {
    this.profileViewListeners.add(callback);
    return () => {
      this.profileViewListeners.delete(callback);
    };
  }

  public onCallStatus(callback: SocketCallStatusCallback): () => void {
    this.callStatusListeners.add(callback);
    return () => {
      this.callStatusListeners.delete(callback);
    };
  }

  public onMessagesRead(callback: SocketMessagesReadCallback): () => void {
    this.messagesReadListeners.add(callback);
    return () => {
      this.messagesReadListeners.delete(callback);
    };
  }

  /**
   * Disconnect and cleanup
   */
  public async logout(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentUserId = null;
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.likeListeners.clear();
    this.matchListeners.clear();
    this.profileViewListeners.clear();
    this.callStatusListeners.clear();
    this.messagesReadListeners.clear();
  }
}

export const socketService = new SocketService();
export default socketService;

