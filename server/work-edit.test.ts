import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
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

function createTestUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "google",
    role: "user",
    avatar: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

describe("works.update", () => {
  it("requires authentication", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.works.update({
        id: 1,
        title: "Updated Title",
      })
    ).rejects.toThrow();
  });

  it("validates input schema", async () => {
    const user = createTestUser();
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    // Empty title should fail
    await expect(
      caller.works.update({
        id: 1,
        title: "",
      })
    ).rejects.toThrow();
  });

  it("accepts valid update data", async () => {
    const user = createTestUser({ role: "admin" });
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    // This will fail because work doesn't exist, but validates the input schema works
    await expect(
      caller.works.update({
        id: 999999,
        title: "Valid Title",
        description: "Valid description",
        origin: "personal",
        promptVisibility: "public",
      })
    ).rejects.toThrow("NOT_FOUND");
  });
});

describe("works.delete", () => {
  it("requires authentication", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.works.delete({ id: 1 })
    ).rejects.toThrow();
  });

  it("validates work exists", async () => {
    const user = createTestUser({ role: "admin" });
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.works.delete({ id: 999999 })
    ).rejects.toThrow("NOT_FOUND");
  });
});

describe("authorization checks", () => {
  it("update requires owner or admin role", async () => {
    const user = createTestUser({ id: 999, role: "user" });
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    // Non-owner user should get FORBIDDEN when trying to update existing work
    await expect(
      caller.works.update({
        id: 1,
        title: "Trying to update",
      })
    ).rejects.toThrow("FORBIDDEN");
  });

  it("delete requires owner or admin role", async () => {
    const user = createTestUser({ id: 999, role: "user" });
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    // Non-owner user should get FORBIDDEN when trying to delete existing work
    await expect(
      caller.works.delete({ id: 1 })
    ).rejects.toThrow("FORBIDDEN");
  });
});
