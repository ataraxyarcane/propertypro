import { useQuery } from "@tanstack/react-query";
import { Lease, Property, Tenant, formatCurrency, formatDate } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, FileText, Building, User, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-simple-auth";
import { isAdmin } from "@/types";
import SEO from "@/components/seo";

export default function Leases() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch leases
  const { data: leases, isLoading: isLoadingLeases, isError: isErrorLeases } = useQuery<Lease[]>({
    queryKey: ["/api/leases"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load leases",
        variant: "destructive",
      });
    },
  });

  // Fetch properties to display property details in lease cards
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch tenants to display tenant details in lease cards
  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: isAdmin(user), // Only fetch tenants if user is admin
  });

  // Helper function to get property details by ID
  const getPropertyById = (propertyId: number) => {
    return properties?.find(property => property.id === propertyId);
  };

  // Helper function to get tenant details by ID
  const getTenantById = (tenantId: number) => {
    return tenants?.find(tenant => tenant.id === tenantId);
  };

  // Helper function to get lease status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-white">Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-white">Pending</Badge>;
      case 'terminated':
        return <Badge className="bg-destructive text-white">Terminated</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <>
      <SEO 
        title="Leases" 
        description="Manage property leases and agreements" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium">Leases</h1>
            <p className="text-neutral-mid">Manage property leases and agreements</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            
            {isAdmin(user) && (
              <Button className="bg-primary hover:bg-primary-dark flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Lease
              </Button>
            )}
          </div>
        </div>
        
        {isLoadingLeases ? (
          <div className="py-12 text-center">
            <p className="text-neutral-mid">Loading leases...</p>
          </div>
        ) : isErrorLeases ? (
          <div className="py-12 text-center">
            <p className="text-destructive">Error loading leases</p>
          </div>
        ) : leases && leases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leases.map(lease => {
              const property = getPropertyById(lease.propertyId);
              
              return (
                <Card key={lease.id} className="overflow-hidden">
                  <div className="bg-primary h-2"></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Lease #{lease.id}
                      </CardTitle>
                      {getStatusBadge(lease.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 mr-2 text-neutral-mid flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{property?.name || `Property #${lease.propertyId}`}</p>
                        <p className="text-sm text-neutral-mid">
                          {property ? `${property.address}, ${property.city}` : "Loading property details..."}
                        </p>
                      </div>
                    </div>
                    
                    {isAdmin(user) && (
                      <div className="flex items-start">
                        <User className="h-5 w-5 mr-2 text-neutral-mid flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Tenant #{lease.tenantId}</p>
                          <p className="text-sm text-neutral-mid">
                            {/* Would show tenant name in a real implementation */}
                            {getTenantById(lease.tenantId) ? "Tenant details" : "Loading tenant details..."}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-neutral-mid flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Lease Period</p>
                        <p className="text-sm text-neutral-mid">
                          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 mr-2 text-neutral-mid flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Monthly Rent</p>
                        <p className="text-sm text-neutral-mid">
                          {formatCurrency(lease.monthlyRent)}
                          {lease.securityDeposit && ` (Deposit: ${formatCurrency(lease.securityDeposit)})`}
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-neutral-mid">No leases found</p>
            {isAdmin(user) && (
              <Button className="mt-4 bg-primary hover:bg-primary-dark">Create Your First Lease</Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
