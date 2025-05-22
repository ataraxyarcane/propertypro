import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Header from './header';
import Sidebar from './sidebar';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // List of routes that don't show the layout
  const noLayoutRoutes = ['/login', '/register', '/forgot-password'];
  const shouldShowLayout = isAuthenticated && !noLayoutRoutes.includes(location);
  
  if (!shouldShowLayout) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        user={user}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto bg-neutral-light">
          {children}
        </main>
      </div>
    </div>
  );
}
