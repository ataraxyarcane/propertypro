import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceRequest, Property } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-simple-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench, Building, Calendar, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { formatDate } from "@/types";
import { Link } from "wouter";
import SEO from "@/components/seo";
import { apiRequest } from "@/lib/queryClient";

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get maintenance requests with proper authentication
  const { data: requests = [], isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ['/api/maintenance'],
    retry: 1,
  });

  // Get properties for filtering (owner's properties only)
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const ownerProperties = properties.filter(property => 
    user?.role === 'admin' || property.ownerId === user?.id
  );

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : null
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Maintenance request status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Filter requests for property owners (only their properties)
  const ownerFilteredRequests = user?.role === 'admin' 
    ? requests 
    : requests.filter(request => 
        ownerProperties.some(property => property.id === request.propertyId)
      );

  const filteredRequests = ownerFilteredRequests.filter(request => {
    const statusMatch = statusFilter === "all" || request.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || request.priority === priorityFilter;
    const propertyMatch = propertyFilter === "all" || request.propertyId.toString() === propertyFilter;
    return statusMatch && priorityMatch && propertyMatch;
  });

  // Helper function to get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-destructive text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-white">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary text-white">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-success text-white">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'in_progress':
        return <Drill className="h-5 w-5 text-primary" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-neutral-mid" />;
    }
  };

  return (
    <>
      <SEO 
        title="Maintenance Requests" 
        description="Manage property maintenance and service requests" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium">Maintenance Requests</h1>
            <p className="text-neutral-mid">Manage property maintenance and service requests</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="bg-primary hover:bg-primary-dark flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-neutral-mid">Loading maintenance requests...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-destructive">Error loading maintenance requests</p>
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(request => {
              const property = getPropertyById(request.propertyId);
              
              return (
                <Card key={request.id} className="overflow-hidden">
                  <div className={
                    request.priority === 'high' ? "bg-destructive h-2" :
                    request.priority === 'medium' ? "bg-warning h-2" :
                    "bg-secondary h-2"
                  }></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-neutral-mid">
                      {request.description.length > 100 
                        ? `${request.description.substring(0, 100)}...` 
                        : request.description}
                    </p>
                    
                    <div className="flex items-start">
                      <Building className="h-5 w-5 mr-2 text-neutral-mid flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{property?.name || `Property #${request.propertyId}`}</p>
                        <p className="text-sm text-neutral-mid">
                          {property ? `${property.address}, ${property.city}` : "Loading property details..."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-neutral-mid" />
                        <span className="text-sm text-neutral-mid">{formatDate(request.createdAt)}</span>
                      </div>
                      <div>
                        {getPriorityBadge(request.priority)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className="ml-2 text-sm">
                          {request.status === 'pending' ? 'Awaiting review' :
                           request.status === 'in_progress' ? 'Work in progress' :
                           'Completed'}
                        </span>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-neutral-mid">No maintenance requests found</p>
            <Button className="mt-4 bg-primary hover:bg-primary-dark">Create Your First Request</Button>
          </div>
        )}
      </div>
    </>
  );
}
