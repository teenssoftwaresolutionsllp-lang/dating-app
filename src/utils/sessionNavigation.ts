import { router } from 'expo-router';
import { authStorage } from '@/services/authStorage';
import { socketService } from '@/services/socketService';
import { badgeService } from '@/services/badgeService';
import { viewerService } from '@/services/viewerService';
import { dismissAllAppNotifications } from '@/services/notificationService';

const PROTECTED_PREFIXES = [
  '/(tab)',
  '/matches',
  '/likes',
  '/people',
  '/chats',
  '/me',
  '/settings',
  '/notification',
  '/profile-viewers',
  '/deactivate-or-delete',
  '/deactivate-account',
  '/delete-account',
  '/confirm-delete',
  '/logout',
  '/edit-about',
  '/edit-details',
  '/edit-interests',
  '/edit-looking-for',
  '/edit-nature',
  '/call',
  '/view-all',
];

export function isProtectedRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.trim().replace(/\/+$/, '');
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/**
 * Clears all prior navigation history and lands on /login so back-swipe
 * cannot return to authenticated, deactivated, or deleted screens.
 */
export function resetNavigationToLogin(): void {
  try {
    if (router.canDismiss()) {
      router.dismissAll();
    }
  } catch {
    // Ignore when already at root
  }
  router.replace('/login' as any);
}

/**
 * Fully tears down live client session state (socket, in-memory badges/viewers,
 * notification tray banners, persisted tokens) and resets stack to /login.
 */
export async function completeSignOutAndResetToLogin(): Promise<void> {
  try {
    await socketService.logout();
  } catch {
    // Non-blocking
  }
  badgeService.reset();
  viewerService.reset();
  await dismissAllAppNotifications();
  await authStorage.clearAuth();
  resetNavigationToLogin();
}
