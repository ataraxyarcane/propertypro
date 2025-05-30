import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("tenant"),
  status: text("status").notNull().default("active"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

// Properties
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().default(1),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  description: text("description"),
  propertyType: text("property_type").notNull(),
  price: doublePrecision("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: doublePrecision("bathrooms"),
  squareMeters: integer("square_meters"),
  features: text("features").array(),
  images: text("images").array(),
  status: text("status").notNull().default("available"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPropertySchema = createInsertSchema(properties)
  .omit({
    id: true,
    createdAt: true,
    isApproved: true,
  })
  .extend({
    propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse', 'detached', 'semi-detached']),
  });

// Property Owners
export const propertyOwners = pgTable("property_owners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  companyName: text("company_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  website: text("website"),
  description: text("description"),
  verificationStatus: text("verification_status").notNull().default("pending"), // 'pending', 'verified', 'rejected'
  documentsSubmitted: boolean("documents_submitted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPropertyOwnerSchema = createInsertSchema(propertyOwners).omit({
  id: true,
  createdAt: true,
});

// Tenants
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  dateOfBirth: timestamp("date_of_birth"),
  occupation: text("occupation"),
  monthlyIncome: doublePrecision("monthly_income"),
  employerName: text("employer_name"),
  employerPhone: text("employer_phone"),
  previousAddress: text("previous_address"),
  moveInDate: timestamp("move_in_date"),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // 'active', 'inactive', 'pending'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Rent Payments
export const rentPayments = pgTable("rent_payments", {
  id: serial("id").primaryKey(),
  leaseId: integer("lease_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  paymentMethod: text("payment_method"), // 'stripe', 'bank_transfer', 'cash', 'check'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'late', 'failed'
  lateFee: doublePrecision("late_fee").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRentPaymentSchema = createInsertSchema(rentPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Leases
export const leases = pgTable("leases", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRent: doublePrecision("monthly_rent").notNull(),
  securityDeposit: doublePrecision("security_deposit"),
  status: text("status").notNull().default("active"),
  documents: text("documents").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaseSchema = createInsertSchema(leases).omit({
  id: true,
  createdAt: true,
});

// Maintenance Requests
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id"), // Made optional for property owner requests
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true, 
  createdAt: true,
  resolvedAt: true,
});

// Lease Applications
export const leaseApplications = pgTable("lease_applications", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  applicantId: integer("applicant_id").notNull(),
  
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  
  // Employment Information
  employmentStatus: text("employment_status").notNull(),
  employer: text("employer"),
  jobTitle: text("job_title"),
  monthlyIncome: doublePrecision("monthly_income").notNull(),
  employmentDuration: text("employment_duration"),
  
  // References
  previousLandlord: text("previous_landlord"),
  previousLandlordPhone: text("previous_landlord_phone"),
  emergencyContact: text("emergency_contact").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  
  // Lease Details
  desiredMoveInDate: text("desired_move_in_date").notNull(),
  leaseDuration: integer("lease_duration").notNull(), // in months
  additionalOccupants: integer("additional_occupants").default(0),
  petsDescription: text("pets_description"),
  
  // Application Details
  motivation: text("motivation"),
  additionalComments: text("additional_comments"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, withdrawn
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
});

export const insertLeaseApplicationSchema = createInsertSchema(leaseApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type PropertyOwner = typeof propertyOwners.$inferSelect;
export type InsertPropertyOwner = z.infer<typeof insertPropertyOwnerSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Lease = typeof leases.$inferSelect;
export type InsertLease = z.infer<typeof insertLeaseSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type LeaseApplication = typeof leaseApplications.$inferSelect;
export type InsertLeaseApplication = z.infer<typeof insertLeaseApplicationSchema>;
export type RentPayment = typeof rentPayments.$inferSelect;
export type InsertRentPayment = z.infer<typeof insertRentPaymentSchema>;
