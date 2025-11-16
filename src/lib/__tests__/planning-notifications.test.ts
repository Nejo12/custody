/**
 * Tests for Planning Notifications Library
 * Tests browser notification permissions, scheduling, and cancellation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  checkNotificationSupport,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleBrowserNotification,
  cancelBrowserNotification,
  showNotification,
  scheduleDeadlineNotifications,
  cancelDeadlineNotifications,
  cancelAllDeadlineNotifications,
  restoreDeadlineNotifications,
  type DeadlineNotification,
} from "../planning-notifications";

describe("planning-notifications", () => {
  // Mock Notification API - needs to be a constructor
  const mockNotification = vi.fn(function (this: unknown) {
    return this || {};
  });
  const mockRequestPermission = vi.fn();
  let mockPermission: NotificationPermission = "default";

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockPermission = "default";
    mockNotification.mockClear();
    mockNotification.mockImplementation(function (this: unknown) {
      return this || {};
    });

    // Mock window.Notification as a constructor using stubGlobal
    vi.stubGlobal("Notification", mockNotification);
    // Set up static properties
    Object.defineProperty(global.Notification, "permission", {
      get: () => mockPermission,
      configurable: true,
    });
    Object.defineProperty(global.Notification, "requestPermission", {
      value: mockRequestPermission,
      configurable: true,
    });

    // Mock window.setTimeout and clearTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("checkNotificationSupport", () => {
    it("should return false in server environment", () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      expect(checkNotificationSupport()).toBe(false);

      global.window = originalWindow;
    });

    it("should return true when Notification is available", () => {
      expect(checkNotificationSupport()).toBe(true);
    });
  });

  describe("getNotificationPermission", () => {
    it("should return null when notifications not supported", () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      expect(getNotificationPermission()).toBeNull();

      global.window = originalWindow;
    });

    it("should return current permission status", () => {
      mockPermission = "granted";

      expect(getNotificationPermission()).toBe("granted");
    });
  });

  describe("requestNotificationPermission", () => {
    it("should throw error when notifications not supported", async () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      await expect(requestNotificationPermission()).rejects.toThrow(
        "Browser does not support notifications"
      );

      global.window = originalWindow;
    });

    it("should return granted if already granted", async () => {
      mockPermission = "granted";

      const permission = await requestNotificationPermission();
      expect(permission).toBe("granted");
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it("should return denied if already denied", async () => {
      mockPermission = "denied";

      const permission = await requestNotificationPermission();
      expect(permission).toBe("denied");
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it("should request permission when default", async () => {
      mockPermission = "default";
      mockRequestPermission.mockResolvedValue("granted");

      const permission = await requestNotificationPermission();
      expect(permission).toBe("granted");
      expect(mockRequestPermission).toHaveBeenCalledOnce();
    });
  });

  describe("scheduleBrowserNotification", () => {
    it("should return null when notifications not supported", () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      const result = scheduleBrowserNotification("Test", {
        body: "Test body",
        when: new Date(Date.now() + 1000),
      });

      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it("should return null when permission not granted", () => {
      mockPermission = "denied";

      const result = scheduleBrowserNotification("Test", {
        body: "Test body",
        when: new Date(Date.now() + 1000),
      });

      expect(result).toBeNull();
    });

    it("should show notification immediately if delay is 0 or negative", () => {
      mockPermission = "granted";

      const pastDate = new Date(Date.now() - 1000);
      const result = scheduleBrowserNotification("Test", {
        body: "Test body",
        when: pastDate,
      });

      expect(result).toBeNull();
      expect(mockNotification).toHaveBeenCalledWith("Test", {
        body: "Test body",
        icon: undefined,
        badge: undefined,
        tag: undefined,
      });
    });

    it("should schedule notification for future date", () => {
      mockPermission = "granted";

      const futureDate = new Date(Date.now() + 5000);
      const result = scheduleBrowserNotification("Test", {
        body: "Test body",
        when: futureDate,
        icon: "/icon.png",
        badge: "/badge.png",
        tag: "test-tag",
      });

      // setTimeout returns a number in real environment, but may be an object in test
      expect(result).toBeDefined();
      expect(mockNotification).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(5000);

      expect(mockNotification).toHaveBeenCalledWith("Test", {
        body: "Test body",
        icon: "/icon.png",
        badge: "/badge.png",
        tag: "test-tag",
      });
    });
  });

  describe("cancelBrowserNotification", () => {
    it("should clear timeout", () => {
      const timeoutId = 123;
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      cancelBrowserNotification(timeoutId);

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    });
  });

  describe("showNotification", () => {
    it("should not show notification when not supported", () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      showNotification("Test", { body: "Test body" });

      expect(mockNotification).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    it("should not show notification when permission denied", () => {
      mockPermission = "denied";

      showNotification("Test", { body: "Test body" });

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it("should show notification when permission granted", () => {
      mockPermission = "granted";

      showNotification("Test", { body: "Test body", icon: "/icon.png" });

      expect(mockNotification).toHaveBeenCalledWith("Test", {
        body: "Test body",
        icon: "/icon.png",
      });
    });
  });

  describe("scheduleDeadlineNotifications", () => {
    it("should not schedule when notifications not supported", () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      const notification: DeadlineNotification = {
        itemId: "item-1",
        title: "Test Item",
        deadline: new Date(Date.now() + 86400000), // 1 day from now
      };

      scheduleDeadlineNotifications(notification);

      expect(mockNotification).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    it("should not schedule when permission not granted", () => {
      mockPermission = "denied";

      const notification: DeadlineNotification = {
        itemId: "item-1",
        title: "Test Item",
        deadline: new Date(Date.now() + 86400000),
      };

      scheduleDeadlineNotifications(notification);

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it("should schedule multiple reminders", () => {
      mockPermission = "granted";

      // Set current time to a known time (e.g., midnight) to make calculations predictable
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      vi.setSystemTime(now);

      const deadline = new Date(now.getTime() + 8 * 86400000); // 8 days from now
      const notification: DeadlineNotification = {
        itemId: "item-1",
        title: "Test Item",
        deadline,
        description: "Test description",
        reminderDaysBefore: [7, 1, 0],
      };

      scheduleDeadlineNotifications(notification, "/icon.png");

      // Should schedule 3 reminders (7 days, 1 day, 0 days before)
      // Reminders are set to 9 AM on the reminder day
      // First reminder: 7 days before = 1 day from now at 9 AM = 33 hours from now (midnight + 1 day + 9 hours)
      vi.advanceTimersByTime(33 * 3600000);
      expect(mockNotification).toHaveBeenCalledTimes(1);

      // Second reminder: 1 day before = 7 days from now at 9 AM
      // Advance 6 more days (144 hours) to reach 7 days from start
      vi.advanceTimersByTime(6 * 86400000);
      expect(mockNotification).toHaveBeenCalledTimes(2);

      // Third reminder: 0 days before = 8 days from now at 9 AM
      // Advance 1 more day (24 hours)
      vi.advanceTimersByTime(86400000);
      expect(mockNotification).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it("should cancel existing notifications before scheduling new ones", () => {
      mockPermission = "granted";

      const deadline = new Date(Date.now() + 86400000);
      const notification: DeadlineNotification = {
        itemId: "item-1",
        title: "Test Item",
        deadline,
      };

      // Schedule first set
      scheduleDeadlineNotifications(notification);
      const firstCallCount = mockNotification.mock.calls.length;

      // Schedule again (should cancel previous)
      scheduleDeadlineNotifications(notification);

      // Should have same number of scheduled notifications
      expect(mockNotification).toHaveBeenCalledTimes(firstCallCount);
    });
  });

  describe("cancelDeadlineNotifications", () => {
    it("should cancel all notifications for an item", () => {
      mockPermission = "granted";

      const deadline = new Date(Date.now() + 86400000);
      const notification: DeadlineNotification = {
        itemId: "item-1",
        title: "Test Item",
        deadline,
        reminderDaysBefore: [7, 1, 0],
      };

      scheduleDeadlineNotifications(notification);
      cancelDeadlineNotifications("item-1");

      // Fast-forward time - notifications should not fire
      vi.advanceTimersByTime(86400000 * 8);
      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe("cancelAllDeadlineNotifications", () => {
    it("should cancel all scheduled notifications", () => {
      mockPermission = "granted";

      const deadline1 = new Date(Date.now() + 86400000);
      const deadline2 = new Date(Date.now() + 2 * 86400000);

      scheduleDeadlineNotifications({
        itemId: "item-1",
        title: "Item 1",
        deadline: deadline1,
      });

      scheduleDeadlineNotifications({
        itemId: "item-2",
        title: "Item 2",
        deadline: deadline2,
      });

      cancelAllDeadlineNotifications();

      // Fast-forward time - no notifications should fire
      vi.advanceTimersByTime(86400000 * 3);
      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe("restoreDeadlineNotifications", () => {
    it("should restore and schedule notifications", () => {
      mockPermission = "granted";

      const notifications: DeadlineNotification[] = [
        {
          itemId: "item-1",
          title: "Item 1",
          deadline: new Date(Date.now() + 86400000),
        },
        {
          itemId: "item-2",
          title: "Item 2",
          deadline: new Date(Date.now() + 2 * 86400000),
        },
      ];

      restoreDeadlineNotifications(notifications, "/icon.png");

      // Fast-forward to first deadline (default reminders are 7, 1, 0 days before)
      // So we'll get notifications at different times
      vi.advanceTimersByTime(86400000);
      // At least one notification should have been called
      expect(mockNotification.mock.calls.length).toBeGreaterThan(0);
    });

    it("should not restore when permission not granted", () => {
      mockPermission = "denied";

      const notifications: DeadlineNotification[] = [
        {
          itemId: "item-1",
          title: "Item 1",
          deadline: new Date(Date.now() + 86400000),
        },
      ];

      restoreDeadlineNotifications(notifications);

      vi.advanceTimersByTime(86400000);
      expect(mockNotification).not.toHaveBeenCalled();
    });
  });
});
