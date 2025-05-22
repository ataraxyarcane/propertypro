import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property, formatCurrency } from '@/types';
import { Building, Home, Bath, SquareIcon, Bed } from 'lucide-react';
import { Link } from 'wouter';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450'}
          alt={property.name}
          className="w-full h-48 object-cover"
        />
        {property.status === 'available' && (
          <div className="absolute top-0 right-0 p-2">
            <Badge className="bg-primary text-white">Available</Badge>
          </div>
        )}
        {property.status === 'leased' && (
          <div className="absolute top-0 right-0 p-2">
            <Badge className="bg-secondary text-white">Leased</Badge>
          </div>
        )}
        {property.status === 'maintenance' && (
          <div className="absolute top-0 right-0 p-2">
            <Badge className="bg-warning text-white">Maintenance</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-lg">{property.name}</h3>
        <p className="text-neutral-mid text-sm mb-2">
          {property.address}, {property.city}, {property.state}
        </p>
        <div className="flex justify-between items-center mb-3">
          <div className="text-primary font-medium">{formatCurrency(property.price)}/month</div>
          <div className="flex items-center text-neutral-mid text-sm">
            <Home className="h-4 w-4 mr-1" />
            {property.propertyType}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {property.bedrooms && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.bedrooms} bed
            </Badge>
          )}
          {property.bathrooms && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.bathrooms} bath
            </Badge>
          )}
          {property.squareFeet && (
            <Badge variant="outline" className="flex items-center gap-1">
              <SquareIcon className="h-3 w-3" />
              {property.squareFeet} sq ft
            </Badge>
          )}
          {property.features?.slice(0, 1).map((feature, index) => (
            <Badge key={index} variant="outline">
              {feature}
            </Badge>
          ))}
        </div>
        <Link href={`/properties/${property.id}`} className="mt-auto">
          <Button className="w-full bg-primary hover:bg-primary-dark">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
