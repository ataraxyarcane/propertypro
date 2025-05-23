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
import PropertyOwnerRegister from "@/pages/owner/register";
import OwnerDashboard from "@/pages/owner/dashboard";
import Leases from "@/pages/leases/index";
import Tenants from "@/pages/tenants/index";
import Maintenance from "@/pages/maintenance/index";
import Profile from "@/pages/profile/index";
import Settings from "@/pages/settings";
import AuthOverlay from "@/components/auth/auth-overlay";
import { AuthProvider } from "@/hooks/use-simple-auth";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

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
      <Route path="/properties/edit/:id" component={EditProperty} />
      <Route path="/properties/:id" component={PropertyDetails} />
      
      {/* Property Owner routes */}
      <Route path="/owner/register" component={PropertyOwnerRegister} />
      <Route path="/owner/dashboard" component={OwnerDashboard} />
      
      {/* Other management routes */}
      <Route path="/leases" component={Leases} />
      <Route path="/tenants" component={Tenants} />
      <Route path="/maintenance" component={Maintenance} />
      
      {/* User account routes */}
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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
          <Layout>
            <AuthOverlay>
              <Router />
            </AuthOverlay>
          </Layout>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
