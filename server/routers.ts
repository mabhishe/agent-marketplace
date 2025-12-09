import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { agents, deployments, subscriptions, agentExecutions, agentTools, agentReviews, InsertAgent, InsertDeployment, InsertSubscription } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Marketplace Router - Public agent browsing
const marketplaceRouter = router({
  listAgents: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { agents: [], total: 0 };
      
      const result = await db.select().from(agents).where(eq(agents.status, 'published')).limit(input.limit).offset(input.offset);
      return { agents: result, total: result.length };
    }),

  getAgentDetail: publicProcedure
    .input(z.number())
    .query(async ({ input: agentId }) => {
      const db = await getDb();
      if (!db) return null;
      
      const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
      if (!agent.length) return null;
      
      const tools = await db.select().from(agentTools).where(eq(agentTools.agentId, agentId));
      const reviews = await db.select().from(agentReviews).where(eq(agentReviews.agentId, agentId));
      
      return {
        ...agent[0],
        tools,
        reviews,
      };
    }),

  searchAgents: publicProcedure
    .input(z.object({
      query: z.string(),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Simple search - in production, use full-text search
      const result = await db.select().from(agents)
        .where(eq(agents.status, 'published'))
        .limit(20);
      
      return result;
    }),

  getCategories: publicProcedure.query(async () => {
    return [
      "DevOps",
      "Cloud Management",
      "CI/CD",
      "Monitoring",
      "Security",
      "Infrastructure",
      "Automation",
      "Analytics",
    ];
  }),
});

// Agent Management Router - For developers
const agentRouter = router({
  createAgent: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      category: z.string(),
      billingModel: z.enum(["per-task", "monthly", "per-agent"]),
      basePrice: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const newAgent: InsertAgent = {
        name: input.name,
        description: input.description,
        category: input.category,
        developerId: ctx.user.id,
        billingModel: input.billingModel,
        basePrice: input.basePrice || 0,
        status: "draft",
      };
      
      await db.insert(agents).values(newAgent);
      return { success: true, ...newAgent };
    }),

  updateAgent: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      basePrice: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Verify ownership
      const agent = await db.select().from(agents).where(eq(agents.id, input.id)).limit(1);
      if (!agent.length || agent[0].developerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.description) updates.description = input.description;
      if (input.icon) updates.icon = input.icon;
      if (input.basePrice !== undefined) updates.basePrice = input.basePrice;
      
      await db.update(agents).set(updates).where(eq(agents.id, input.id));
      return { success: true };
    }),

  publishAgent: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: agentId, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Only admins can publish
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      await db.update(agents).set({ status: "published" }).where(eq(agents.id, agentId));
      return { success: true };
    }),

  getMyAgents: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return db.select().from(agents).where(eq(agents.developerId, ctx.user.id));
  }),
});

// Deployment Router
const deploymentRouter = router({
  createDeployment: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      deploymentType: z.enum(["saas", "byoc"]),
      cloudProvider: z.enum(["gcp", "aws", "azure", "on-prem"]).optional(),
      config: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const newDeployment: InsertDeployment = {
        userId: ctx.user.id,
        agentId: input.agentId,
        deploymentType: input.deploymentType,
        cloudProvider: input.cloudProvider,
        config: input.config,
        status: "pending",
      };
      
      await db.insert(deployments).values(newDeployment);
      return { success: true, ...newDeployment };
    }),

  listDeployments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return db.select().from(deployments).where(eq(deployments.userId, ctx.user.id));
  }),

  getDeployment: protectedProcedure
    .input(z.number())
    .query(async ({ input: deploymentId, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const deployment = await db.select().from(deployments)
        .where(eq(deployments.id, deploymentId))
        .limit(1);
      
      if (!deployment.length || deployment[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      const executions = await db.select().from(agentExecutions)
        .where(eq(agentExecutions.deploymentId, deploymentId));
      
      return {
        ...deployment[0],
        executions,
      };
    }),

  updateDeploymentStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "deploying", "running", "failed", "stopped"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Verify ownership
      const deployment = await db.select().from(deployments)
        .where(eq(deployments.id, input.id))
        .limit(1);
      
      if (!deployment.length || deployment[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      await db.update(deployments).set({ status: input.status }).where(eq(deployments.id, input.id));
      return { success: true };
    }),
});

// Billing Router
const billingRouter = router({
  listSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id));
  }),

  createSubscription: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      billingModel: z.enum(["per-task", "monthly", "per-agent"]),
      pricePerUnit: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const newSubscription: InsertSubscription = {
        userId: ctx.user.id,
        agentId: input.agentId,
        billingModel: input.billingModel,
        pricePerUnit: input.pricePerUnit,
        status: "active",
      };
      
      await db.insert(subscriptions).values(newSubscription);
      return { success: true, ...newSubscription };
    }),

  cancelSubscription: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: subscriptionId, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Verify ownership
      const subscription = await db.select().from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);
      
      if (!subscription.length || subscription[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.id, subscriptionId));
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  marketplace: marketplaceRouter,
  agent: agentRouter,
  deployment: deploymentRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
