import { 
  type Employee,
  type InsertEmployee,
  type Device,
  type InsertDevice,
  type DeviceCheck,
  type InsertDeviceCheck,
  type DeviceWithChecks,
  type DeviceCheckWithRelations,
  type LoginCredentials,
  employees,
  devices,
  deviceChecks
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sql, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Employee authentication operations
  getEmployeeById(id: string): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  authenticateEmployee(credentials: LoginCredentials): Promise<Employee | null>;

  // Device operations
  getDevices(location?: string): Promise<DeviceWithChecks[]>;
  getDeviceById(id: string): Promise<DeviceWithChecks | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;
  getDevicesByLocation(location: string): Promise<DeviceWithChecks[]>;
  getAllLocations(): Promise<string[]>;

  // Device check operations
  getDeviceChecks(deviceId?: string): Promise<DeviceCheckWithRelations[]>;
  createDeviceCheck(check: InsertDeviceCheck): Promise<DeviceCheck>;
  getOverdueDevices(): Promise<DeviceWithChecks[]>;
  getUpcomingChecks(daysAhead?: number): Promise<DeviceWithChecks[]>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalDevices: number;
    activeDevices: number;
    overdueChecks: number;
    completedThisWeek: number;
    devicesByLocation: Record<string, number>;
    recentChecks: DeviceCheckWithRelations[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Employee authentication operations
  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertEmployee.password, 12);
    
    const [employee] = await db
      .insert(employees)
      .values({
        ...insertEmployee,
        password: hashedPassword,
      })
      .returning();
    return employee;
  }

  async authenticateEmployee(credentials: LoginCredentials): Promise<Employee | null> {
    const employee = await this.getEmployeeByEmail(credentials.email);
    if (!employee) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, employee.password);
    if (!isValidPassword) return null;

    return employee;
  }

  // Device operations
  async getDevices(location?: string): Promise<DeviceWithChecks[]> {
    const query = db
      .select({
        device: devices,
        createdBy: employees,
      })
      .from(devices)
      .leftJoin(employees, eq(devices.createdBy, employees.id));

    const deviceResults = location 
      ? await query.where(eq(devices.location, location))
      : await query;

    // Get checks for each device and calculate next scheduled check
    const devicesWithChecks: DeviceWithChecks[] = [];
    
    for (const result of deviceResults) {
      const deviceChecksResult = await db
        .select({
          check: deviceChecks,
          checkedBy: employees,
        })
        .from(deviceChecks)
        .leftJoin(employees, eq(deviceChecks.checkedBy, employees.id))
        .where(eq(deviceChecks.deviceId, result.device.id))
        .orderBy(desc(deviceChecks.completedDate));

      const checks = deviceChecksResult.map(cr => cr.check);

      const lastCheck = checks[0] || null;
      const nextScheduledCheck = lastCheck 
        ? new Date(lastCheck.completedDate.getTime() + (result.device.plannedFrequencyWeeks * 7 * 24 * 60 * 60 * 1000))
        : new Date(result.device.createdAt!.getTime() + (result.device.plannedFrequencyWeeks * 7 * 24 * 60 * 60 * 1000));

      const isOverdue = nextScheduledCheck < new Date();

      devicesWithChecks.push({
        ...result.device,
        checks,
        createdBy: result.createdBy,
        lastCheck,
        nextScheduledCheck,
        isOverdue,
      });
    }

    return devicesWithChecks;
  }

  async getDeviceById(id: string): Promise<DeviceWithChecks | undefined> {
    const allDevices = await this.getDevices();
    return allDevices.find(d => d.id === id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db
      .insert(devices)
      .values(insertDevice)
      .returning();
    return device;
  }

  async updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device | undefined> {
    const [updated] = await db
      .update(devices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDevice(id: string): Promise<boolean> {
    // First delete all related checks
    await db.delete(deviceChecks).where(eq(deviceChecks.deviceId, id));
    
    // Then delete the device
    const result = await db.delete(devices).where(eq(devices.id, id));
    return result.rowCount! > 0;
  }

  async getDevicesByLocation(location: string): Promise<DeviceWithChecks[]> {
    return this.getDevices(location);
  }

  async getAllLocations(): Promise<string[]> {
    const result = await db
      .select({ location: devices.location })
      .from(devices)
      .groupBy(devices.location);
    
    return result.map(r => r.location);
  }

  // Device check operations
  async getDeviceChecks(deviceId?: string): Promise<DeviceCheckWithRelations[]> {
    const query = db
      .select({
        check: deviceChecks,
        device: devices,
        checkedBy: employees,
      })
      .from(deviceChecks)
      .leftJoin(devices, eq(deviceChecks.deviceId, devices.id))
      .leftJoin(employees, eq(deviceChecks.checkedBy, employees.id))
      .orderBy(desc(deviceChecks.completedDate));

    const results = deviceId 
      ? await query.where(eq(deviceChecks.deviceId, deviceId))
      : await query;

    return results.map(r => ({
      ...r.check,
      device: r.device!,
      checkedBy: r.checkedBy!,
    }));
  }

  async createDeviceCheck(insertCheck: InsertDeviceCheck): Promise<DeviceCheck> {
    const [check] = await db
      .insert(deviceChecks)
      .values(insertCheck)
      .returning();
    return check;
  }

  async getOverdueDevices(): Promise<DeviceWithChecks[]> {
    const allDevices = await this.getDevices();
    return allDevices.filter(d => d.isOverdue);
  }

  async getUpcomingChecks(daysAhead = 7): Promise<DeviceWithChecks[]> {
    const allDevices = await this.getDevices();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return allDevices.filter(d => 
      d.nextScheduledCheck && 
      d.nextScheduledCheck <= futureDate && 
      d.nextScheduledCheck >= now &&
      !d.isOverdue
    );
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalDevices: number;
    activeDevices: number;
    overdueChecks: number;
    completedThisWeek: number;
    devicesByLocation: Record<string, number>;
    recentChecks: DeviceCheckWithRelations[];
  }> {
    const allDevices = await this.getDevices();
    const totalDevices = allDevices.length;
    const activeDevices = allDevices.filter(d => d.status === 'active').length;
    const overdueChecks = allDevices.filter(d => d.isOverdue).length;

    // Get completed checks this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentChecksResult = await db
      .select({
        check: deviceChecks,
        device: devices,
        checkedBy: employees,
      })
      .from(deviceChecks)
      .leftJoin(devices, eq(deviceChecks.deviceId, devices.id))
      .leftJoin(employees, eq(deviceChecks.checkedBy, employees.id))
      .where(gte(deviceChecks.completedDate, oneWeekAgo))
      .orderBy(desc(deviceChecks.completedDate))
      .limit(10);

    const recentChecks: DeviceCheckWithRelations[] = recentChecksResult.map(r => ({
      ...r.check,
      device: r.device!,
      checkedBy: r.checkedBy!,
    }));

    const completedThisWeek = recentChecks.length;

    // Group devices by location
    const devicesByLocation: Record<string, number> = {};
    allDevices.forEach(device => {
      devicesByLocation[device.location] = (devicesByLocation[device.location] || 0) + 1;
    });

    return {
      totalDevices,
      activeDevices,
      overdueChecks,
      completedThisWeek,
      devicesByLocation,
      recentChecks,
    };
  }
}

// Use database storage for production
export const storage = new DatabaseStorage();