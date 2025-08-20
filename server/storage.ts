import { 
  type User, 
  type InsertUser, 
  type BrandTemplate, 
  type InsertBrandTemplate,
  type FeedbackForm,
  type InsertFeedbackForm,
  type Feedback,
  type InsertFeedback
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Brand template operations
  getBrandTemplates(): Promise<BrandTemplate[]>;
  getBrandTemplate(id: string): Promise<BrandTemplate | undefined>;
  createBrandTemplate(template: InsertBrandTemplate): Promise<BrandTemplate>;
  updateBrandTemplate(id: string, updates: Partial<InsertBrandTemplate>): Promise<BrandTemplate | undefined>;
  deleteBrandTemplate(id: string): Promise<boolean>;

  // Feedback form operations
  getFeedbackForms(): Promise<FeedbackForm[]>;
  getFeedbackForm(id: string): Promise<FeedbackForm | undefined>;
  createFeedbackForm(form: InsertFeedbackForm): Promise<FeedbackForm>;
  updateFeedbackForm(id: string, updates: Partial<InsertFeedbackForm>): Promise<FeedbackForm | undefined>;
  deleteFeedbackForm(id: string): Promise<boolean>;

  // Feedback operations
  getFeedback(formId?: string): Promise<Feedback[]>;
  getFeedbackById(id: string): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackStats(): Promise<{
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    responseRate: number;
    categories: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private brandTemplates: Map<string, BrandTemplate> = new Map();
  private feedbackForms: Map<string, FeedbackForm> = new Map();
  private feedback: Map<string, Feedback> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default brand template
    const defaultTemplate: BrandTemplate = {
      id: randomUUID(),
      name: "TechCorp Default",
      description: "Primary brand template",
      primaryColor: "#2563EB",
      secondaryColor: "#64748B",
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.brandTemplates.set(defaultTemplate.id, defaultTemplate);

    // Create default user
    const defaultUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "password",
      name: "Sarah Johnson",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create sample feedback form
    const sampleForm: FeedbackForm = {
      id: randomUUID(),
      title: "Customer Satisfaction Survey",
      description: "Help us improve by sharing your experience...",
      brandTemplateId: defaultTemplate.id,
      fields: [
        {
          id: "rating",
          type: "rating",
          label: "Overall Experience",
          required: true,
        },
        {
          id: "comments",
          type: "textarea",
          label: "Comments",
          required: false,
        }
      ],
      isPublished: true,
      embedCode: `<iframe src="https://feedbackflow.app/embed/${randomUUID()}" width="100%" height="400"></iframe>`,
      createdAt: new Date(),
    };
    this.feedbackForms.set(sampleForm.id, sampleForm);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Brand template operations
  async getBrandTemplates(): Promise<BrandTemplate[]> {
    return Array.from(this.brandTemplates.values());
  }

  async getBrandTemplate(id: string): Promise<BrandTemplate | undefined> {
    return this.brandTemplates.get(id);
  }

  async createBrandTemplate(template: InsertBrandTemplate): Promise<BrandTemplate> {
    const id = randomUUID();
    const brandTemplate: BrandTemplate = {
      ...template,
      id,
      createdAt: new Date(),
    };
    this.brandTemplates.set(id, brandTemplate);
    return brandTemplate;
  }

  async updateBrandTemplate(id: string, updates: Partial<InsertBrandTemplate>): Promise<BrandTemplate | undefined> {
    const template = this.brandTemplates.get(id);
    if (!template) return undefined;

    const updated = { ...template, ...updates };
    this.brandTemplates.set(id, updated);
    return updated;
  }

  async deleteBrandTemplate(id: string): Promise<boolean> {
    return this.brandTemplates.delete(id);
  }

  // Feedback form operations
  async getFeedbackForms(): Promise<FeedbackForm[]> {
    return Array.from(this.feedbackForms.values());
  }

  async getFeedbackForm(id: string): Promise<FeedbackForm | undefined> {
    return this.feedbackForms.get(id);
  }

  async createFeedbackForm(form: InsertFeedbackForm): Promise<FeedbackForm> {
    const id = randomUUID();
    const feedbackForm: FeedbackForm = {
      ...form,
      id,
      embedCode: `<iframe src="https://feedbackflow.app/embed/${id}" width="100%" height="400"></iframe>`,
      createdAt: new Date(),
    };
    this.feedbackForms.set(id, feedbackForm);
    return feedbackForm;
  }

  async updateFeedbackForm(id: string, updates: Partial<InsertFeedbackForm>): Promise<FeedbackForm | undefined> {
    const form = this.feedbackForms.get(id);
    if (!form) return undefined;

    const updated = { ...form, ...updates };
    this.feedbackForms.set(id, updated);
    return updated;
  }

  async deleteFeedbackForm(id: string): Promise<boolean> {
    return this.feedbackForms.delete(id);
  }

  // Feedback operations
  async getFeedback(formId?: string): Promise<Feedback[]> {
    const allFeedback = Array.from(this.feedback.values());
    return formId ? allFeedback.filter(f => f.formId === formId) : allFeedback;
  }

  async getFeedbackById(id: string): Promise<Feedback | undefined> {
    return this.feedback.get(id);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = {
      ...insertFeedback,
      id,
      sentiment: "neutral",
      sentimentScore: 3,
      sentimentConfidence: 0,
      category: "General",
      createdAt: new Date(),
    };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async getFeedbackStats(): Promise<{
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    responseRate: number;
    categories: Record<string, number>;
  }> {
    const allFeedback = Array.from(this.feedback.values());
    const total = allFeedback.length;
    
    const positive = allFeedback.filter(f => f.sentiment === "positive").length;
    const negative = allFeedback.filter(f => f.sentiment === "negative").length;
    const neutral = allFeedback.filter(f => f.sentiment === "neutral").length;

    const categories: Record<string, number> = {};
    allFeedback.forEach(f => {
      if (f.category) {
        categories[f.category] = (categories[f.category] || 0) + 1;
      }
    });

    return {
      total,
      positive,
      negative,
      neutral,
      responseRate: 84, // Mock response rate
      categories,
    };
  }
}

export const storage = new MemStorage();
