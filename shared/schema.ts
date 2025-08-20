import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brandTemplates = pgTable("brand_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  primaryColor: text("primary_color").notNull().default("#2563EB"),
  secondaryColor: text("secondary_color").notNull().default("#64748B"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbackForms = pgTable("feedback_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  brandTemplateId: varchar("brand_template_id").references(() => brandTemplates.id),
  fields: jsonb("fields").$type<FormField[]>().notNull(),
  isPublished: boolean("is_published").default(false),
  embedCode: text("embed_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").references(() => feedbackForms.id).notNull(),
  responses: jsonb("responses").$type<Record<string, any>>().notNull(),
  sentiment: text("sentiment").$type<"positive" | "negative" | "neutral">().notNull(),
  sentimentScore: integer("sentiment_score").notNull(), // 1-5 rating
  sentimentConfidence: integer("sentiment_confidence").notNull(), // 0-100 confidence
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FormField = {
  id: string;
  type: "text" | "textarea" | "rating" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[];
};

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertBrandTemplateSchema = createInsertSchema(brandTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackFormSchema = createInsertSchema(feedbackForms).omit({
  id: true,
  embedCode: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  sentiment: true,
  sentimentScore: true,
  sentimentConfidence: true,
  category: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBrandTemplate = z.infer<typeof insertBrandTemplateSchema>;
export type InsertFeedbackForm = z.infer<typeof insertFeedbackFormSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type User = typeof users.$inferSelect;
export type BrandTemplate = typeof brandTemplates.$inferSelect;
export type FeedbackForm = typeof feedbackForms.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
