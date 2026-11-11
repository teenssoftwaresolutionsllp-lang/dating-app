/**
 * Real-Time Messaging Service (Powered by WebSockets / Socket.io)
 * Replaces Agora RTM with self-hosted WebSockets for instant chat (<30ms) & incoming call signaling.
 */
import {
  socketService,
  type SocketMessageCallback,
  type TypingCallback,
} from './socketService';

export type RtmMessageCallback = SocketMessageCallback;
export type { TypingCallback };

export const rtmChatService = socketService;
export default rtmChatService;
