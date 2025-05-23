import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-simple-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Users, FileText, TrendingUp, Eye, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '@/types';
import SEO from '@/components/seo';

interface OwnerStats {
  totalProperties: number;
  availableProperties: number;
  leasedProperties: number;
  totalTenants: number;
  monthlyRevenue: number;
  maintenanceRequests: number;
}

export default function OwnerDashboard() {
  const { user } = useAuth();

  // Fetch owner statistics
  const { data: stats, isLoading: statsLoading } = useQuery<OwnerStats>({
    queryKey: ['/api/owner/stats'],
  });

  // Fetch owner's properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties', 'owner'],
  });

  // Fetch recent leases
  const { data: recentLeases, isLoading: leasesLoading } = useQuery({
    queryKey: ['/api/leases', 'owner'],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO 
        title="Owner Dashboard - PropertyPro"
        description="Manage your property portfolio, track rental income, and oversee tenant relationships with PropertyPro's comprehensive owner dashboard."
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.username}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your property portfolio
          </p>
        </div>
        <Link href="/properties/add">
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.availableProperties || 0} available, {stats?.leasedProperties || 0} leased
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              Current active leases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total rental income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.maintenanceRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Properties</CardTitle>
              <Link href="/properties">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your latest property listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="space-y-4">
                {properties.slice(0, 5).map((property: any) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{property.name}</h4>
                      <p className="text-sm text-gray-600">{property.address}, {property.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={property.status === 'available' ? 'default' : property.status === 'leased' ? 'secondary' : 'destructive'}>
                          {property.status}
                        </Badge>
                        <span className="text-sm font-medium text-primary">
                          {formatCurrency(property.price)}/month
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/properties/${property.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/properties/${property.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first property</p>
                <Link href="/properties/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Leases</CardTitle>
              <Link href="/leases">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>
              Latest lease agreements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leasesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : recentLeases && recentLeases.length > 0 ? (
              <div className="space-y-4">
                {recentLeases.slice(0, 5).map((lease: any) => (
                  <div key={lease.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{lease.property?.name}</h4>
                      <Badge variant={lease.status === 'active' ? 'default' : 'secondary'}>
                        {lease.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Tenant: {lease.tenant?.firstName} {lease.tenant?.lastName}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </span>
                      <span className="font-medium text-primary">
                        {formatCurrency(lease.monthlyRent)}/month
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leases yet</h3>
                <p className="text-gray-600">Leases will appear here once tenants rent your properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for property management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/properties/add">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Plus className="h-8 w-8" />
                <span>Add Property</span>
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Building className="h-8 w-8" />
                <span>Manage Properties</span>
              </Button>
            </Link>
            <Link href="/leases">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="h-8 w-8" />
                <span>View Leases</span>
              </Button>
            </Link>
            <Link href="/maintenance">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="h-8 w-8" />
                <span>Maintenance</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}