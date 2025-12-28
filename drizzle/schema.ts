import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  bio: text("bio"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Works table - stores all creative works (Image/Video/Audio/Text/Web)
 */
export const works = mysqlTable("works", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  type: mysqlEnum("type", ["image", "video", "audio", "text", "web"]).notNull(),
  audioSubtype: mysqlEnum("audioSubtype", ["music", "bgm", "voice", "sfx", "podcast"]),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  mediaUrl: text("mediaUrl"),
  externalUrl: text("externalUrl"),
  textContent: text("textContent"),
  // Work classification
  origin: mysqlEnum("origin", ["client", "personal"]).default("personal").notNull(),
  serviceTier: mysqlEnum("serviceTier", ["tier1", "tier2", "tier3", "tier4", "tier5"]),
  // Prompt information
  promptText: text("promptText"),
  negativePrompt: text("negativePrompt"),
  promptVisibility: mysqlEnum("promptVisibility", ["public", "private"]).default("private").notNull(),
  // Music specific
  lyrics: text("lyrics"),
  // Metadata
  likeCount: int("likeCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  // Social links placeholder
  socialLinkSetId: int("socialLinkSetId"),
  externalPostUrlX: text("externalPostUrlX"),
  externalPostUrlInstagram: text("externalPostUrlInstagram"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

/**
 * Tags table
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Work-Tag relationship table
 */
export const workTags = mysqlTable("work_tags", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull(),
  tagId: int("tagId").notNull(),
});

export type WorkTag = typeof workTags.$inferSelect;
export type InsertWorkTag = typeof workTags.$inferInsert;

/**
 * Likes table - supports both anonymous and authenticated likes
 */
export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull(),
  userId: int("userId"),
  anonFingerprint: varchar("anonFingerprint", { length: 64 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;

/**
 * Comments table - requires authentication
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull(),
  userId: int("userId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * AI Tools table
 */
export const tools = mysqlTable("tools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  url: text("url"),
  iconUrl: text("iconUrl"),
  category: varchar("category", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

/**
 * Work-Tool relationship table
 */
export const workTools = mysqlTable("work_tools", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull(),
  toolId: int("toolId").notNull(),
});

export type WorkTool = typeof workTools.$inferSelect;
export type InsertWorkTool = typeof workTools.$inferInsert;

/**
 * Inquiries table - stores contact/commission requests
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  inquiryType: mysqlEnum("inquiryType", ["spot", "standard", "grand", "other"]).default("other").notNull(),
  message: text("message").notNull(),
  budget: varchar("budget", { length: 100 }),
  deadline: varchar("deadline", { length: 100 }),
  referenceUrls: text("referenceUrls"),
  hearingSheetData: json("hearingSheetData"),
  status: mysqlEnum("status", ["new", "in_progress", "completed", "cancelled"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Site Settings table - stores global configuration
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * Social Links table - stores SNS links for the site
 */
export const socialLinks = mysqlTable("social_links", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(),
  url: text("url").notNull(),
  displayName: varchar("displayName", { length: 100 }),
  iconName: varchar("iconName", { length: 50 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = typeof socialLinks.$inferInsert;

/**
 * Rate Limit table - for tracking anonymous actions
 */
export const rateLimits = mysqlTable("rate_limits", {
  id: int("id").autoincrement().primaryKey(),
  identifier: varchar("identifier", { length: 128 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  count: int("count").default(1).notNull(),
  windowStart: timestamp("windowStart").defaultNow().notNull(),
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;


/**
 * Notifications table - stores in-app notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["like", "comment", "inquiry", "system", "mention"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  // Related entity references
  workId: int("workId"),
  commentId: int("commentId"),
  inquiryId: int("inquiryId"),
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  // Metadata
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Push Subscriptions table - stores browser push notification subscriptions
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Email Notification Settings table - stores user email notification preferences
 */
export const emailNotificationSettings = mysqlTable("email_notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  onNewComment: boolean("onNewComment").default(true).notNull(),
  onNewLike: boolean("onNewLike").default(false).notNull(),
  onNewInquiry: boolean("onNewInquiry").default(true).notNull(),
  onSystemUpdates: boolean("onSystemUpdates").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailNotificationSetting = typeof emailNotificationSettings.$inferSelect;
export type InsertEmailNotificationSetting = typeof emailNotificationSettings.$inferInsert;
