import { apiRequest, formatApiImageUrl } from './api';
import { markProfileViewersSeen } from './matchApi';
import { socketService } from './socketService';

export interface ProfileViewerItem {
  id: string;
  name: string;
  subtitle: string;
  time: string;
  viewedAt?: string;
  isSeen?: boolean;
  avatar: any;
}

export function formatViewerRelativeTime(
  viewedAt?: string,
  fallbackTime = 'Recently',
): string {
  if (!viewedAt) return fallbackTime;
  const date = new Date(viewedAt);
  if (Number.isNaN(date.getTime())) return fallbackTime;

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type ViewerListener = (count: number) => void;

class ViewerService {
  private viewers: ProfileViewerItem[] = [];
  private unreadCount = 0;
  private listeners: Set<ViewerListener> = new Set();
  private markingSeenPromise: Promise<void> | null = null;
  private clearedAt = 0;

  constructor() {
    this.initSocketListener();
  }

  private initSocketListener() {
    socketService.onProfileView((data) => {
      const viewedAt = data.viewedAt || new Date().toISOString();
      const newViewer: ProfileViewerItem = {
        id: data.id || `view_${Date.now()}`,
        name: data.name || 'Someone',
        subtitle: data.subtitle || 'Viewed your profile',
        time: formatViewerRelativeTime(viewedAt, data.time || 'Just now'),
        viewedAt,
        isSeen: false,
        avatar: data.avatar
          ? { uri: formatApiImageUrl(data.avatar) }
          : require('../../assets/images/image 2.png'),
      };

      this.viewers = [
        newViewer,
        ...this.viewers.filter((v) => v.id !== newViewer.id),
      ].slice(0, 50);

      this.unreadCount =
        typeof data.unreadCount === 'number'
          ? data.unreadCount
          : this.viewers.filter((v) => !v.isSeen).length;
      this.emit();
    });
  }

  subscribe(listener: ViewerListener): () => void {
    this.listeners.add(listener);
    listener(this.unreadCount);
    void this.loadViewers();
    return () => {
      this.listeners.delete(listener);
    };
  }

  getViewers(): ProfileViewerItem[] {
    return this.viewers.map((viewer) => ({
      ...viewer,
      time: formatViewerRelativeTime(viewer.viewedAt, viewer.time),
    }));
  }

  async loadViewers(): Promise<ProfileViewerItem[]> {
    try {
      if (this.markingSeenPromise) {
        await this.markingSeenPromise;
      }

      const res = await apiRequest<any[]>('/api/v1/matches/profile-viewers', {
        method: 'GET',
      });

      if (Array.isArray(res)) {
        const mapped: ProfileViewerItem[] = res.map((v: any, index: number) => {
          const viewedAt =
            typeof v.viewedAt === 'string' ? v.viewedAt : undefined;
          return {
            id: v.id || String(index),
            name: v.name || 'Someone',
            subtitle: v.subtitle || 'Viewed your profile',
            time: formatViewerRelativeTime(viewedAt, v.time || 'Recently'),
            viewedAt,
            isSeen: Boolean(v.isSeen),
            avatar: v.avatar
              ? typeof v.avatar === 'string'
                ? { uri: formatApiImageUrl(v.avatar) }
                : v.avatar
              : index % 2 === 0
                ? require('../../assets/images/image 2.png')
                : require('../../assets/images/login2.png'),
          };
        });

        this.viewers = mapped;
        const recentlyCleared = Date.now() - this.clearedAt < 2500;
        this.unreadCount = recentlyCleared
          ? 0
          : mapped.filter((v) => !v.isSeen).length;
      }
    } catch {
      // Keep existing viewers on transient network failures
    }

    this.emit();
    return this.getViewers();
  }

  async recordProfileView(viewedUserId: string): Promise<void> {
    if (!viewedUserId) return;
    try {
      await apiRequest('/api/v1/matches/profile-view', {
        method: 'POST',
        body: JSON.stringify({ viewedUserId }),
      });
    } catch {
      // Non-blocking background call
    }
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  async markAsSeen(): Promise<void> {
    this.clearedAt = Date.now();
    this.unreadCount = 0;
    this.viewers = this.viewers.map((v) => ({ ...v, isSeen: true }));
    this.emit();

    if (!this.markingSeenPromise) {
      this.markingSeenPromise = markProfileViewersSeen()
        .catch((err) => {
          console.warn('[ViewerService] Failed to mark viewers as seen:', err);
        })
        .finally(() => {
          this.markingSeenPromise = null;
        });
    }

    await this.markingSeenPromise;
  }

  private emit(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.unreadCount);
      } catch (err) {
        console.warn('[ViewerService] Listener error:', err);
      }
    });
  }
}

export const viewerService = new ViewerService();
