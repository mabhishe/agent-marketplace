import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "developer", "operator"]).default("user").notNull(),
  organizationId: int("organizationId"),
  profilePicture: varchar("profilePicture", { length: 512 }),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Organizations for multi-tenant support
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: int("ownerId").notNull(),
  description: text("description"),
  logo: varchar("logo", { length: 512 }),
  website: varchar("website", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Agents in the marketplace
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // DevOps, Cloud, Automation, etc.
  version: varchar("version", { length: 50 }).default("1.0.0").notNull(),
  status: mysqlEnum("status", ["draft", "verified", "published", "deprecated", "retired"]).default("draft").notNull(),
  developerId: int("developerId").notNull(),
  icon: varchar("icon", { length: 512 }),
  basePrice: int("basePrice").default(0), // Price in cents
  billingModel: mysqlEnum("billingModel", ["per-task", "monthly", "per-agent"]).default("per-task").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  downloadCount: int("downloadCount").default(0),
  manifestUrl: varchar("manifestUrl", { length: 512 }),
  containerImage: varchar("containerImage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Tools that agents can use
 */
export const agentTools = mysqlTable("agentTools", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  toolName: varchar("toolName", { length: 255 }).notNull(),
  toolType: mysqlEnum("toolType", ["python", "rest", "cli", "terraform", "shell"]).notNull(),
  description: text("description"),
  inputSchema: json("inputSchema"), // JSON schema for inputs
  outputSchema: json("outputSchema"), // JSON schema for outputs
  permissionLevel: mysqlEnum("permissionLevel", ["read", "write", "admin"]).default("read").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentTool = typeof agentTools.$inferSelect;
export type InsertAgentTool = typeof agentTools.$inferInsert;

/**
 * Cloud credentials for users
 */
export const cloudCredentials = mysqlTable("cloudCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cloudProvider: mysqlEnum("cloudProvider", ["gcp", "aws", "azure", "on-prem"]).notNull(),
  credentialsEncrypted: text("credentialsEncrypted").notNull(), // Encrypted JSON
  isVerified: boolean("isVerified").default(false),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CloudCredential = typeof cloudCredentials.$inferSelect;
export type InsertCloudCredential = typeof cloudCredentials.$inferInsert;

/**
 * Deployments of agents
 */
export const deployments = mysqlTable("deployments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId").notNull(),
  deploymentType: mysqlEnum("deploymentType", ["saas", "byoc"]).notNull(),
  status: mysqlEnum("status", ["pending", "deploying", "running", "failed", "stopped"]).default("pending").notNull(),
  cloudProvider: mysqlEnum("cloudProvider", ["gcp", "aws", "azure", "on-prem"]),
  config: json("config"), // Deployment configuration
  credentialsId: int("credentialsId"),
  deploymentUrl: varchar("deploymentUrl", { length: 512 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

/**
 * Agent executions / tasks
 */
export const agentExecutions = mysqlTable("agentExecutions", {
  id: int("id").autoincrement().primaryKey(),
  deploymentId: int("deploymentId").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "timeout"]).default("pending").notNull(),
  input: json("input"), // Task input
  output: json("output"), // Task output
  error: text("error"),
  executionTimeMs: int("executionTimeMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type AgentExecution = typeof agentExecutions.$inferSelect;
export type InsertAgentExecution = typeof agentExecutions.$inferInsert;

/**
 * Subscriptions / Billing
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId").notNull(),
  billingModel: mysqlEnum("billingModel", ["per-task", "monthly", "per-agent"]).notNull(),
  status: mysqlEnum("status", ["active", "paused", "cancelled", "expired"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  pricePerUnit: int("pricePerUnit"), // In cents
  currentUsage: int("currentUsage").default(0),
  renewalDate: timestamp("renewalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Invoices for billing
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // In cents
  status: mysqlEnum("status", ["draft", "sent", "paid", "failed", "refunded"]).default("draft").notNull(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  dueAt: timestamp("dueAt"),
  paidAt: timestamp("paidAt"),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Reviews for agents
 */
export const agentReviews = mysqlTable("agentReviews", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentReview = typeof agentReviews.$inferSelect;
export type InsertAgentReview = typeof agentReviews.$inferInsert;