import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertDeviceSchema, insertDeviceCheckSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Session setup middleware
function setupSession(app: Express) {
  const PgStore = connectPg(session);
  
  app.use(session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'device-management-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));
}

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.employee) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Extend session type
declare module 'express-session' {
  interface SessionData {
    employee: {
      id: string;
      employeeId: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  setupSession(app);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      
      // Check if employee already exists
      const existingEmployee = await storage.getEmployeeByEmail(employeeData.email);
      if (existingEmployee) {
        return res.status(409).json({ message: "Employee with this email already exists" });
      }

      const employee = await storage.createEmployee(employeeData);
      
      // Store employee in session (excluding password)
      req.session.employee = {
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        name: employee.name,
        role: employee.role,
      };

      res.status(201).json({
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        name: employee.name,
        role: employee.role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register employee" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const employee = await storage.authenticateEmployee(credentials);
      
      if (!employee) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Store employee in session (excluding password)
      req.session.employee = {
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        name: employee.name,
        role: employee.role,
      };

      res.json({
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        name: employee.name,
        role: employee.role,
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid login data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.employee) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.employee);
  });

  // Devices API
  app.get("/api/devices", requireAuth, async (req, res) => {
    try {
      const { location } = req.query;
      const devices = await storage.getDevices(location as string);
      res.json(devices);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const device = await storage.getDeviceById(id);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      console.error("Failed to fetch device:", error);
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.post("/api/devices", requireAuth, async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse({
        ...req.body,
        createdBy: req.session.employee!.id,
      });
      
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      console.error("Failed to create device:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid device data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create device" });
      }
    }
  });

  app.put("/api/devices/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertDeviceSchema.partial().parse(req.body);
      const device = await storage.updateDevice(id, updates);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      console.error("Failed to update device:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid device data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update device" });
      }
    }
  });

  app.delete("/api/devices/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDevice(id);
      
      if (!success) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete device:", error);
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Device checks API
  app.get("/api/device-checks", requireAuth, async (req, res) => {
    try {
      const { deviceId } = req.query;
      const checks = await storage.getDeviceChecks(deviceId as string);
      res.json(checks);
    } catch (error) {
      console.error("Failed to fetch device checks:", error);
      res.status(500).json({ message: "Failed to fetch device checks" });
    }
  });

  app.post("/api/device-checks", requireAuth, async (req, res) => {
    try {
      const checkData = insertDeviceCheckSchema.parse({
        ...req.body,
        checkedBy: req.session.employee!.id,
        completedDate: new Date(),
      });
      
      const check = await storage.createDeviceCheck(checkData);
      res.status(201).json(check);
    } catch (error) {
      console.error("Failed to create device check:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid check data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create device check" });
      }
    }
  });

  // Planning and status routes
  app.get("/api/devices/overdue", requireAuth, async (req, res) => {
    try {
      const overdueDevices = await storage.getOverdueDevices();
      res.json(overdueDevices);
    } catch (error) {
      console.error("Failed to fetch overdue devices:", error);
      res.status(500).json({ message: "Failed to fetch overdue devices" });
    }
  });

  app.get("/api/devices/upcoming", requireAuth, async (req, res) => {
    try {
      const { days } = req.query;
      const daysAhead = days ? parseInt(days as string) : 7;
      const upcomingDevices = await storage.getUpcomingChecks(daysAhead);
      res.json(upcomingDevices);
    } catch (error) {
      console.error("Failed to fetch upcoming checks:", error);
      res.status(500).json({ message: "Failed to fetch upcoming checks" });
    }
  });

  // Locations API
  app.get("/api/locations", requireAuth, async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Dashboard API
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}