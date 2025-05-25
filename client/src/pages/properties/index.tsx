import { useState, useEffect } from "react";
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
import { Link } from "wouter";

export default function Properties() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  const { data: properties, isLoading, isError, refetch } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Initialize filtered properties when data loads
  useEffect(() => {
    if (properties && !isSearching) {
      setFilteredProperties(properties);
    }
  }, [properties, isSearching]);

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
    setCurrentPage(1);
    if (properties) {
      setFilteredProperties(properties);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Link href="/properties/add">
              <Button className="bg-primary hover:bg-primary-dark mt-4 md:mt-0 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </Link>
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
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
