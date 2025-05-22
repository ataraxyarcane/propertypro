import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import LoginForm from './login-form';
import { useLocation } from 'wouter';

interface AuthOverlayProps {
  children: React.ReactNode;
}

export default function AuthOverlay({ children }: AuthOverlayProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(location);
  
  // Effect to redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      // Redirect happens in the next tick to avoid rendering issues
      setTimeout(() => window.location.href = '/login', 0);
    }
  }, [isAuthenticated, isLoading, isPublicRoute, location]);
  
  // If on a public route or authenticated, show the children
  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>;
  }
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    );
  }
  
  // Show login overlay if not authenticated and not on a public route
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="p-8 max-w-md w-full mx-4">
        <LoginForm />
      </div>
    </div>
  );
}
