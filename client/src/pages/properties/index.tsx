import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/properties/property-card";
import PropertySearch from "@/components/properties/property-search";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-simple-auth";
import { isAdmin } from "@/types";
import SEO from "@/components/seo";

export default function Properties() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: properties, isLoading, isError, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    onSuccess: (data) => {
      if (!isSearching) {
        setFilteredProperties(data);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (values: any) => {
    if (!properties) return;

    setIsSearching(true);
    
    const filtered = properties.filter((property) => {
      // Filter by search query
      if (values.search) {
        const searchTerm = values.search.toLowerCase();
        const nameMatch = property.name.toLowerCase().includes(searchTerm);
        const addressMatch = property.address.toLowerCase().includes(searchTerm);
        const cityMatch = property.city.toLowerCase().includes(searchTerm);
        const stateMatch = property.state.toLowerCase().includes(searchTerm);
        
        if (!(nameMatch || addressMatch || cityMatch || stateMatch)) {
          return false;
        }
      }
      
      // Filter by property type
      if (values.propertyType && property.propertyType !== values.propertyType) {
        return false;
      }
      
      // Filter by price range
      if (property.price < values.priceRange[0] || property.price > values.priceRange[1]) {
        return false;
      }
      
      // Filter by bedrooms
      if (values.bedrooms && property.bedrooms && property.bedrooms < parseInt(values.bedrooms)) {
        return false;
      }
      
      // Filter by bathrooms
      if (values.bathrooms && property.bathrooms && property.bathrooms < parseFloat(values.bathrooms)) {
        return false;
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
  };

  const handleReset = () => {
    setIsSearching(false);
    if (properties) {
      setFilteredProperties(properties);
    }
  };

  return (
    <>
      <SEO 
        title="Properties" 
        description="Browse available properties for rent or lease" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium">Properties</h1>
            <p className="text-neutral-mid">Browse available properties for rent or lease</p>
          </div>
          
          {isAdmin(user) && (
            <Button 
              onClick={() => setLocation('/properties/add')}
              className="bg-primary hover:bg-primary-dark mt-4 md:mt-0 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <PropertySearch onSearch={handleSearch} onReset={handleReset} />
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-neutral-mid">Loading properties...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-destructive">Error loading properties</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-mid">No properties found matching your criteria</p>
            {isSearching && (
              <Button variant="outline" onClick={handleReset} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
