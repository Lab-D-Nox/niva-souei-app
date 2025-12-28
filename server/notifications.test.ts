import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("notifications", () => {
  describe("notifications.list", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.list({ limit: 10 })).rejects.toThrow();
    });

    it("returns notifications for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.list({ limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("notifications.unreadCount", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.unreadCount()).rejects.toThrow();
    });

    it("returns count for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.unreadCount();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("notifications.markAsRead", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.markAsRead({ id: 1 })).rejects.toThrow();
    });
  });

  describe("notifications.markAllAsRead", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.markAllAsRead()).rejects.toThrow();
    });

    it("marks all as read for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.markAllAsRead();
      expect(result).toEqual({ success: true });
    });
  });

  describe("notifications.getEmailSettings", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.getEmailSettings()).rejects.toThrow();
    });

    it("returns default settings for new user", async () => {
      const ctx = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.getEmailSettings();
      expect(result).toHaveProperty("onNewComment");
      expect(result).toHaveProperty("onNewLike");
      expect(result).toHaveProperty("onNewInquiry");
      expect(result).toHaveProperty("onSystemUpdates");
    });
  });

  describe("notifications.updateEmailSettings", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.notifications.updateEmailSettings({ onNewComment: false })
      ).rejects.toThrow();
    });

    it("updates settings for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notifications.updateEmailSettings({
        onNewComment: false,
        onNewLike: true,
      });
      expect(result).toEqual({ success: true });
    });
  });
});
