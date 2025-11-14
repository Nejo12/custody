/**
 * Planning Notifications Library
 * Handles browser notification permissions and scheduling
 */

/**
 * Check if browser supports notifications
 */
export function checkNotificationSupport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return "Notification" in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!checkNotificationSupport()) {
    return null;
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!checkNotificationSupport()) {
    throw new Error("Browser does not support notifications");
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Schedule a browser notification
 */
export function scheduleBrowserNotification(
  title: string,
  options: NotificationOptions & { when: Date }
): number | null {
  if (!checkNotificationSupport()) {
    console.warn("Browser does not support notifications");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  const now = new Date();
  const delay = options.when.getTime() - now.getTime();

  if (delay <= 0) {
    // Show immediately
    new Notification(title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
    });
    return null;
  }

  // Schedule notification
  const timeoutId = window.setTimeout(() => {
    new Notification(title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
    });
  }, delay);

  return timeoutId;
}

/**
 * Cancel a scheduled notification
 */
export function cancelBrowserNotification(timeoutId: number): void {
  if (typeof window === "undefined") {
    return;
  }
  window.clearTimeout(timeoutId);
}

/**
 * Show immediate notification
 */
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!checkNotificationSupport()) {
    console.warn("Browser does not support notifications");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  new Notification(title, options);
}
