/**
 * Planning Notifications Library
 * Handles browser notification permissions and scheduling for planning checklist deadlines
 */

/**
 * Interface for deadline notification data
 */
export interface DeadlineNotification {
  itemId: string;
  title: string;
  deadline: Date;
  description?: string;
  reminderDaysBefore?: number[];
}

/**
 * Stored notification timeout IDs mapped by item ID
 */
const scheduledNotifications = new Map<string, number>();

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

/**
 * Schedule deadline notifications for a checklist item
 * Creates multiple reminders (e.g., 7 days before, 1 day before, on deadline)
 */
export function scheduleDeadlineNotifications(
  notification: DeadlineNotification,
  iconUrl?: string
): void {
  if (!checkNotificationSupport() || Notification.permission !== "granted") {
    return;
  }

  // Cancel any existing notifications for this item
  cancelDeadlineNotifications(notification.itemId);

  const now = new Date();
  const deadline = notification.deadline;
  const reminderDays = notification.reminderDaysBefore || [7, 1, 0]; // Default: 7 days, 1 day, and on deadline

  // Schedule each reminder
  reminderDays.forEach((daysBefore) => {
    const reminderDate = new Date(deadline);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(9, 0, 0, 0); // 9 AM on reminder day

    // Only schedule if reminder is in the future
    if (reminderDate > now) {
      const delay = reminderDate.getTime() - now.getTime();
      const timeoutId = window.setTimeout(() => {
        const daysText =
          daysBefore === 0 ? "today" : `in ${daysBefore} day${daysBefore > 1 ? "s" : ""}`;
        const body = notification.description
          ? `${notification.description}\n\nDeadline: ${daysText}`
          : `Deadline: ${daysText}`;

        showNotification(notification.title, {
          body,
          icon: iconUrl || "/icons/icon-192-maskable.png",
          badge: "/icons/icon-192-maskable.png",
          tag: `deadline-${notification.itemId}-${daysBefore}`,
          requireInteraction: daysBefore === 0, // Require interaction on deadline day
        });
      }, delay);

      // Store timeout ID with a unique key
      const key = `${notification.itemId}-${daysBefore}`;
      scheduledNotifications.set(key, timeoutId);
    }
  });
}

/**
 * Cancel all scheduled notifications for a specific checklist item
 */
export function cancelDeadlineNotifications(itemId: string): void {
  const keysToDelete: string[] = [];
  scheduledNotifications.forEach((timeoutId, key) => {
    if (key.startsWith(`${itemId}-`)) {
      cancelBrowserNotification(timeoutId);
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => scheduledNotifications.delete(key));
}

/**
 * Cancel all scheduled deadline notifications
 */
export function cancelAllDeadlineNotifications(): void {
  scheduledNotifications.forEach((timeoutId) => {
    cancelBrowserNotification(timeoutId);
  });
  scheduledNotifications.clear();
}

/**
 * Load scheduled notifications from localStorage and reschedule them
 * Useful for restoring notifications after page reload
 */
export function restoreDeadlineNotifications(
  notifications: DeadlineNotification[],
  iconUrl?: string
): void {
  if (!checkNotificationSupport() || Notification.permission !== "granted") {
    return;
  }

  notifications.forEach((notification) => {
    scheduleDeadlineNotifications(notification, iconUrl);
  });
}
