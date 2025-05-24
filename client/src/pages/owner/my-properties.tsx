import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-simple-auth';
import { Building, Euro, MapPin, Plus, Bed, Bath, Square } from 'lucide-react';
import SEO from '@/components/seo';
import { formatCurrency } from '@/types';

interface Property {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  description?: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'townhouse';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  features: string[];
  images: string[];
  status: 'available' | 'leased' | 'maintenance';
  createdAt: string;
}

export default function MyProperties() {
  const { user } = useAuth();
  
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !!user,
  });

  // Filter to show only properties owned by the current user
  const myProperties = properties.filter(property => property.ownerId === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'leased':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'leased':
        return 'Leased';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="My Properties" 
        description="Manage your property portfolio" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">My Properties</h1>
            <p className="text-neutral-mid">
              {myProperties.length} {myProperties.length === 1 ? 'property' : 'properties'} in your portfolio
            </p>
          </div>
          
          <Link href="/properties/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {myProperties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your property portfolio by adding your first property.
              </p>
              <Link href="/properties/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">{property.name}</CardTitle>
                    <Badge className={getStatusColor(property.status)}>
                      {getStatusText(property.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-neutral-mid">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      {property.address}, {property.city}, {property.state}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Property Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-lg font-semibold text-primary">
                      <Euro className="h-4 w-4 mr-1" />
                      {formatCurrency(property.price)}/month
                    </div>
                    <div className="text-sm text-neutral-mid capitalize">
                      {property.propertyType}
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="flex items-center gap-4 text-sm text-neutral-mid">
                    {property.bedrooms !== undefined && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                      </div>
                    )}
                    {property.squareMeters && (
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.squareMeters}m²
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {property.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {property.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {property.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{property.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/properties/${property.id}/edit`} className="flex-1">
                      <Button className="w-full">
                        Edit
                      </Button>
                    </Link>
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