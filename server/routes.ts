import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";
import { 
  insertUserSchema,
  insertPropertySchema,
  insertTenantSchema,
  insertLeaseSchema,
  insertMaintenanceRequestSchema
} from "@shared/schema";

// Express session middleware with memory store for simple setup
import MemoryStore from "memorystore";
const MemoryStoreSession = MemoryStore(session);

// JWT token functionality
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const SESSION_SECRET = process.env.SESSION_SECRET || "your-session-secret";

// Generate JWT token
function generateToken(user: { id: number; username: string; role: string }) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
}

// Auth middleware
const authMiddleware = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Admin middleware
const adminMiddleware = (req: Request, res: Response, next: Function) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admin privileges required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      resave: false,
      saveUninitialized: false,
      secret: SESSION_SECRET,
    })
  );

  // Property Owner Registration
  app.post("/api/auth/register-owner", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, companyName, phone, address, city, state, zipCode, website, description } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user account with property_owner role
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "property_owner",
      });

      // Create property owner profile (simplified for now)
      // In a full implementation, this would create a separate property owner record
      console.log('Property owner profile data:', {
        userId: user.id,
        companyName,
        phone,
        address,
        city,
        state,
        zipCode,
        website,
        description,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: "Property owner account created successfully",
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create property owner account" });
    }
  });

  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, use bcrypt.compare here
      // For demonstration, we're checking the hashed password directly
      if (user.password !== password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }

      if (user.status !== "active") {
        return res.status(403).json({ 
          message: "Account is not active. Please contact an administrator."
        });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

      // Send user info (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingByUsername = await storage.getUserByUsername(userData.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (userData.email) {
        const existingByEmail = await storage.getUserByEmail(userData.email);
        if (existingByEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password and default role
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userData.role || "tenant" // Default to tenant role
      });
      
      // Create tenant record if the role is tenant
      if (newUser.role === "tenant") {
        await storage.createTenant({
          userId: newUser.id,
          phone: "",
          emergencyContact: ""
        });
      }
      
      // Generate token for the new user
      const token = generateToken({
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      });
      
      // Return user without password and the token
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // User Routes (Admin Only)
  app.get("/api/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password: _, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Update user profile
  app.put("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { firstName, lastName, email, password, currentPassword } = req.body;
      
      // Users can only update their own profile, unless they're admin
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prepare update data
      const updateData: any = {};
      
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      
      // Handle password change
      if (password && currentPassword) {
        const bcrypt = require('bcrypt');
        const isValidPassword = await bcrypt.compare(currentPassword, existingUser.password);
        
        if (!isValidPassword) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Error updating user" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.get("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow admins to view other user profiles
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.put("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow admins to update other user profiles
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If password is being updated, hash it
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      
      // Don't allow role changes unless admin
      if (req.body.role && req.user.role !== "admin") {
        delete req.body.role;
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Error updating user" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow deleting your own account via this endpoint
      if (req.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user is a tenant, check if they have active leases
      if (user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(userId);
        
        if (tenant) {
          const activeLeases = await storage.getLeasesForTenant(tenant.id);
          
          if (activeLeases.length > 0) {
            return res.status(400).json({ 
              message: "Cannot delete user with active leases" 
            });
          }
          
          // Delete tenant record
          await storage.deleteTenant(tenant.id);
        }
      }
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Error deleting user" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Property Routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property" });
    }
  });

  app.post("/api/properties", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      
      // Only allow property owners and admins to create properties
      if (user.role !== 'property_owner' && user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied: Property owner or admin privileges required" });
      }
      
      const propertyData = insertPropertySchema.parse(req.body);
      
      // Set the owner ID to the current user (unless admin is creating for someone else)
      if (user.role === 'property_owner') {
        propertyData.ownerId = user.id;
      }
      
      const newProperty = await storage.createProperty(propertyData);
      res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error creating property" });
    }
  });

  app.put("/api/properties/:id", authMiddleware, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const user = req.user;
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Only allow admins or the property owner to edit the property
      if (user.role !== 'admin' && property.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied: You can only edit properties you own" });
      }
      
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      
      if (!updatedProperty) {
        return res.status(500).json({ message: "Error updating property" });
      }
      
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error updating property" });
    }
  });

  app.delete("/api/properties/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check for active leases
      const activeLeases = await storage.getLeasesForProperty(propertyId);
      
      if (activeLeases.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete property with active leases" 
        });
      }
      
      const deleted = await storage.deleteProperty(propertyId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Error deleting property" });
      }
      
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting property" });
    }
  });

  // Lease Routes
  app.get("/api/leases", authMiddleware, async (req, res) => {
    try {
      let leases;
      
      // If tenant, only return their leases
      if (req.user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant) {
          return res.json([]);
        }
        
        leases = await storage.getLeasesForTenant(tenant.id);
      } else {
        leases = await storage.getLeases();
      }
      
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leases" });
    }
  });

  app.get("/api/leases/:id", authMiddleware, async (req, res) => {
    try {
      const leaseId = parseInt(req.params.id);
      const lease = await storage.getLease(leaseId);
      
      if (!lease) {
        return res.status(404).json({ message: "Lease not found" });
      }
      
      // If tenant, ensure they can only view their own leases
      if (req.user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant || lease.tenantId !== tenant.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      res.json(lease);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lease" });
    }
  });

  app.post("/api/leases", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const leaseData = insertLeaseSchema.parse(req.body);
      
      // Verify property exists
      const property = await storage.getProperty(leaseData.propertyId);
      if (!property) {
        return res.status(400).json({ message: "Property not found" });
      }
      
      // Verify tenant exists
      const tenant = await storage.getTenant(leaseData.tenantId);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }
      
      // Check for existing active leases for this property
      if (property.status !== "available") {
        return res.status(400).json({ message: "Property is not available" });
      }
      
      const newLease = await storage.createLease(leaseData);
      
      // Update property status to leased
      await storage.updateProperty(property.id, { status: "leased" });
      
      res.status(201).json(newLease);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error creating lease" });
    }
  });

  app.put("/api/leases/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const leaseId = parseInt(req.params.id);
      const lease = await storage.getLease(leaseId);
      
      if (!lease) {
        return res.status(404).json({ message: "Lease not found" });
      }
      
      const updatedLease = await storage.updateLease(leaseId, req.body);
      
      if (!updatedLease) {
        return res.status(500).json({ message: "Error updating lease" });
      }
      
      // If lease status changed to inactive/terminated, update property status
      if (lease.status === "active" && updatedLease.status !== "active") {
        await storage.updateProperty(lease.propertyId, { status: "available" });
      } else if (lease.status !== "active" && updatedLease.status === "active") {
        await storage.updateProperty(lease.propertyId, { status: "leased" });
      }
      
      res.json(updatedLease);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error updating lease" });
    }
  });

  app.delete("/api/leases/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const leaseId = parseInt(req.params.id);
      const lease = await storage.getLease(leaseId);
      
      if (!lease) {
        return res.status(404).json({ message: "Lease not found" });
      }
      
      const deleted = await storage.deleteLease(leaseId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Error deleting lease" });
      }
      
      // Update property status to available if lease was active
      if (lease.status === "active") {
        await storage.updateProperty(lease.propertyId, { status: "available" });
      }
      
      res.json({ message: "Lease deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting lease" });
    }
  });

  // Tenant Routes
  app.get("/api/tenants", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      
      if (user.role === "admin") {
        // Admins can see all tenants with user details
        const tenants = await storage.getTenantsWithUsers();
        res.json(tenants);
      } else if (user.role === "property_owner") {
        // Property owners can see tenants in their properties with user details
        const tenants = await storage.getTenantsWithUsersForOwner(user.id);
        res.json(tenants);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching tenants" });
    }
  });

  app.get("/api/tenants/:id", authMiddleware, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);
      const user = req.user;
      const tenant = await storage.getTenantWithUser(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // Access control: admins, property owners (for their tenants), or the tenant themselves
      if (user.role === "admin") {
        // Admins can view any tenant
      } else if (user.role === "property_owner") {
        // Property owners can view tenants in their properties
        const ownerTenants = await storage.getTenantsForOwner(user.id);
        const canAccess = ownerTenants.some(t => t.id === tenantId);
        if (!canAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        // Regular users can only view their own tenant profile
        const userTenant = await storage.getTenantByUserId(user.id);
        if (!userTenant || userTenant.id !== tenantId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tenant" });
    }
  });

  app.put("/api/tenants/:id", authMiddleware, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);
      const tenant = await storage.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // If not admin, ensure they can only update their own tenant profile
      if (req.user.role !== "admin") {
        const userTenant = await storage.getTenantByUserId(req.user.id);
        
        if (!userTenant || userTenant.id !== tenantId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const updatedTenant = await storage.updateTenant(tenantId, req.body);
      
      if (!updatedTenant) {
        return res.status(500).json({ message: "Error updating tenant" });
      }
      
      res.json(updatedTenant);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error updating tenant" });
    }
  });

  // Maintenance Request Routes
  app.get("/api/maintenance", authMiddleware, async (req, res) => {
    try {
      let requests;
      
      // If tenant, only return their requests
      if (req.user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant) {
          return res.json([]);
        }
        
        requests = await storage.getMaintenanceRequestsForTenant(tenant.id);
      } else {
        requests = await storage.getMaintenanceRequests();
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance requests" });
    }
  });

  app.get("/api/maintenance/:id", authMiddleware, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getMaintenanceRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // If tenant, ensure they can only view their own requests
      if (req.user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant || request.tenantId !== tenant.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance request" });
    }
  });

  app.post("/api/maintenance", authMiddleware, async (req, res) => {
    try {
      const requestData = insertMaintenanceRequestSchema.parse(req.body);
      
      // If tenant, ensure they can only create requests for their properties
      if (req.user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant) {
          return res.status(403).json({ message: "Tenant profile not found" });
        }
        
        // Override tenantId with current user's tenant ID
        requestData.tenantId = tenant.id;
        
        // Verify the tenant has a lease for this property
        const leases = await storage.getLeasesForTenant(tenant.id);
        const hasLease = leases.some(lease => 
          lease.propertyId === requestData.propertyId && lease.status === "active"
        );
        
        if (!hasLease) {
          return res.status(403).json({ 
            message: "You can only create maintenance requests for properties you are leasing" 
          });
        }
      }
      
      // Verify property exists
      const property = await storage.getProperty(requestData.propertyId);
      if (!property) {
        return res.status(400).json({ message: "Property not found" });
      }
      
      // Verify tenant exists
      const tenant = await storage.getTenant(requestData.tenantId);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }
      
      const newRequest = await storage.createMaintenanceRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error creating maintenance request" });
    }
  });

  app.put("/api/maintenance/:id", authMiddleware, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getMaintenanceRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // If tenant, they can only update their own requests and can't change certain fields
      if (req.user.role === "tenant") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant || request.tenantId !== tenant.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        // Tenants can't change the status
        if (req.body.status && req.body.status !== request.status) {
          return res.status(403).json({ 
            message: "You don't have permission to update the status" 
          });
        }
      }
      
      // If status is changing to resolved, set resolvedAt timestamp
      if (req.body.status === "resolved" && request.status !== "resolved") {
        req.body.resolvedAt = new Date();
      }
      
      const updatedRequest = await storage.updateMaintenanceRequest(requestId, req.body);
      
      if (!updatedRequest) {
        return res.status(500).json({ message: "Error updating maintenance request" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error updating maintenance request" });
    }
  });

  app.delete("/api/maintenance/:id", authMiddleware, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getMaintenanceRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // Only admins or the tenant who created the request can delete it
      if (req.user.role !== "admin") {
        const tenant = await storage.getTenantByUserId(req.user.id);
        
        if (!tenant || request.tenantId !== tenant.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const deleted = await storage.deleteMaintenanceRequest(requestId);
      
      if (!deleted) {
        return res.status(500).json({ message: "Error deleting maintenance request" });
      }
      
      res.json({ message: "Maintenance request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting maintenance request" });
    }
  });

  // Dashboard Data
  app.get("/api/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const propertyCount = await storage.getPropertyCount();
      const activeLeaseCount = await storage.getActiveLeaseCount();
      const tenantCount = await storage.getTenantCount();
      const maintenanceRequestCount = await storage.getMaintenanceRequestCount();
      const recentUsers = await storage.getRecentUsers(10);
      
      // Remove passwords from user data
      const sanitizedUsers = recentUsers.map(({ password: _, ...user }) => user);
      
      // Get all properties for the recent properties section
      const properties = await storage.getProperties();
      
      res.json({
        stats: {
          properties: propertyCount,
          leases: activeLeaseCount,
          tenants: tenantCount,
          maintenance: maintenanceRequestCount
        },
        recentUsers: sanitizedUsers,
        recentProperties: properties
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  });

  // Owner-specific statistics
  app.get('/api/owner/stats', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      if (userRole !== 'admin' && userRole !== 'owner') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get all properties for this owner
      const allProperties = await storage.getProperties();
      const ownerProperties = userRole === 'admin' ? allProperties : allProperties.filter(p => p.ownerId === userId);
      
      // Get all leases for owner's properties
      const allLeases = await storage.getLeases();
      const ownerLeases = allLeases.filter(lease => 
        ownerProperties.some(prop => prop.id === lease.propertyId)
      );
      
      // Calculate statistics
      const totalProperties = ownerProperties.length;
      const availableProperties = ownerProperties.filter(p => p.status === 'available').length;
      const leasedProperties = ownerProperties.filter(p => p.status === 'leased').length;
      const activeLeases = ownerLeases.filter(l => l.status === 'active');
      const totalTenants = activeLeases.length;
      const monthlyRevenue = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);
      
      // Get maintenance requests for owner's properties
      const allMaintenance = await storage.getMaintenanceRequests();
      const ownerMaintenance = allMaintenance.filter(request => 
        ownerProperties.some(prop => prop.id === request.propertyId)
      );
      const maintenanceRequests = ownerMaintenance.filter(m => m.status === 'pending').length;
      
      res.json({
        totalProperties,
        availableProperties,
        leasedProperties,
        totalTenants,
        monthlyRevenue,
        maintenanceRequests
      });
    } catch (error) {
      console.error('Error fetching owner stats:', error);
      res.status(500).json({ message: 'Failed to fetch owner statistics' });
    }
  });

  // Lease Applications API endpoints
  app.get('/api/lease-applications', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { property, user: userParam } = req.query;
      
      let applications = await storage.getLeaseApplications();
      
      // Filter by property if requested
      if (property) {
        const propertyId = parseInt(property as string);
        applications = await storage.getLeaseApplicationsForProperty(propertyId);
        
        // Check if user owns this property or is admin
        const propertyDetails = await storage.getProperty(propertyId);
        if (userRole !== 'admin' && propertyDetails?.ownerId !== userId) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      // Filter by user if requested
      if (userParam) {
        const requestedUserId = parseInt(userParam as string);
        // Users can only see their own applications, unless they're admin
        if (userRole !== 'admin' && userId !== requestedUserId) {
          return res.status(403).json({ message: 'Access denied' });
        }
        applications = await storage.getLeaseApplicationsForUser(requestedUserId);
      }
      
      // If no specific filters and not admin, show only user's applications
      if (!property && !userParam && userRole !== 'admin') {
        applications = await storage.getLeaseApplicationsForUser(userId);
      }
      
      res.json(applications);
    } catch (error) {
      console.error('Error fetching lease applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  app.post('/api/lease-applications', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      const applicationData = req.body;
      
      // Verify the applicant is the current user
      if (applicationData.applicantId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if property exists and is available
      const property = await storage.getProperty(applicationData.propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user already has a pending application for this property
      const existingApplications = await storage.getLeaseApplicationsForUser(userId);
      const hasExisting = existingApplications.some(app => 
        app.propertyId === applicationData.propertyId && app.status !== 'withdrawn'
      );
      
      if (hasExisting) {
        return res.status(400).json({ message: 'You already have an application for this property' });
      }
      
      const application = await storage.createLeaseApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating lease application:', error);
      res.status(500).json({ message: 'Failed to create application' });
    }
  });

  app.get('/api/lease-applications/:id', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const applicationId = parseInt(req.params.id);
      
      const application = await storage.getLeaseApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Check access permissions
      const property = await storage.getProperty(application.propertyId);
      const canAccess = userRole === 'admin' || 
                       application.applicantId === userId || 
                       property?.ownerId === userId;
      
      if (!canAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(application);
    } catch (error) {
      console.error('Error fetching lease application:', error);
      res.status(500).json({ message: 'Failed to fetch application' });
    }
  });

  app.put('/api/lease-applications/:id', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const applicationId = parseInt(req.params.id);
      const updateData = req.body;
      
      const application = await storage.getLeaseApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Check permissions
      const property = await storage.getProperty(application.propertyId);
      const isOwner = property?.ownerId === userId;
      const isApplicant = application.applicantId === userId;
      const isAdmin = userRole === 'admin';
      
      // Applicants can only update certain fields and only if status is pending
      if (isApplicant && !isOwner && !isAdmin) {
        if (application.status !== 'pending') {
          return res.status(400).json({ message: 'Cannot update application after review' });
        }
        // Restrict fields that applicants can update
        const allowedFields = ['motivation', 'additionalComments', 'desiredMoveInDate', 'leaseDuration'];
        const restrictedUpdate = Object.keys(updateData).every(key => allowedFields.includes(key));
        if (!restrictedUpdate) {
          return res.status(403).json({ message: 'Access denied to update these fields' });
        }
      } else if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Property owners and admins can update status
      if ((isOwner || isAdmin) && updateData.status) {
        updateData.reviewedBy = userId;
        updateData.reviewedAt = new Date();
      }
      
      const updatedApplication = await storage.updateLeaseApplication(applicationId, updateData);
      res.json(updatedApplication);
    } catch (error) {
      console.error('Error updating lease application:', error);
      res.status(500).json({ message: 'Failed to update application' });
    }
  });

  app.delete('/api/lease-applications/:id', authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const applicationId = parseInt(req.params.id);
      
      const application = await storage.getLeaseApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Only applicants can withdraw their own applications or admins can delete any
      if (userRole !== 'admin' && application.applicantId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const deleted = await storage.deleteLeaseApplication(applicationId);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete application' });
      }
      
      res.json({ message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Error deleting lease application:', error);
      res.status(500).json({ message: 'Failed to delete application' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
