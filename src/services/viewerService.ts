import { apiRequest } from './api';

export interface ProfileViewerItem {
  id: string;
  name: string;
  subtitle: string;
  time: string;
  avatar: any;
}

export const FALLBACK_VIEWERS: ProfileViewerItem[] = [
  {
    id: '1',
    name: 'Ananya',
    subtitle: 'Looking for serious relationship',
    time: '08:30 AM',
    avatar: require('../../assets/images/image 2.png'),
  },
  {
    id: '2',
    name: 'Swathi',
    subtitle: 'Looking for casual talk',
    time: 'Yesterday',
    avatar: require('../../assets/images/login2.png'),
  },
];

type ViewerListener = (count: number) => void;

class ViewerService {
  private viewers: ProfileViewerItem[] = FALLBACK_VIEWERS;
  private unreadCount: number = FALLBACK_VIEWERS.length;
  private listeners: Set<ViewerListener> = new Set();
  private hasSeenViewers = false;

  subscribe(listener: ViewerListener): () => void {
    this.listeners.add(listener);
    listener(this.hasSeenViewers ? 0 : this.unreadCount);
    void this.loadViewers();
    return () => {
      this.listeners.delete(listener);
    };
  }

  async loadViewers(): Promise<ProfileViewerItem[]> {
    try {
      const res = await apiRequest<ProfileViewerItem[]>('/api/v1/matches/profile-viewers', {
        method: 'GET',
      });
      if (Array.isArray(res) && res.length > 0) {
        this.viewers = res;
        if (!this.hasSeenViewers) {
          this.unreadCount = res.length;
        }
      }
    } catch {
      // Backend route optional, keep fallback viewers
    }

    this.emit();
    return this.viewers;
  }

  getUnreadCount(): number {
    return this.hasSeenViewers ? 0 : this.unreadCount;
  }

  markAsSeen(): void {
    this.hasSeenViewers = true;
    this.unreadCount = 0;
    this.emit();
  }

  private emit(): void {
    const current = this.hasSeenViewers ? 0 : this.unreadCount;
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.warn('[ViewerService] Listener error:', err);
      }
    });
  }
}

export const viewerService = new ViewerService();
