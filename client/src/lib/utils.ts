import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// User permission utility functions
export const isAdmin = (user?: any | null): boolean => {
  return user?.role === 'admin';
};

export const isPropertyOwner = (user?: any | null): boolean => {
  return user?.role === 'property_owner';
};

export const canManageProperties = (user?: any | null): boolean => {
  return user?.role === 'admin' || user?.role === 'property_owner';
};

export const isTenant = (user?: any | null): boolean => {
  return user?.role === 'tenant';
};

// Utility functions for formatting
export const getUserInitials = (user?: any | null): string => {
  if (!user) return 'U';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  if (user.username) {
    return user.username.slice(0, 2).toUpperCase();
  }
  
  return 'U';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};
