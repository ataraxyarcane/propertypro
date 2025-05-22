import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { isAdmin } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, RefreshCw, User, Phone, Mail, Check, Calendar, FileText } from "lucide-react";
import SEO from "@/components/seo";
import { useState } from "react";
import { formatDate } from "@/types";

interface Tenant {
  id: number;
  userId: number;
  phone?: string;
  emergencyContact?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
    username: string;
  };
}

export default function Tenants() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Only admins can see the tenant list
  const isUserAdmin = isAdmin(user);

  const { data: tenants, isLoading, isError, refetch } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: isUserAdmin,
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    },
  });

  // Get user details for each tenant (in a real app, this would be part of the API response)
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: isUserAdmin && !!tenants,
  });

  // Combine tenant data with user data
  const tenantsWithUserDetails = tenants?.map(tenant => {
    // Find matching user
    const matchingUser = users?.find((u: any) => u.id === tenant.userId);
    
    return {
      ...tenant,
      user: matchingUser
    };
  });

  // Filter tenants based on search query
  const filteredTenants = tenantsWithUserDetails?.filter(tenant => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    return (
      tenant.user?.firstName?.toLowerCase().includes(searchTerm) ||
      tenant.user?.lastName?.toLowerCase().includes(searchTerm) ||
      tenant.user?.email.toLowerCase().includes(searchTerm) ||
      tenant.user?.username.toLowerCase().includes(searchTerm) ||
      tenant.phone?.includes(searchTerm)
    );
  });

  if (!isUserAdmin) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-mid">You don't have permission to view this page</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Tenants" 
        description="Manage property tenants and their information" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium">Tenants</h1>
            <p className="text-neutral-mid">Manage property tenants and their information</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button className="bg-primary hover:bg-primary-dark flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Tenant
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <CardTitle className="text-xl">Tenant Directory</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-mid" />
                <Input
                  placeholder="Search tenants..."
                  className="pl-8 w-full md:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="secondary"
                size="icon"
                onClick={() => refetch()}
                className="md:ml-2"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-neutral-mid">Loading tenants...</p>
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <p className="text-destructive">Error loading tenants. Please try again.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : filteredTenants && filteredTenants.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Emergency Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map(tenant => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary-light text-white flex items-center justify-center mr-3">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {tenant.user?.firstName} {tenant.user?.lastName || ""}
                              </p>
                              <p className="text-xs text-neutral-mid">
                                {tenant.user?.username || `User ID: ${tenant.userId}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-neutral-mid" />
                              {tenant.user?.email || "No email"}
                            </p>
                            <p className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-neutral-mid" />
                              {tenant.phone || "No phone"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {tenant.emergencyContact || "Not provided"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
                            <span>Active</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {formatDate(tenant.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              Leases
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-neutral-mid">
                  {searchQuery ? "No tenants match your search" : "No tenants found"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
