import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { isAdmin } from "@/types";
import { Property, DashboardData } from "@/types";
import PropertyCard from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building, FileText, Drill, Users } from "lucide-react";
import SEO from "@/components/seo";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
  const { user } = useAuth();

  // Redirect admins to admin dashboard
  const isUserAdmin = isAdmin(user);

  useEffect(() => {
    trackEvent('view_home', 'navigation', 'home_page');
  }, []);

  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: isUserAdmin,
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Display featured properties (3 most recent)
  const featuredProperties = properties?.slice(0, 3);

  return (
    <>
      <SEO 
        title="Home" 
        description="Find and manage your rental properties with ease"
        ogType="website" 
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to PropertyPro</h1>
          <p className="text-xl mb-8 text-neutral-mid">
            The complete property management solution for landlords and tenants
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-primary hover:bg-primary-dark">
              <Link href="/properties">Browse Properties</Link>
            </Button>
            
            {user ? (
              <Button asChild variant="outline">
                <Link href={isAdmin(user) ? "/admin/dashboard" : "/profile"}>
                  {isAdmin(user) ? "Go to Dashboard" : "My Account"}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/register">Create Account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      {isUserAdmin && dashboardData && (
        <div className="py-12 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">System Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 rounded-full bg-primary/10 mr-4">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-mid">Properties</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.properties}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 rounded-full bg-secondary/10 mr-4">
                    <FileText className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-mid">Active Leases</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.leases}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 rounded-full bg-accent/10 mr-4">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-mid">Tenants</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.tenants}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="p-3 rounded-full bg-destructive/10 mr-4">
                    <Drill className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-mid">Maintenance</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.maintenance}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Featured Properties Section */}
      <div className="py-12 px-4 bg-neutral-light">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Button variant="link" className="text-primary flex items-center" asChild>
              <Link href="/properties">
                View all properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {properties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              
              {!featuredProperties?.length && (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-neutral-mid">No properties available at this time</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-mid">Loading properties...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-12 px-4 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Why Choose PropertyPro?</h2>
          <p className="text-neutral-mid mb-10">Our comprehensive property management system offers everything you need</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Property Management</h3>
              <p className="text-neutral-mid">Easily manage all your properties in one place with detailed property listings</p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Lease Tracking</h3>
              <p className="text-neutral-mid">Keep track of all your leases, terms, and rental payments in a centralized system</p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <Drill className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Maintenance Requests</h3>
              <p className="text-neutral-mid">Streamlined maintenance request system for quick resolution of property issues</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of satisfied property managers and tenants</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!user ? (
              <>
                <Button asChild variant="secondary">
                  <Link href="/register">Create an Account</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="secondary">
                <Link href={isAdmin(user) ? "/admin/dashboard" : "/properties"}>
                  {isAdmin(user) ? "Go to Dashboard" : "Browse Properties"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
