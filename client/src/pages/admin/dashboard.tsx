import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import UsersTable from "@/components/dashboard/users-table";
import ActivityFeed from "@/components/dashboard/activity-feed";
import PropertyCard from "@/components/properties/property-card";
import { Building, FileText, Users, Drill } from "lucide-react";
import { DashboardData, Property, User } from "@/types";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    onSuccess: (data) => {
      trackEvent("view_dashboard", "admin", "admin_dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: User) => {
    // Navigate to user edit page
    window.location.href = `/admin/users/${user.id}`;
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiRequest("DELETE", `/api/users/${userId}`);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Update the user list
      setRecentUsers(recentUsers.filter(user => user.id !== userId));
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Example recent activities
  const recentActivities = [
    {
      id: "1",
      type: "property",
      title: "New property added",
      description: "Urban Heights, 234 Main St",
      timestamp: "Just now"
    },
    {
      id: "2",
      type: "lease",
      title: "Lease signed",
      description: "John Doe signed a 12-month lease",
      timestamp: "30 minutes ago"
    },
    {
      id: "3",
      type: "maintenance",
      title: "Maintenance request",
      description: "Broken heater at Sunset Apartments #304",
      timestamp: "2 hours ago"
    },
    {
      id: "4",
      type: "payment",
      title: "Payment received",
      description: "$1,250 from Amanda Lee",
      timestamp: "6 hours ago"
    },
    {
      id: "5",
      type: "user",
      title: "New user registered",
      description: "Sophie Taylor created an account",
      timestamp: "1 day ago"
    }
  ];

  return (
    <>
      <SEO 
        title="Admin Dashboard" 
        description="Overview of the property management system stats and activities" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium">Admin Dashboard</h1>
          <p className="text-neutral-mid">Overview of your property management system</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Properties"
            value={data?.stats.properties || 0}
            icon={Building}
            iconColor="primary"
            trend={{
              type: "up",
              value: "8% from last month"
            }}
          />
          
          <StatsCard 
            title="Active Leases"
            value={data?.stats.leases || 0}
            icon={FileText}
            iconColor="secondary"
            trend={{
              type: "up",
              value: "12% from last month"
            }}
          />
          
          <StatsCard 
            title="Total Tenants"
            value={data?.stats.tenants || 0}
            icon={Users}
            iconColor="accent"
            trend={{
              type: "down",
              value: "3% from last month"
            }}
          />
          
          <StatsCard 
            title="Maintenance Requests"
            value={data?.stats.maintenance || 0}
            icon={Drill}
            iconColor="destructive"
            trend={{
              type: "neutral",
              value: "Same as last month"
            }}
          />
        </div>
        
        {/* Data Tables and Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Users Table */}
          <div className="lg:col-span-2">
            <UsersTable 
              users={data?.recentUsers || []}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onViewAll={() => window.location.href = "/admin/users"}
            />
          </div>
          
          {/* Activity Feed */}
          <div>
            <ActivityFeed 
              activities={recentActivities}
              onViewAll={() => {/* View all activities */}}
            />
          </div>
        </div>
        
        {/* Properties Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Recent Properties</h2>
            <Button variant="link" className="text-primary hover:text-primary-dark flex items-center" asChild>
              <Link href="/properties">
                <span>View all properties</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.recentProperties?.slice(0, 3).map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            
            {(!data?.recentProperties || data.recentProperties.length === 0) && (
              <div className="col-span-3 py-8 text-center">
                <p className="text-neutral-mid">No properties found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
