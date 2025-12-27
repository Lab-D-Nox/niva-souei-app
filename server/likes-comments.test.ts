import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  checkLikeExists: vi.fn().mockResolvedValue(false),
  createLike: vi.fn().mockResolvedValue(undefined),
  removeLike: vi.fn().mockResolvedValue(undefined),
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getCommentsByWorkId: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue(1),
  getCommentById: vi.fn().mockResolvedValue({ id: 1, userId: 1, workId: 1, body: "Test comment" }),
  deleteComment: vi.fn().mockResolvedValue(undefined),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("likes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("likes.toggle", () => {
    it("creates a like when not already liked", async () => {
      vi.mocked(db.checkLikeExists).mockResolvedValue(false);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.likes.toggle({ workId: 1, fingerprint: "test-fingerprint" });

      expect(result).toEqual({ liked: true });
      expect(db.createLike).toHaveBeenCalledWith({
        workId: 1,
        userId: null,
        anonFingerprint: "test-fingerprint",
      });
    });

    it("removes a like when already liked", async () => {
      vi.mocked(db.checkLikeExists).mockResolvedValue(true);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.likes.toggle({ workId: 1, fingerprint: "test-fingerprint" });

      expect(result).toEqual({ liked: false });
      expect(db.removeLike).toHaveBeenCalledWith(1, undefined, "test-fingerprint");
    });

    it("uses userId for authenticated users", async () => {
      vi.mocked(db.checkLikeExists).mockResolvedValue(false);
      
      const ctx = createAuthContext(5);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.likes.toggle({ workId: 1 });

      expect(result).toEqual({ liked: true });
      expect(db.createLike).toHaveBeenCalledWith({
        workId: 1,
        userId: 5,
        anonFingerprint: null,
      });
    });
  });

  describe("likes.check", () => {
    it("returns liked status for fingerprint", async () => {
      vi.mocked(db.checkLikeExists).mockResolvedValue(true);
      
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.likes.check({ workId: 1, fingerprint: "test-fingerprint" });

      expect(result).toEqual({ liked: true });
    });

    it("returns false when no fingerprint or user", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.likes.check({ workId: 1 });

      expect(result).toEqual({ liked: false });
    });
  });
});

describe("comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("comments.delete", () => {
    it("allows comment owner to delete their comment", async () => {
      vi.mocked(db.getCommentById).mockResolvedValue({ 
        id: 1, 
        userId: 1, 
        workId: 1, 
        body: "Test comment",
        createdAt: new Date(),
      });
      
      const ctx = createAuthContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.comments.delete({ id: 1, workId: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteComment).toHaveBeenCalledWith(1, 1);
    });

    it("allows admin to delete any comment", async () => {
      vi.mocked(db.getCommentById).mockResolvedValue({ 
        id: 1, 
        userId: 2, // Different user
        workId: 1, 
        body: "Test comment",
        createdAt: new Date(),
      });
      
      const ctx = createAuthContext(1, "admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.comments.delete({ id: 1, workId: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteComment).toHaveBeenCalledWith(1, 1);
    });

    it("prevents non-owner from deleting comment", async () => {
      vi.mocked(db.getCommentById).mockResolvedValue({ 
        id: 1, 
        userId: 2, // Different user
        workId: 1, 
        body: "Test comment",
        createdAt: new Date(),
      });
      
      const ctx = createAuthContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.comments.delete({ id: 1, workId: 1 }))
        .rejects.toThrow("You can only delete your own comments");
    });

    it("throws error when comment not found", async () => {
      vi.mocked(db.getCommentById).mockResolvedValue(undefined);
      
      const ctx = createAuthContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.comments.delete({ id: 999, workId: 1 }))
        .rejects.toThrow("Comment not found");
    });
  });
});
