import { 
  users, User, InsertUser, 
  properties, Property, InsertProperty,
  tenants, Tenant, InsertTenant,
  leases, Lease, InsertLease,
  maintenanceRequests, MaintenanceRequest, InsertMaintenanceRequest
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Property operations
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Tenant operations
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByUserId(userId: number): Promise<Tenant | undefined>;
  getTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenantData: Partial<Tenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;
  
  // Lease operations
  getLease(id: number): Promise<Lease | undefined>;
  getLeases(): Promise<Lease[]>;
  getLeasesForProperty(propertyId: number): Promise<Lease[]>;
  getLeasesForTenant(tenantId: number): Promise<Lease[]>;
  createLease(lease: InsertLease): Promise<Lease>;
  updateLease(id: number, leaseData: Partial<Lease>): Promise<Lease | undefined>;
  deleteLease(id: number): Promise<boolean>;
  
  // Maintenance operations
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsForProperty(propertyId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsForTenant(tenantId: number): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
  deleteMaintenanceRequest(id: number): Promise<boolean>;
  
  // Dashboard queries
  getPropertyCount(): Promise<number>;
  getActiveLeaseCount(): Promise<number>;
  getTenantCount(): Promise<number>;
  getMaintenanceRequestCount(): Promise<number>;
  getRecentUsers(limit: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private tenants: Map<number, Tenant>;
  private leases: Map<number, Lease>;
  private maintenanceRequests: Map<number, MaintenanceRequest>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private tenantIdCounter: number;
  private leaseIdCounter: number;
  private maintenanceRequestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.tenants = new Map();
    this.leases = new Map();
    this.maintenanceRequests = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.tenantIdCounter = 1;
    this.leaseIdCounter = 1;
    this.maintenanceRequestIdCounter = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      email: "admin@propertypro.com",
      password: "$2b$10$FxgUCcGy7geZoHgY8.Zs2eJ5LpNF7wpJaEiLoM7z.D2bc5NxNMRqG", // "password"
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      status: "active"
    });
    
    // Add a tenant user
    this.createUser({
      username: "tenant",
      email: "tenant@example.com",
      password: "$2b$10$FxgUCcGy7geZoHgY8.Zs2eJ5LpNF7wpJaEiLoM7z.D2bc5NxNMRqG", // "password"
      firstName: "John",
      lastName: "Doe",
      role: "tenant",
      status: "active"
    });
    
    // Add some sample properties
    this.createProperty({
      name: "Urban Heights",
      address: "234 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      description: "Modern luxury apartments in downtown",
      propertyType: "apartment",
      price: 2450,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 950,
      features: ["Pet friendly", "Gym", "Pool"],
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
      ],
      status: "available"
    });
    
    this.createProperty({
      name: "Sunset Villa",
      address: "567 Oak Drive",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      description: "Beautiful single family home with yard",
      propertyType: "house",
      price: 3200,
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2100,
      features: ["Garage", "Backyard", "Fireplace"],
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
      ],
      status: "available"
    });
    
    this.createProperty({
      name: "Marina Lofts",
      address: "789 Harbor Blvd",
      city: "Boston",
      state: "MA",
      zipCode: "02110",
      description: "Modern loft apartments near the harbor",
      propertyType: "apartment",
      price: 1850,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 750,
      features: ["Gym", "Rooftop Deck", "Laundry"],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
      ],
      status: "available"
    });
    
    // Add sample tenant
    this.createTenant({
      userId: 2,
      phone: "555-123-4567",
      emergencyContact: "Jane Doe: 555-987-6543"
    });
    
    // Add sample maintenance request
    this.createMaintenanceRequest({
      propertyId: 1,
      tenantId: 1,
      title: "Broken heater",
      description: "The heater in the living room is not working",
      priority: "high",
      status: "pending"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      lastLogin: null,
      role: insertUser.role || 'tenant',
      status: insertUser.status || 'active',
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date();
    const property: Property = { 
      ...insertProperty, 
      id, 
      createdAt: now,
      status: insertProperty.status || 'available',
      description: insertProperty.description || null,
      bedrooms: insertProperty.bedrooms || null,
      bathrooms: insertProperty.bathrooms || null,
      squareFeet: insertProperty.squareFeet || null,
      features: insertProperty.features || null,
      images: insertProperty.images || null
    };
    this.properties.set(id, property);
    return property;
  }
  
  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const property = await this.getProperty(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...propertyData };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }
  
  // Tenant operations
  async getTenant(id: number): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }
  
  async getTenantByUserId(userId: number): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(
      (tenant) => tenant.userId === userId
    );
  }
  
  async getTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }
  
  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = this.tenantIdCounter++;
    const now = new Date();
    const tenant: Tenant = { ...insertTenant, id, createdAt: now };
    this.tenants.set(id, tenant);
    return tenant;
  }
  
  async updateTenant(id: number, tenantData: Partial<Tenant>): Promise<Tenant | undefined> {
    const tenant = await this.getTenant(id);
    if (!tenant) return undefined;
    
    const updatedTenant = { ...tenant, ...tenantData };
    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }
  
  async deleteTenant(id: number): Promise<boolean> {
    return this.tenants.delete(id);
  }
  
  // Lease operations
  async getLease(id: number): Promise<Lease | undefined> {
    return this.leases.get(id);
  }
  
  async getLeases(): Promise<Lease[]> {
    return Array.from(this.leases.values());
  }
  
  async getLeasesForProperty(propertyId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      (lease) => lease.propertyId === propertyId
    );
  }
  
  async getLeasesForTenant(tenantId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      (lease) => lease.tenantId === tenantId
    );
  }
  
  async createLease(insertLease: InsertLease): Promise<Lease> {
    const id = this.leaseIdCounter++;
    const now = new Date();
    const lease: Lease = { ...insertLease, id, createdAt: now };
    this.leases.set(id, lease);
    return lease;
  }
  
  async updateLease(id: number, leaseData: Partial<Lease>): Promise<Lease | undefined> {
    const lease = await this.getLease(id);
    if (!lease) return undefined;
    
    const updatedLease = { ...lease, ...leaseData };
    this.leases.set(id, updatedLease);
    return updatedLease;
  }
  
  async deleteLease(id: number): Promise<boolean> {
    return this.leases.delete(id);
  }
  
  // Maintenance operations
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }
  
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values());
  }
  
  async getMaintenanceRequestsForProperty(propertyId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.propertyId === propertyId
    );
  }
  
  async getMaintenanceRequestsForTenant(tenantId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.tenantId === tenantId
    );
  }
  
  async createMaintenanceRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const id = this.maintenanceRequestIdCounter++;
    const now = new Date();
    const request: MaintenanceRequest = { 
      ...insertRequest, 
      id, 
      createdAt: now,
      resolvedAt: null 
    };
    this.maintenanceRequests.set(id, request);
    return request;
  }
  
  async updateMaintenanceRequest(id: number, requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const request = await this.getMaintenanceRequest(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestData };
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async deleteMaintenanceRequest(id: number): Promise<boolean> {
    return this.maintenanceRequests.delete(id);
  }
  
  // Dashboard queries
  async getPropertyCount(): Promise<number> {
    return this.properties.size;
  }
  
  async getActiveLeaseCount(): Promise<number> {
    return Array.from(this.leases.values()).filter(lease => lease.status === 'active').length;
  }
  
  async getTenantCount(): Promise<number> {
    return this.tenants.size;
  }
  
  async getMaintenanceRequestCount(): Promise<number> {
    return this.maintenanceRequests.size;
  }
  
  async getRecentUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
