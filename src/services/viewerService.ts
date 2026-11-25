import { apiRequest, formatApiImageUrl } from './api';
import { socketService } from './socketService';

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

  constructor() {
    this.initSocketListener();
  }

  private initSocketListener() {
    // Listen for real-time incoming profile views
    socketService.onProfileView((data) => {
      const newViewer: ProfileViewerItem = {
        id: data.id || `view_${Date.now()}`,
        name: data.name || 'Admirer',
        subtitle: data.subtitle || 'Viewed your profile',
        time: data.time || 'Just now',
        avatar: data.avatar
          ? { uri: formatApiImageUrl(data.avatar) }
          : require('../../assets/images/image 2.png'),
      };

      // Prepend to viewers list, avoid duplicates
      this.viewers = [newViewer, ...this.viewers.filter((v) => v.id !== newViewer.id)].slice(0, 50);
      this.hasSeenViewers = false;
      this.unreadCount += 1;
      this.emit();
    });
  }

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
      const res = await apiRequest<any[]>('/api/v1/matches/profile-viewers', {
        method: 'GET',
      });
      if (Array.isArray(res) && res.length > 0) {
        this.viewers = res.map((v: any, index: number) => ({
          id: v.id || String(index),
          name: v.name || 'Admirer',
          subtitle: v.subtitle || 'Viewed your profile',
          time: v.time || 'Recently',
          avatar: v.avatar
            ? (typeof v.avatar === 'string' ? { uri: formatApiImageUrl(v.avatar) } : v.avatar)
            : (index % 2 === 0 ? require('../../assets/images/image 2.png') : require('../../assets/images/login2.png')),
        }));
        if (!this.hasSeenViewers) {
          this.unreadCount = this.viewers.length;
        }
      }
    } catch {
      // Backend route optional, keep fallback viewers
    }

    this.emit();
    return this.viewers;
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

