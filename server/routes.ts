import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSentiment } from "./services/openai";
import { insertBrandTemplateSchema, insertFeedbackFormSchema, insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Brand Templates API
  app.get("/api/brand-templates", async (req, res) => {
    try {
      const templates = await storage.getBrandTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brand templates" });
    }
  });

  app.post("/api/brand-templates", async (req, res) => {
    try {
      const templateData = insertBrandTemplateSchema.parse(req.body);
      const template = await storage.createBrandTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid template data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create brand template" });
      }
    }
  });

  app.put("/api/brand-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertBrandTemplateSchema.partial().parse(req.body);
      const template = await storage.updateBrandTemplate(id, updates);
      
      if (!template) {
        return res.status(404).json({ message: "Brand template not found" });
      }
      
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid template data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update brand template" });
      }
    }
  });

  app.delete("/api/brand-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBrandTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Brand template not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brand template" });
    }
  });

  // Feedback Forms API
  app.get("/api/feedback-forms", async (req, res) => {
    try {
      const forms = await storage.getFeedbackForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback forms" });
    }
  });

  app.post("/api/feedback-forms", async (req, res) => {
    try {
      const formData = insertFeedbackFormSchema.parse(req.body);
      const form = await storage.createFeedbackForm(formData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create feedback form" });
      }
    }
  });

  app.put("/api/feedback-forms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertFeedbackFormSchema.partial().parse(req.body);
      const form = await storage.updateFeedbackForm(id, updates);
      
      if (!form) {
        return res.status(404).json({ message: "Feedback form not found" });
      }
      
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update feedback form" });
      }
    }
  });

  // Feedback API
  app.get("/api/feedback", async (req, res) => {
    try {
      const { formId } = req.query;
      const feedback = await storage.getFeedback(formId as string);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      
      // Create initial feedback record
      let feedback = await storage.createFeedback(feedbackData);
      
      // Analyze sentiment for text responses
      const textResponses = Object.values(feedbackData.responses)
        .filter(response => typeof response === 'string' && response.length > 10)
        .join(' ');
      
      if (textResponses) {
        const sentimentAnalysis = await analyzeSentiment(textResponses);
        
        // Update feedback with sentiment analysis
        feedback = {
          ...feedback,
          sentiment: sentimentAnalysis.sentiment,
          sentimentScore: sentimentAnalysis.score,
          sentimentConfidence: sentimentAnalysis.confidence,
          category: sentimentAnalysis.category,
        };
        
        // Save updated feedback (in a real app, this would be a database update)
        storage['feedback'].set(feedback.id, feedback);
      }
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Failed to create feedback:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create feedback" });
      }
    }
  });

  // Analytics API
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics stats" });
    }
  });

  // Export API
  app.get("/api/export/feedback", async (req, res) => {
    try {
      const { format } = req.query;
      const feedback = await storage.getFeedback();
      
      if (format === 'csv') {
        // Simple CSV export
        const csvHeaders = 'ID,Form ID,Sentiment,Score,Category,Created At,Responses\n';
        const csvRows = feedback.map(f => 
          `"${f.id}","${f.formId}","${f.sentiment}","${f.sentimentScore}","${f.category}","${f.createdAt?.toISOString()}","${JSON.stringify(f.responses).replace(/"/g, '""')}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="feedback-export.csv"');
        res.send(csvHeaders + csvRows);
      } else {
        res.json(feedback);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to export feedback data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
