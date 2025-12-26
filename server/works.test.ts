import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getWorks: vi.fn().mockResolvedValue({ works: [], total: 0 }),
  getWorkById: vi.fn().mockResolvedValue(null),
  createWork: vi.fn().mockResolvedValue(1),
  updateWork: vi.fn().mockResolvedValue(undefined),
  deleteWork: vi.fn().mockResolvedValue(undefined),
  incrementWorkViewCount: vi.fn().mockResolvedValue(undefined),
  getTagsByWorkId: vi.fn().mockResolvedValue([]),
  getToolsByWorkId: vi.fn().mockResolvedValue([]),
  getUserById: vi.fn().mockResolvedValue(null),
  setWorkTags: vi.fn().mockResolvedValue(undefined),
  setWorkTools: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue("admin_only"),
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getAllTags: vi.fn().mockResolvedValue([]),
  getAllTools: vi.fn().mockResolvedValue([]),
  checkLikeExists: vi.fn().mockResolvedValue(false),
  createLike: vi.fn().mockResolvedValue(1),
  removeLike: vi.fn().mockResolvedValue(undefined),
  getCommentsByWorkId: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue(1),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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

describe("works.list", () => {
  it("returns empty list when no works exist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.works.list({});

    expect(result).toEqual({ works: [], total: 0 });
  });

  it("accepts filter parameters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.works.list({
      type: "image",
      origin: "personal",
      sortBy: "popular",
      limit: 10,
    });

    expect(result).toBeDefined();
  });
});

describe("works.getById", () => {
  it("throws NOT_FOUND for non-existent work", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.works.getById({ id: 999 })).rejects.toThrow();
  });
});

describe("tags.list", () => {
  it("returns empty list when no tags exist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tags.list();

    expect(result).toEqual([]);
  });
});

describe("tools.list", () => {
  it("returns empty list when no tools exist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tools.list();

    expect(result).toEqual([]);
  });
});

describe("likes.check", () => {
  it("returns false for anonymous user without fingerprint", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.likes.check({ workId: 1 });

    expect(result).toEqual({ liked: false });
  });

  it("checks like status with fingerprint", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.likes.check({ workId: 1, fingerprint: "test-fp" });

    expect(result).toEqual({ liked: false });
  });
});

describe("comments.list", () => {
  it("returns empty list when no comments exist", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.list({ workId: 1 });

    expect(result).toEqual([]);
  });
});

describe("comments.create", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.comments.create({ workId: 1, body: "Test comment" })
    ).rejects.toThrow();
  });

  it("creates comment for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.create({ workId: 1, body: "Test comment" });

    expect(result).toEqual({ id: 1 });
  });
});

describe("settings.getPostingMode", () => {
  it("returns default posting mode", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.getPostingMode();

    expect(result).toEqual({ mode: "admin_only" });
  });
});
