// Common types used throughout the application

// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'tenant';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string | null;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// Property related types
export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description?: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'townhouse';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  features: string[];
  images: string[];
  status: 'available' | 'leased' | 'maintenance';
  createdAt: string;
}

// Tenant related types
export interface Tenant {
  id: number;
  userId: number;
  phone?: string;
  emergencyContact?: string;
  createdAt: string;
}

// Lease related types
export interface Lease {
  id: number;
  propertyId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit?: number;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  documents: string[];
  createdAt: string;
}

// Maintenance related types
export interface MaintenanceRequest {
  id: number;
  propertyId: number;
  tenantId: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string | null;
}

// Dashboard related types
export interface DashboardData {
  stats: {
    properties: number;
    leases: number;
    tenants: number;
    maintenance: number;
  };
  recentUsers: User[];
  recentProperties: Property[];
}

// User role type guard functions
export const isAdmin = (user?: User | null): boolean => {
  return user?.role === 'admin';
};

export const isTenant = (user?: User | null): boolean => {
  return user?.role === 'tenant';
};

// Helper functions
export const getUserInitials = (user?: User | null): string => {
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`;
  }
  
  if (user.firstName) {
    return user.firstName[0];
  }
  
  if (user.lastName) {
    return user.lastName[0];
  }
  
  return user.username.substring(0, 2).toUpperCase();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
