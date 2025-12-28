import { eq, and, or, like, desc, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  works, InsertWork, Work,
  tags, InsertTag,
  workTags, InsertWorkTag,
  likes, InsertLike,
  comments, InsertComment,
  tools, InsertTool,
  workTools, InsertWorkTool,
  inquiries, InsertInquiry,
  siteSettings, InsertSiteSetting,
  socialLinks, InsertSocialLink,
  rateLimits
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; avatar?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============ WORKS FUNCTIONS ============
export async function createWork(work: InsertWork) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(works).values(work);
  return result[0].insertId;
}

export async function getWorkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(works).where(eq(works.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWork(id: number, data: Partial<InsertWork>) {
  const db = await getDb();
  if (!db) return;
  await db.update(works).set(data).where(eq(works.id, id));
}

export async function deleteWork(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(works).where(eq(works.id, id));
}

export async function getWorks(options: {
  type?: string;
  origin?: string;
  serviceTier?: string;
  toolId?: number;
  tagIds?: number[];
  keyword?: string;
  sortBy?: 'newest' | 'popular';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { works: [], total: 0 };

  const conditions = [];
  
  if (options.type) {
    conditions.push(eq(works.type, options.type as any));
  }
  if (options.origin) {
    conditions.push(eq(works.origin, options.origin as any));
  }
  if (options.serviceTier) {
    conditions.push(eq(works.serviceTier, options.serviceTier as any));
  }
  if (options.keyword) {
    conditions.push(
      or(
        like(works.title, `%${options.keyword}%`),
        like(works.description, `%${options.keyword}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const orderBy = options.sortBy === 'popular' 
    ? desc(works.likeCount) 
    : desc(works.createdAt);

  let query = db.select().from(works);
  if (whereClause) {
    query = query.where(whereClause) as any;
  }
  
  const result = await (query as any)
    .orderBy(orderBy)
    .limit(options.limit || 20)
    .offset(options.offset || 0);

  // Get total count
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(works);
  if (whereClause) {
    countQuery = countQuery.where(whereClause) as any;
  }
  const countResult = await countQuery;
  const total = countResult[0]?.count || 0;

  return { works: result, total };
}

export async function getWorksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(works).where(eq(works.ownerUserId, userId)).orderBy(desc(works.createdAt));
}

export async function incrementWorkViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(works).set({ viewCount: sql`${works.viewCount} + 1` }).where(eq(works.id, id));
}

// ============ TAGS FUNCTIONS ============
export async function createTag(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tags).values({ name }).onDuplicateKeyUpdate({ set: { name } });
  return result[0].insertId;
}

export async function getOrCreateTag(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
  if (existing.length > 0) return existing[0].id;
  
  const result = await db.insert(tags).values({ name });
  return result[0].insertId;
}

export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tags).orderBy(asc(tags.name));
}

export async function getTagsByWorkId(workId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({ id: tags.id, name: tags.name })
    .from(workTags)
    .innerJoin(tags, eq(workTags.tagId, tags.id))
    .where(eq(workTags.workId, workId));
  return result;
}

export async function setWorkTags(workId: number, tagIds: number[]) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(workTags).where(eq(workTags.workId, workId));
  
  if (tagIds.length > 0) {
    const values = tagIds.map(tagId => ({ workId, tagId }));
    await db.insert(workTags).values(values);
  }
}

// ============ LIKES FUNCTIONS ============
export async function createLike(data: InsertLike) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(likes).values(data);
  await db.update(works).set({ likeCount: sql`${works.likeCount} + 1` }).where(eq(works.id, data.workId));
}

export async function checkLikeExists(workId: number, userId?: number, fingerprint?: string) {
  const db = await getDb();
  if (!db) return false;
  
  const conditions = [eq(likes.workId, workId)];
  if (userId) {
    conditions.push(eq(likes.userId, userId));
  } else if (fingerprint) {
    conditions.push(eq(likes.anonFingerprint, fingerprint));
  } else {
    return false;
  }
  
  const result = await db.select().from(likes).where(and(...conditions)).limit(1);
  return result.length > 0;
}

export async function removeLike(workId: number, userId?: number, fingerprint?: string) {
  const db = await getDb();
  if (!db) return;
  
  const conditions = [eq(likes.workId, workId)];
  if (userId) {
    conditions.push(eq(likes.userId, userId));
  } else if (fingerprint) {
    conditions.push(eq(likes.anonFingerprint, fingerprint));
  } else {
    return;
  }
  
  await db.delete(likes).where(and(...conditions));
  await db.update(works).set({ likeCount: sql`GREATEST(${works.likeCount} - 1, 0)` }).where(eq(works.id, workId));
}

export async function getLikedWorkIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ workId: likes.workId }).from(likes).where(eq(likes.userId, userId));
  return result.map(r => r.workId);
}

// ============ COMMENTS FUNCTIONS ============
export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comments).values(data);
  await db.update(works).set({ commentCount: sql`${works.commentCount} + 1` }).where(eq(works.id, data.workId));
  return result[0].insertId;
}

export async function getCommentsByWorkId(workId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: users.name,
      userAvatar: users.avatar,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.workId, workId))
    .orderBy(desc(comments.createdAt));
  return result;
}

export async function getCommentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteComment(id: number, workId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(comments).where(eq(comments.id, id));
  await db.update(works).set({ commentCount: sql`GREATEST(${works.commentCount} - 1, 0)` }).where(eq(works.id, workId));
}

// ============ TOOLS FUNCTIONS ============
export async function createTool(data: InsertTool) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tools).values(data);
  return result[0].insertId;
}

export async function getAllTools() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tools).where(eq(tools.isActive, true)).orderBy(asc(tools.name));
}

export async function getToolsByWorkId(workId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({ id: tools.id, name: tools.name, url: tools.url, iconUrl: tools.iconUrl, category: tools.category })
    .from(workTools)
    .innerJoin(tools, eq(workTools.toolId, tools.id))
    .where(eq(workTools.workId, workId));
  return result;
}

export async function setWorkTools(workId: number, toolIds: number[]) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(workTools).where(eq(workTools.workId, workId));
  
  if (toolIds.length > 0) {
    const values = toolIds.map(toolId => ({ workId, toolId }));
    await db.insert(workTools).values(values);
  }
}

// ============ INQUIRIES FUNCTIONS ============
export async function createInquiry(data: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inquiries).values(data);
  return result[0].insertId;
}

export async function getInquiries() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

// ============ SITE SETTINGS FUNCTIONS ============
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

// ============ SOCIAL LINKS FUNCTIONS ============
export async function getSocialLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(socialLinks).where(eq(socialLinks.isActive, true)).orderBy(asc(socialLinks.sortOrder));
}

export async function createSocialLink(data: InsertSocialLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialLinks).values(data);
  return result[0].insertId;
}

// ============ RATE LIMITING FUNCTIONS ============
export async function checkRateLimit(identifier: string, action: string, maxCount: number, windowMinutes: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const result = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.identifier, identifier),
        eq(rateLimits.action, action),
        sql`${rateLimits.windowStart} > ${windowStart}`
      )
    )
    .limit(1);
  
  if (result.length === 0) {
    await db.insert(rateLimits).values({ identifier, action, count: 1, windowStart: new Date() });
    return true;
  }
  
  if (result[0].count >= maxCount) {
    return false;
  }
  
  await db.update(rateLimits)
    .set({ count: sql`${rateLimits.count} + 1` })
    .where(eq(rateLimits.id, result[0].id));
  
  return true;
}


// ============ NOTIFICATIONS FUNCTIONS ============
import { 
  notifications, InsertNotification,
  pushSubscriptions, InsertPushSubscription,
  emailNotificationSettings, InsertEmailNotificationSetting
} from "../drizzle/schema";

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function getNotificationsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function deleteNotification(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

// ============ PUSH SUBSCRIPTIONS FUNCTIONS ============
export async function createPushSubscription(data: InsertPushSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if subscription already exists for this user with same endpoint
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, data.userId),
      eq(pushSubscriptions.endpoint, data.endpoint)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing subscription
    await db
      .update(pushSubscriptions)
      .set({ p256dh: data.p256dh, auth: data.auth, isActive: true, userAgent: data.userAgent })
      .where(eq(pushSubscriptions.id, existing[0].id));
    return existing[0].id;
  }
  
  const result = await db.insert(pushSubscriptions).values(data);
  return result[0].insertId;
}

export async function getPushSubscriptionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));
}

export async function getAllActivePushSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.isActive, true));
}

export async function deactivatePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(pushSubscriptions)
    .set({ isActive: false })
    .where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function deletePushSubscription(userId: number, endpoint: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
}

// ============ EMAIL NOTIFICATION SETTINGS FUNCTIONS ============
export async function getEmailNotificationSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(emailNotificationSettings)
    .where(eq(emailNotificationSettings.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertEmailNotificationSettings(userId: number, settings: Partial<InsertEmailNotificationSetting>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getEmailNotificationSettings(userId);
  
  if (existing) {
    await db
      .update(emailNotificationSettings)
      .set(settings)
      .where(eq(emailNotificationSettings.userId, userId));
  } else {
    await db.insert(emailNotificationSettings).values({ userId, ...settings });
  }
}

// ============ ADMIN USERS FUNCTIONS ============
export async function getAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"));
}
