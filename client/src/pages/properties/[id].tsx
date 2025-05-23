import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Property, formatCurrency, formatDate, isTenant } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-simple-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Calendar, DollarSign, MapPin, Bed, Bath, Square, Tag, ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/seo";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function PropertyDetails() {
  const [, params] = useRoute("/properties/:id");
  const propertyId = params?.id;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: property, isLoading, isError } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (property) {
      trackEvent('view_property', 'properties', property.name);
    }
  }, [property]);

  // Helper function to handle image errors
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-mid">Loading property details...</p>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Error loading property details</p>
        <Link href="/properties">
          <Button variant="outline" className="mt-4">
            Back to Properties
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={property.name} 
        description={property.description || `${property.bedrooms} bed, ${property.bathrooms} bath property located at ${property.address}, ${property.city}, ${property.state}`}
        ogImage={property.images[0]}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/properties">
            <Button variant="ghost" className="flex items-center mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-medium">{property.name}</h1>
              <p className="text-neutral-mid flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-medium text-primary">
                {formatCurrency(property.price)}<span className="text-sm font-normal">/month</span>
              </div>
              <Badge className={
                property.status === 'available' ? "bg-success text-white" :
                property.status === 'leased' ? "bg-secondary text-white" :
                "bg-warning text-white"
              }>
                {property.status === 'available' ? "Available" :
                 property.status === 'leased' ? "Leased" : "Maintenance"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden mb-4 aspect-video">
              <img
                src={property.images[activeImageIndex] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450'}
                alt={property.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${index === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${property.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-medium mb-4">Property Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-neutral-mid">Property Type</p>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                </div>
                
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-mid">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-mid">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                
                {property.squareFeet && (
                  <div className="flex items-center">
                    <Square className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-mid">Square Feet</p>
                      <p className="font-medium">{property.squareFeet} sq ft</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-neutral-mid">Price</p>
                    <p className="font-medium">{formatCurrency(property.price)}/month</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-neutral-mid">Available Since</p>
                    <p className="font-medium">{formatDate(property.createdAt)}</p>
                  </div>
                </div>
                
                {/* Apply for Lease Button */}
                <div className="pt-2">
                  {property.status === 'available' && isAuthenticated && isTenant(user) && (
                    <Link href={`/properties/${propertyId}/apply`}>
                      <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Apply for Lease
                      </Button>
                    </Link>
                  )}

                  {property.status === 'available' && !isAuthenticated && (
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Login to Apply
                      </Button>
                    </Link>
                  )}

                  {property.status !== 'available' && (
                    <Button disabled className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      {property.status === 'leased' ? 'Property Leased' : 'Not Available'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">About this property</h2>
                <p className="whitespace-pre-line">
                  {property.description || "No description available for this property."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="features" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">Features & Amenities</h2>
                
                {property.features && property.features.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No features listed for this property.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
