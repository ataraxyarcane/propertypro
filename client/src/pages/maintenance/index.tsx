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

  const ownerProperties = properties.filter((property: any) => 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.name : `Property #${propertyId}`;
  };

  const getRequestStats = () => {
    const pending = ownerFilteredRequests.filter(r => r.status === 'pending').length;
    const inProgress = ownerFilteredRequests.filter(r => r.status === 'in_progress').length;
    const resolved = ownerFilteredRequests.filter(r => r.status === 'resolved').length;
    const high = ownerFilteredRequests.filter(r => r.priority === 'high').length;
    
    return { pending, inProgress, resolved, high };
  };

  const stats = getRequestStats();

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-mid">Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Maintenance Requests - PropertyPro"
        description="Manage property maintenance requests and track repair status."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Maintenance Requests</h1>
            <p className="text-neutral-mid">Track and manage property maintenance issues</p>
          </div>
          <Link href="/maintenance/add">
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-mid">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-mid">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-mid">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-mid">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{stats.high}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          {ownerProperties.length > 1 && (
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {ownerProperties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Maintenance Requests List */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-neutral-light mb-4" />
              <h3 className="text-lg font-medium text-neutral-dark mb-2">No maintenance requests</h3>
              <p className="text-neutral-mid mb-4">
                {ownerFilteredRequests.length === 0 
                  ? "No maintenance requests have been submitted for your properties yet."
                  : "No requests match your current filters."
                }
              </p>
              <Link href="/maintenance/add">
                <Button>Create First Request</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-neutral-dark">{request.title}</h3>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-neutral-mid">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {getPropertyName(request.propertyId)}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Tenant ID: {request.tenantId}
                        </div>
                      </div>
                      
                      <p className="text-neutral-mid mb-3">{request.description}</p>
                      
                      <div className="flex items-center text-sm text-neutral-mid">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {formatDate(request.createdAt)}
                        {request.resolvedAt && (
                          <>
                            <span className="mx-2">•</span>
                            Resolved {formatDate(request.resolvedAt)}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'in_progress' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Start Work
                        </Button>
                      )}
                      
                      {request.status === 'in_progress' && (
                        <Button 
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'resolved' })}
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Resolved
                        </Button>
                      )}

                      {request.status === 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'in_progress' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}