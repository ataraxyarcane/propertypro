import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-simple-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/types';

interface OwnerProperty {
  id: number;
  name: string;
  address: string;
  city: string;
  price: number;
  status: string;
  isApproved: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  images: string[];
  createdAt: string;
}

interface OwnerStats {
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  totalViews: number;
  totalInquiries: number;
  monthlyRevenue: number;
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch owner's properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/owner/properties'],
    enabled: !!user,
  });

  // Fetch owner stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/owner/stats'],
    enabled: !!user,
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return await apiRequest(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/stats'] });
      toast({
        title: 'Success',
        description: 'Property deleted successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete property',
      });
    },
  });

  const handleDeleteProperty = (propertyId: number) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  if (propertiesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Property Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || user?.username}! Manage your Dublin properties below.
          </p>
        </div>
        <Button onClick={() => setLocation('/properties/add')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.approvedProperties || 0} approved, {stats?.pendingProperties || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              From approved properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInquiries || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Properties</CardTitle>
          <CardDescription>
            Manage your Dublin property listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first Dublin property to the marketplace
              </p>
              <Button onClick={() => setLocation('/properties/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property: OwnerProperty) => (
                <div
                  key={property.id}
                  className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Property Image */}
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450'}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Property Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{property.name}</h3>
                        <p className="text-muted-foreground">{property.address}, {property.city}</p>
                        <p className="text-xl font-bold text-primary mt-1">
                          {formatCurrency(property.price)}/month
                        </p>
                        {property.bedrooms && property.bathrooms && (
                          <p className="text-sm text-muted-foreground">
                            {property.bedrooms} bed • {property.bathrooms} bath
                            {property.squareMeters && ` • ${property.squareMeters}m²`}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {/* Status Badges */}
                        <div className="flex gap-2">
                          <Badge
                            variant={property.status === 'available' ? 'default' : 'secondary'}
                          >
                            {property.status}
                          </Badge>
                          {property.isApproved ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/properties/${property.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/properties/edit/${property.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProperty(property.id)}
                            disabled={deletePropertyMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation('/properties/add')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Property
            </CardTitle>
            <CardDescription>
              List a new Dublin property for rent
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation('/owner/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              View Analytics
            </CardTitle>
            <CardDescription>
              Track performance and insights
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation('/owner/profile')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Profile
            </CardTitle>
            <CardDescription>
              Update your business information
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}