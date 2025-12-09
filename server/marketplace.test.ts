import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Marketplace Router", () => {
  describe("listAgents", () => {
    it("should return empty list when no agents exist", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.listAgents({
        limit: 20,
        offset: 0,
      });

      expect(result).toHaveProperty("agents");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.agents)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.listAgents({
        limit: 5,
        offset: 0,
      });

      expect(result.agents.length).toBeLessThanOrEqual(5);
    });

    it("should support category filtering", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.listAgents({
        limit: 20,
        offset: 0,
        category: "DevOps",
      });

      expect(result).toHaveProperty("agents");
      expect(result).toHaveProperty("total");
    });
  });

  describe("getAgentDetail", () => {
    it("should return null for non-existent agent", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.getAgentDetail(999);

      expect(result).toBeNull();
    });
  });

  describe("getCategories", () => {
    it("should return list of categories", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const categories = await caller.marketplace.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain("DevOps");
      expect(categories).toContain("Cloud Management");
    });
  });

  describe("searchAgents", () => {
    it("should return results for search query", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.searchAgents({
        query: "cost",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should support category filter in search", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.marketplace.searchAgents({
        query: "optimizer",
        category: "DevOps",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("Agent Router", () => {
  describe("createAgent", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.agent.createAgent({
          name: "Test Agent",
          description: "A test agent",
          category: "DevOps",
          billingModel: "per-task",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should create agent for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.createAgent({
        name: "Cost Optimizer",
        description: "Optimizes cloud costs",
        category: "DevOps",
        billingModel: "per-task",
        basePrice: 1000,
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("name", "Cost Optimizer");
      expect(result).toHaveProperty("developerId", ctx.user!.id);
    });

    it("should set status to draft by default", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.createAgent({
        name: "New Agent",
        description: "A new agent",
        category: "Cloud Management",
        billingModel: "monthly",
      });

      expect(result).toHaveProperty("status", "draft");
    });
  });

  describe("getMyAgents", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.agent.getMyAgents();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should return empty list for user with no agents", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.getMyAgents();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("publishAgent", () => {
    it("should require admin role", async () => {
      const { ctx } = createAuthContext({ role: "user" });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.agent.publishAgent(1);
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin to publish agent", async () => {
      const { ctx } = createAuthContext({ role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // This will fail because agent doesn't exist, but it tests the permission check
      try {
        await caller.agent.publishAgent(1);
      } catch (error: any) {
        // Expected to fail due to non-existent agent, but not due to permissions
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });
});

describe("Deployment Router", () => {
  describe("createDeployment", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.deployment.createDeployment({
          agentId: 1,
          deploymentType: "saas",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should create SaaS deployment", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.deployment.createDeployment({
        agentId: 1,
        deploymentType: "saas",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("deploymentType", "saas");
      expect(result).toHaveProperty("userId", ctx.user!.id);
      expect(result).toHaveProperty("status", "pending");
    });

    it("should create BYOC deployment with cloud provider", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.deployment.createDeployment({
        agentId: 1,
        deploymentType: "byoc",
        cloudProvider: "gcp",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("deploymentType", "byoc");
      expect(result).toHaveProperty("cloudProvider", "gcp");
    });
  });

  describe("listDeployments", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.deployment.listDeployments();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should return empty list for user with no deployments", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.deployment.listDeployments();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("updateDeploymentStatus", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.deployment.updateDeploymentStatus({
          id: 1,
          status: "running",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});

describe("Billing Router", () => {
  describe("listSubscriptions", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.billing.listSubscriptions();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should return empty list for user with no subscriptions", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.billing.listSubscriptions();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("createSubscription", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.billing.createSubscription({
          agentId: 1,
          billingModel: "per-task",
          pricePerUnit: 1000,
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should create subscription for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.billing.createSubscription({
        agentId: 1,
        billingModel: "per-task",
        pricePerUnit: 1000,
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("userId", ctx.user!.id);
      expect(result).toHaveProperty("status", "active");
    });
  });

  describe("cancelSubscription", () => {
    it("should require authentication", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.billing.cancelSubscription(1);
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});

describe("Auth Router", () => {
  describe("me", () => {
    it("should return null for unauthenticated user", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });

    it("should return user info for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("logout", () => {
    it("should clear session cookie", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });
});
