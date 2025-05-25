import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSettings from "@/pages/admin/settings";
import Properties from "@/pages/properties/index";
import PropertyDetails from "@/pages/properties/[id]";
import AddProperty from "@/pages/properties/add";
import EditProperty from "@/pages/properties/edit";
import ApplyForProperty from "@/pages/properties/apply";
import PropertyOwnerRegister from "@/pages/owner/register";
import OwnerDashboard from "@/pages/owner/dashboard";
import MyProperties from "@/pages/owner/my-properties";
import Leases from "@/pages/leases/index";
import Tenants from "@/pages/tenants/index";
import AddTenant from "@/pages/tenants/add";
import Maintenance from "@/pages/maintenance/index";
import AddMaintenanceRequest from "@/pages/maintenance/add";
import Profile from "@/pages/profile/index";
import Settings from "@/pages/settings";
import AuthOverlay from "@/components/auth/auth-overlay";
import { AuthProvider, useAuth } from "@/hooks/use-simple-auth";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { useLocation } from "wouter";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/settings" component={AdminSettings} />
      
      {/* Property routes */}
      <Route path="/properties" component={Properties} />
      <Route path="/properties/add" component={AddProperty} />
      <Route path="/properties/:id/edit" component={EditProperty} />
      <Route path="/properties/:id/apply" component={ApplyForProperty} />
      <Route path="/properties/:id" component={PropertyDetails} />
      
      {/* Property Owner routes */}
      <Route path="/owner/register" component={PropertyOwnerRegister} />
      <Route path="/owner/dashboard" component={OwnerDashboard} />
      <Route path="/owner/properties" component={MyProperties} />
      
      {/* Other management routes */}
      <Route path="/leases" component={Leases} />
      <Route path="/tenants" component={Tenants} />
      <Route path="/tenants/add" component={AddTenant} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/maintenance/add" component={AddMaintenanceRequest} />
      
      {/* User account routes */}
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location);
  
  // Effect to redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading, isPublicRoute, location]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    );
  }
  
  // If on a public route or authenticated, show the app
  if (isPublicRoute || isAuthenticated) {
    return (
      <Layout>
        <Router />
      </Layout>
    );
  }
  
  // Fallback loading state
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-xl font-medium">Redirecting...</div>
    </div>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
