import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { jsonb } from "drizzle-orm/pg-core";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Employees table - for authentication and user management
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull().unique(), // Company employee ID
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Encrypted password
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"), // employee, admin, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Devices table - main device registry
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  identificationNumber: text("identification_number").notNull().unique(),
  location: text("location").notNull(),
  plannedFrequencyWeeks: integer("planned_frequency_weeks").notNull(), // Frequency in weeks
  planComment: text("plan_comment"), // Optional comment for the plan
  status: text("status").notNull().default("active"), // active, inactive, maintenance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => employees.id),
});

// Device checks table - tracks when devices are checked/maintained
export const deviceChecks = pgTable("device_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id).notNull(),
  checkedBy: varchar("checked_by").references(() => employees.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(), // When it was supposed to be checked
  completedDate: timestamp("completed_date").notNull(), // When it was actually checked
  status: text("status").notNull(), // completed, delayed, overdue
  checkComment: text("check_comment"), // Optional comment for this check
  isDelayed: boolean("is_delayed").default(false), // If completed after scheduled date
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations for better query capabilities
export const employeesRelations = relations(employees, ({ many }) => ({
  devicesCreated: many(devices),
  deviceChecks: many(deviceChecks),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  createdBy: one(employees, {
    fields: [devices.createdBy],
    references: [employees.id],
  }),
  checks: many(deviceChecks),
}));

export const deviceChecksRelations = relations(deviceChecks, ({ one }) => ({
  device: one(devices, {
    fields: [deviceChecks.deviceId],
    references: [devices.id],
  }),
  checkedBy: one(employees, {
    fields: [deviceChecks.checkedBy],
    references: [employees.id],
  }),
}));

// Zod schemas for validation
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  employeeId: z.string().min(1, "Employee ID is required"),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  plannedFrequencyWeeks: z.number().min(1, "Frequency must be at least 1 week"),
});

export const insertDeviceCheckSchema = createInsertSchema(deviceChecks).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Type exports
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type InsertDeviceCheck = z.infer<typeof insertDeviceCheckSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Employee = typeof employees.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type DeviceCheck = typeof deviceChecks.$inferSelect;

// Combined types for frontend use
export type DeviceWithChecks = Device & {
  checks: DeviceCheck[];
  createdBy: Employee | null;
  lastCheck?: DeviceCheck;
  nextScheduledCheck?: Date;
  isOverdue?: boolean;
};

export type DeviceCheckWithRelations = DeviceCheck & {
  device: Device;
  checkedBy: Employee;
};