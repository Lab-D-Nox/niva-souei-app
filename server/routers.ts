import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Work type enum
const workTypeEnum = z.enum(["image", "video", "audio", "text", "web"]);
const audioSubtypeEnum = z.enum(["music", "bgm", "voice", "sfx", "podcast"]);
const originEnum = z.enum(["client", "personal"]);
const serviceTierEnum = z.enum(["spot", "standard", "grand"]);
const promptVisibilityEnum = z.enum(["public", "private"]);

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        };
      }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatar: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    
    getMyWorks: protectedProcedure.query(async ({ ctx }) => {
      return await db.getWorksByUserId(ctx.user.id);
    }),
    
    getLikedWorks: protectedProcedure.query(async ({ ctx }) => {
      const likedIds = await db.getLikedWorkIds(ctx.user.id);
      if (likedIds.length === 0) return [];
      const result = await db.getWorks({ limit: 100 });
      return result.works.filter((w: { id: number }) => likedIds.includes(w.id));
    }),
  }),

  works: router({
    list: publicProcedure
      .input(z.object({
        type: workTypeEnum.optional(),
        origin: originEnum.optional(),
        serviceTier: serviceTierEnum.optional(),
        toolId: z.number().optional(),
        tagIds: z.array(z.number()).optional(),
        keyword: z.string().optional(),
        sortBy: z.enum(["newest", "popular"]).default("newest"),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        return await db.getWorks(input || {});
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const work = await db.getWorkById(input.id);
        if (!work) throw new TRPCError({ code: 'NOT_FOUND' });
        
        // Increment view count
        await db.incrementWorkViewCount(input.id);
        
        // Get tags and tools
        const tags = await db.getTagsByWorkId(input.id);
        const tools = await db.getToolsByWorkId(input.id);
        
        // Get owner info
        const owner = await db.getUserById(work.ownerUserId);
        
        // Check if prompt should be visible
        const showPrompt = work.promptVisibility === 'public' || 
          (ctx.user && ctx.user.id === work.ownerUserId);
        
        return {
          ...work,
          promptText: showPrompt ? work.promptText : null,
          negativePrompt: showPrompt ? work.negativePrompt : null,
          tags,
          tools,
          owner: owner ? { id: owner.id, name: owner.name, avatar: owner.avatar } : null,
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        type: workTypeEnum,
        audioSubtype: audioSubtypeEnum.optional(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        mediaUrl: z.string().optional(),
        externalUrl: z.string().optional(),
        textContent: z.string().optional(),
        origin: originEnum.default("personal"),
        serviceTier: serviceTierEnum.optional(),
        promptText: z.string().optional(),
        negativePrompt: z.string().optional(),
        promptVisibility: promptVisibilityEnum.default("private"),
        lyrics: z.string().optional(),
        tagIds: z.array(z.number()).optional(),
        toolIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check posting permission (admin can always post)
        const postingMode = await db.getSetting('posting_mode') || 'admin_only';
        if (postingMode === 'admin_only' && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admin can post works' });
        }
        
        const { tagIds, toolIds, ...workData } = input;
        const workId = await db.createWork({
          ...workData,
          ownerUserId: ctx.user.id,
        });
        
        if (tagIds && tagIds.length > 0) {
          await db.setWorkTags(workId, tagIds);
        }
        if (toolIds && toolIds.length > 0) {
          await db.setWorkTools(workId, toolIds);
        }
        
        return { id: workId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        mediaUrl: z.string().optional(),
        externalUrl: z.string().optional(),
        textContent: z.string().optional(),
        origin: originEnum.optional(),
        serviceTier: serviceTierEnum.optional(),
        promptText: z.string().optional(),
        negativePrompt: z.string().optional(),
        promptVisibility: promptVisibilityEnum.optional(),
        lyrics: z.string().optional(),
        tagIds: z.array(z.number()).optional(),
        toolIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const work = await db.getWorkById(input.id);
        if (!work) throw new TRPCError({ code: 'NOT_FOUND' });
        if (work.ownerUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const { id, tagIds, toolIds, ...updateData } = input;
        await db.updateWork(id, updateData);
        
        if (tagIds !== undefined) {
          await db.setWorkTags(id, tagIds);
        }
        if (toolIds !== undefined) {
          await db.setWorkTools(id, toolIds);
        }
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const work = await db.getWorkById(input.id);
        if (!work) throw new TRPCError({ code: 'NOT_FOUND' });
        if (work.ownerUserId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.deleteWork(input.id);
        return { success: true };
      }),
    
    generateTagSuggestions: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        type: workTypeEnum,
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a tag suggestion assistant. Given a work's title and description, suggest 5-10 relevant tags. Return only a JSON array of tag strings, nothing else. Tags should be in Japanese or English depending on the content."
              },
              {
                role: "user",
                content: `Title: ${input.title}\nDescription: ${input.description || 'N/A'}\nType: ${input.type}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "tag_suggestions",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    tags: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["tags"],
                  additionalProperties: false
                }
              }
            }
          });
          
          const content = response.choices[0]?.message?.content as string | undefined;
          if (content) {
            const parsed = JSON.parse(content);
            return { tags: parsed.tags || [] };
          }
          return { tags: [] };
        } catch (error) {
          console.error("Tag suggestion error:", error);
          return { tags: [] };
        }
      }),
  }),

  tags: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTags();
    }),
    
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(100) }))
      .mutation(async ({ input }) => {
        const id = await db.getOrCreateTag(input.name);
        return { id };
      }),
  }),

  likes: router({
    toggle: publicProcedure
      .input(z.object({
        workId: z.number(),
        fingerprint: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id;
        const fingerprint = input.fingerprint;
        
        if (!userId && !fingerprint) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Fingerprint required for anonymous likes' });
        }
        
        // Rate limiting for anonymous likes
        if (!userId && fingerprint) {
          const allowed = await db.checkRateLimit(fingerprint, 'like', 100, 60);
          if (!allowed) {
            throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
          }
        }
        
        const exists = await db.checkLikeExists(input.workId, userId, fingerprint);
        
        if (exists) {
          await db.removeLike(input.workId, userId, fingerprint);
          return { liked: false };
        } else {
          await db.createLike({
            workId: input.workId,
            userId: userId || null,
            anonFingerprint: userId ? null : fingerprint,
          });
          return { liked: true };
        }
      }),
    
    check: publicProcedure
      .input(z.object({
        workId: z.number(),
        fingerprint: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id;
        const fingerprint = input.fingerprint;
        
        if (!userId && !fingerprint) {
          return { liked: false };
        }
        
        const exists = await db.checkLikeExists(input.workId, userId, fingerprint);
        return { liked: exists };
      }),
  }),

  comments: router({
    list: publicProcedure
      .input(z.object({ workId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommentsByWorkId(input.workId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        workId: z.number(),
        body: z.string().min(1).max(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        // Rate limiting
        const allowed = await db.checkRateLimit(ctx.user.id.toString(), 'comment', 10, 5);
        if (!allowed) {
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many comments. Please wait.' });
        }
        
        const id = await db.createComment({
          workId: input.workId,
          userId: ctx.user.id,
          body: input.body,
        });
        
        // Notify work owner about new comment
        const work = await db.getWorkById(input.workId);
        if (work && work.ownerUserId !== ctx.user.id) {
          await db.createNotification({
            userId: work.ownerUserId,
            type: 'comment',
            title: '新しいコメント',
            message: `${ctx.user.name || 'ユーザー'}さんが「${work.title}」にコメントしました。`,
            workId: input.workId,
            commentId: id,
          });
        }
        
        return { id };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number(), workId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the comment to check ownership
        const comment = await db.getCommentById(input.id);
        if (!comment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
        }
        
        // Allow deletion if user is the comment author or admin
        if (comment.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own comments' });
        }
        
        await db.deleteComment(input.id, input.workId);
        return { success: true };
      }),
  }),

  tools: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTools();
    }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        url: z.string().optional(),
        iconUrl: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createTool(input);
        return { id };
      }),
  }),

  inquiries: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        companyName: z.string().max(255).optional(),
        email: z.string().email().max(320),
        phone: z.string().max(50).optional(),
        inquiryType: z.enum(["spot", "standard", "grand", "other"]).default("other"),
        message: z.string().min(1).max(5000),
        budget: z.string().max(100).optional(),
        deadline: z.string().max(100).optional(),
        referenceUrls: z.string().optional(),
        hearingSheetData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Rate limiting
        const identifier = ctx.user?.id?.toString() || ctx.req.ip || 'anonymous';
        const allowed = await db.checkRateLimit(identifier, 'inquiry', 5, 60);
        if (!allowed) {
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many inquiries. Please wait.' });
        }
        
        const id = await db.createInquiry(input);
        
        // Notify admin users about new inquiry
        const admins = await db.getAdminUsers();
        for (const admin of admins) {
          await db.createNotification({
            userId: admin.id,
            type: 'inquiry',
            title: '新しいお問い合わせ',
            message: `${input.name}様から新しいお問い合わせが届きました。`,
            inquiryId: id,
          });
        }
        
        // Use built-in notification to notify owner
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: '新しいお問い合わせが届きました',
            content: `名前: ${input.name}\nメール: ${input.email}\n種別: ${input.inquiryType}\n内容: ${input.message.substring(0, 200)}...`,
          });
        } catch (e) {
          console.error('Failed to notify owner:', e);
        }
        
        return { id };
      }),
    
    list: adminProcedure.query(async () => {
      return await db.getInquiries();
    }),
    
    generateHearingSheet: publicProcedure
      .input(z.object({
        projectType: z.string(),
        targetAudience: z.string().optional(),
        mood: z.string().optional(),
        references: z.string().optional(),
        additionalNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a creative project hearing sheet generator. Based on the user's inputs, generate a well-formatted hearing sheet text in Japanese that can be used for a creative commission request. The output should be professional and comprehensive.`
              },
              {
                role: "user",
                content: `プロジェクトタイプ: ${input.projectType}
ターゲット層: ${input.targetAudience || '未指定'}
雰囲気・トーン: ${input.mood || '未指定'}
参考資料: ${input.references || 'なし'}
追加メモ: ${input.additionalNotes || 'なし'}`
              }
            ]
          });
          
          const content = (response.choices[0]?.message?.content as string) || '';
          return { hearingSheet: content };
        } catch (error) {
          console.error("Hearing sheet generation error:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate hearing sheet' });
        }
      }),
  }),

  socialLinks: router({
    list: publicProcedure.query(async () => {
      return await db.getSocialLinks();
    }),
    
    create: adminProcedure
      .input(z.object({
        platform: z.string().min(1).max(50),
        url: z.string().url(),
        displayName: z.string().max(100).optional(),
        iconName: z.string().max(50).optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createSocialLink(input);
        return { id };
      }),
  }),

  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await db.getSetting(input.key);
        return { value };
      }),
    
    set: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await db.setSetting(input.key, input.value);
        return { success: true };
      }),
    
    getPostingMode: publicProcedure.query(async () => {
      const mode = await db.getSetting('posting_mode');
      return { mode: mode || 'admin_only' };
    }),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getNotificationsByUserId(ctx.user.id, input?.limit || 50);
      }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNotification(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // Push subscription management
    subscribePush: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createPushSubscription({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    unsubscribePush: protectedProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePushSubscription(ctx.user.id, input.endpoint);
        return { success: true };
      }),
    
    // Email notification settings
    getEmailSettings: protectedProcedure.query(async ({ ctx }) => {
      const settings = await db.getEmailNotificationSettings(ctx.user.id);
      return settings || {
        onNewComment: true,
        onNewLike: false,
        onNewInquiry: true,
        onSystemUpdates: true,
      };
    }),
    
    updateEmailSettings: protectedProcedure
      .input(z.object({
        onNewComment: z.boolean().optional(),
        onNewLike: z.boolean().optional(),
        onNewInquiry: z.boolean().optional(),
        onSystemUpdates: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertEmailNotificationSettings(ctx.user.id, input);
        return { success: true };
      }),
  }),

  upload: router({
    getPresignedUrl: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ext = input.filename.split('.').pop() || '';
        const key = `works/${ctx.user.id}/${nanoid()}.${ext}`;
        
        // For now, return the key - actual upload will be done via storagePut
        return { key, uploadUrl: `/api/upload/${key}` };
      }),
    
    complete: protectedProcedure
      .input(z.object({
        key: z.string(),
        data: z.string(), // base64 encoded
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.data, 'base64');
        const { url } = await storagePut(input.key, buffer, input.contentType);
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
