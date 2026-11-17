import { getLikesReceived } from './matchApi';
import { getConversations } from './messageApi';

export interface TabBadgeCounts {
  likesCount: number;
  chatsCount: number;
}

type BadgeListener = (counts: TabBadgeCounts) => void;

class BadgeService {
  private listeners: Set<BadgeListener> = new Set();
  private currentCounts: TabBadgeCounts = { likesCount: 0, chatsCount: 0 };
  private pollInterval: NodeJS.Timeout | null = null;
  private isFetching = false;

  constructor() {
    this.startPolling();
  }

  subscribe(listener: BadgeListener): () => void {
    this.listeners.add(listener);
    // Immediately emit cached counts
    listener(this.currentCounts);

    // Trigger fresh fetch
    void this.refresh();

    return () => {
      this.listeners.delete(listener);
    };
  }

  async refresh(): Promise<TabBadgeCounts> {
    if (this.isFetching) return this.currentCounts;
    this.isFetching = true;

    try {
      const [likesRes, chatsRes] = await Promise.allSettled([
        getLikesReceived(),
        getConversations(),
      ]);

      let newLikes = 0;
      if (likesRes.status === 'fulfilled' && Array.isArray(likesRes.value)) {
        // Count active likes received (unmatched admirers or total likes)
        newLikes = likesRes.value.filter((l) => !l.isMatched).length;
        if (newLikes === 0 && likesRes.value.length > 0) {
          newLikes = likesRes.value.length;
        }
      }

      let newChats = 0;
      if (chatsRes.status === 'fulfilled' && Array.isArray(chatsRes.value)) {
        newChats = chatsRes.value.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0
        );
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
    // Poll every 25 seconds for quiet background badge sync
    this.pollInterval = setInterval(() => {
      void this.refresh();
    }, 25000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

export const badgeService = new BadgeService();
