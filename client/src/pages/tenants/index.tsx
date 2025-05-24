import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-simple-auth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Euro,
  Edit,
  Trash2,
  Eye,
  User,
  Building
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import SEO from '@/components/seo';
import { formatCurrency, formatDate, isAdmin, canManageProperties } from '@/lib/utils';

interface TenantWithUser {
  id: number;
  userId: number;
  phone: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  dateOfBirth: Date | null;
  occupation: string | null;
  monthlyIncome: number | null;
  employerName: string | null;
  employerPhone: string | null;
  previousAddress: string | null;
  moveInDate: Date | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    status: string;
  };
}

export default function TenantsIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tenants based on user role
  const { data: tenants = [], isLoading } = useQuery<TenantWithUser[]>({
    queryKey: ['/api/tenants'],
  });

  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      return await apiRequest(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete tenant',
      });
    },
  });

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${tenant.user.firstName || ''} ${tenant.user.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      tenant.user.email.toLowerCase().includes(searchLower) ||
      tenant.user.username.toLowerCase().includes(searchLower) ||
      (tenant.phone && tenant.phone.toLowerCase().includes(searchLower)) ||
      (tenant.occupation && tenant.occupation.toLowerCase().includes(searchLower))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDeleteTenant = (tenantId: number) => {
    deleteTenantMutation.mutate(tenantId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Tenant Management" 
        description="Manage tenants, view profiles, and track rental information" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">Tenant Management</h1>
              <p className="text-neutral-mid">
                {user?.role === 'property_owner' 
                  ? 'Manage tenants in your properties' 
                  : 'Manage all tenants in the system'
                }
              </p>
            </div>
            
            {canManageProperties(user) && (
              <Button 
                onClick={() => setLocation('/tenants/add')}
                className="bg-primary hover:bg-primary-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tenants by name, email, phone, or occupation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Grid */}
        {filteredTenants.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'No tenants match your search criteria.' 
                  : 'Get started by adding your first tenant.'
                }
              </p>
              {canManageProperties(user) && !searchTerm && (
                <Button 
                  onClick={() => setLocation('/tenants/add')}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {tenant.user.firstName && tenant.user.lastName
                            ? `${tenant.user.firstName} ${tenant.user.lastName}`
                            : tenant.user.username
                          }
                        </CardTitle>
                        <p className="text-sm text-neutral-mid">@{tenant.user.username}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(tenant.status)}>
                      {tenant.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-neutral-mid">
                      <Mail className="h-4 w-4 mr-2" />
                      {tenant.user.email}
                    </div>
                    {tenant.phone && (
                      <div className="flex items-center text-sm text-neutral-mid">
                        <Phone className="h-4 w-4 mr-2" />
                        {tenant.phone}
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  {tenant.occupation && (
                    <div className="flex items-center text-sm text-neutral-mid">
                      <Building className="h-4 w-4 mr-2" />
                      {tenant.occupation}
                    </div>
                  )}

                  {tenant.monthlyIncome && (
                    <div className="flex items-center text-sm text-neutral-mid">
                      <Euro className="h-4 w-4 mr-2" />
                      Monthly Income: {formatCurrency(tenant.monthlyIncome)}
                    </div>
                  )}

                  {tenant.moveInDate && (
                    <div className="flex items-center text-sm text-neutral-mid">
                      <Calendar className="h-4 w-4 mr-2" />
                      Move-in: {formatDate(tenant.moveInDate.toString())}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/tenants/${tenant.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {canManageProperties(user) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/tenants/${tenant.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this tenant? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTenant(tenant.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredTenants.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-6 text-sm text-neutral-mid">
                <div>
                  <span className="font-medium text-neutral-dark">Total Tenants:</span> {filteredTenants.length}
                </div>
                <div>
                  <span className="font-medium text-neutral-dark">Active:</span>{' '}
                  {filteredTenants.filter(t => t.status === 'active').length}
                </div>
                <div>
                  <span className="font-medium text-neutral-dark">Pending:</span>{' '}
                  {filteredTenants.filter(t => t.status === 'pending').length}
                </div>
                <div>
                  <span className="font-medium text-neutral-dark">Inactive:</span>{' '}
                  {filteredTenants.filter(t => t.status === 'inactive').length}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}