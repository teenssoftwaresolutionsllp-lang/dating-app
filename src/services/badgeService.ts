import { authStorage } from './authStorage';
import { getLikesReceived, markLikesSeen } from './matchApi';
import { getConversations } from './messageApi';
import { socketService } from './socketService';

export interface TabBadgeCounts {
  likesCount: number;
  chatsCount: number;
}

type BadgeListener = (counts: TabBadgeCounts) => void;

class BadgeService {
  private listeners: Set<BadgeListener> = new Set();
  private currentCounts: TabBadgeCounts = { likesCount: 0, chatsCount: 0 };
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private isFetching = false;
  private activePartnerId: string | null = null;
  private activeConversationId: string | null = null;
  private seenMessageIds: Set<string> = new Set();
  private likesMarkingSeenPromise: Promise<void> | null = null;
  private likesClearedAt = 0;

  constructor() {
    this.startPolling();
    this.initSocketListeners();
  }

  private trackMessageId(id: string): boolean {
    if (this.seenMessageIds.has(id)) {
      return false;
    }
    this.seenMessageIds.add(id);
    if (this.seenMessageIds.size > 500) {
      const oldest = this.seenMessageIds.values().next().value;
      if (oldest) {
        this.seenMessageIds.delete(oldest);
      }
    }
    return true;
  }

  private initSocketListeners() {
    // 1. Listen for instant incoming chat messages
    socketService.onMessage((msg) => {
      void (async () => {
        // Ignore call signaling events forwarded through messageListeners
        if (
          msg?.messageType === 'call' ||
          msg?.metadata?.event === 'INCOMING_CALL'
        ) {
          return;
        }

        // Deduplicate multiple socket emissions for the same message
        if (msg?.id && !this.trackMessageId(msg.id)) {
          return;
        }

        // Never count self-sent messages
        const myUserId = await authStorage.getUserId();
        if (myUserId && msg?.senderId === myUserId) {
          return;
        }

        // If user is currently viewing this conversation, do not increment unread badge
        const isSamePartner =
          Boolean(this.activePartnerId) && msg?.senderId === this.activePartnerId;
        const isSameConversation =
          Boolean(this.activeConversationId) &&
          msg?.conversationId === this.activeConversationId;
        if (isSamePartner || isSameConversation) {
          return;
        }

        this.currentCounts = {
          ...this.currentCounts,
          chatsCount: this.currentCounts.chatsCount + 1,
        };
        this.emit();
      })();
    });

    // 1b. Sync unread chats count when messages are marked as read
    socketService.onMessagesRead(() => {
      void this.refresh();
    });

    // 2. Listen for instant incoming likes (when another user likes profile)
    socketService.onLike(() => {
      this.currentCounts = {
        ...this.currentCounts,
        likesCount: this.currentCounts.likesCount + 1,
      };
      this.emit();
    });

    // 3. Listen for mutual matches
    socketService.onMatch(() => {
      void this.refresh();
    });
  }

  setActiveConversation(partnerId: string | null, conversationId?: string | null) {
    this.activePartnerId = partnerId;
    this.activeConversationId = conversationId ?? null;
  }

  async clearLikesBadge(): Promise<void> {
    this.likesClearedAt = Date.now();
    if (this.currentCounts.likesCount > 0) {
      this.currentCounts = {
        ...this.currentCounts,
        likesCount: 0,
      };
      this.emit();
    }

    if (!this.likesMarkingSeenPromise) {
      this.likesMarkingSeenPromise = markLikesSeen()
        .catch((err) => {
          console.warn('[BadgeService] Failed to mark likes as seen:', err);
        })
        .finally(() => {
          this.likesMarkingSeenPromise = null;
        });
    }

    await this.likesMarkingSeenPromise;
  }

  decrementChats(amount = 1) {
    if (amount <= 0) return;
    if (this.currentCounts.chatsCount > 0) {
      this.currentCounts = {
        ...this.currentCounts,
        chatsCount: Math.max(0, this.currentCounts.chatsCount - amount),
      };
      this.emit();
    }
  }

  subscribe(listener: BadgeListener): () => void {
    this.listeners.add(listener);
    listener(this.currentCounts);
    void this.refresh();

    return () => {
      this.listeners.delete(listener);
    };
  }

  async refresh(): Promise<TabBadgeCounts> {
    if (this.isFetching) return this.currentCounts;
    const token = await authStorage.getToken();
    if (!token) {
      return this.currentCounts;
    }

    this.isFetching = true;

    try {
      if (this.likesMarkingSeenPromise) {
        await this.likesMarkingSeenPromise;
      }

      const [likesRes, chatsRes] = await Promise.allSettled([
        getLikesReceived(),
        getConversations(),
      ]);

      let newLikes = this.currentCounts.likesCount;
      if (likesRes.status === 'fulfilled' && Array.isArray(likesRes.value)) {
        const recentlyCleared = Date.now() - this.likesClearedAt < 2500;
        newLikes = recentlyCleared
          ? 0
          : likesRes.value.filter((l) => !l.isMatched && !l.isSeen).length;
      }

      let newChats = this.currentCounts.chatsCount;
      if (chatsRes.status === 'fulfilled' && Array.isArray(chatsRes.value)) {
        newChats = chatsRes.value.reduce((sum, c) => {
          if (this.activePartnerId && c.partner?.id === this.activePartnerId) {
            return sum;
          }
          return sum + (c.unreadCount || 0);
        }, 0);
      }

      this.currentCounts = {
        likesCount: newLikes,
        chatsCount: newChats,
      };

      this.emit();
    } catch (err) {
      console.warn('[BadgeService] Failed to refresh badges:', err);
    } finally {
      this.isFetching = false;
    }

    return this.currentCounts;
  }

  getCounts(): TabBadgeCounts {
    return this.currentCounts;
  }

  private emit() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentCounts);
      } catch (err) {
        console.warn('[BadgeService] Listener error:', err);
      }
    });
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      void this.refresh();
    }, 25000);
  }

  reset() {
    this.currentCounts = { likesCount: 0, chatsCount: 0 };
    this.activePartnerId = null;
    this.activeConversationId = null;
    this.seenMessageIds.clear();
    this.likesClearedAt = 0;
    this.likesMarkingSeenPromise = null;
    this.emit();
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

export const badgeService = new BadgeService();
