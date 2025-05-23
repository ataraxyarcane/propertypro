import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { ArrowLeft, X, Plus } from 'lucide-react';
import SEO from '@/components/seo';
import type { Property } from '@/types';

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'County is required'),
  zipCode: z.string().min(1, 'Eircode is required'),
  description: z.string().optional(),
  propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse']),
  price: z.number().min(1, 'Monthly rent must be greater than 0'),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  squareMeters: z.number().min(1).optional(),
  status: z.enum(['available', 'leased', 'maintenance']),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function EditProperty() {
  const params = useParams();
  const propertyId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState('');

  const { data: property, isLoading, isError } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!propertyId,
  });

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: 'Dublin',
      zipCode: '',
      description: '',
      propertyType: 'apartment',
      price: 0,
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 50,
      status: 'available',
    }
  });

  // Update form when property data loads
  useEffect(() => {
    if (property) {
      form.reset({
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        description: property.description || '',
        propertyType: property.propertyType,
        price: property.price,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        squareMeters: property.squareMeters || 0,
        status: property.status,
      });
      setFeatures(property.features || []);
      setImages(property.images || []);
    }
  }, [property, form]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues & { features: string[], images: string[] }) => {
      return await apiRequest(`/api/properties/${propertyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}`] });
      toast({
        title: 'Success',
        description: 'Property updated successfully!',
      });
      setLocation('/properties');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update property',
      });
    },
  });

  const onSubmit = (data: PropertyFormValues) => {
    updatePropertyMutation.mutate({
      ...data,
      features,
      images,
    });
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const addImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (image: string) => {
    setImages(images.filter(i => i !== image));
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
        <Button variant="outline" onClick={() => setLocation('/properties')} className="mt-4">
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Edit ${property.name}`} 
        description="Edit property details and information" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/properties')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          
          <h1 className="text-2xl font-medium">Edit Property</h1>
          <p className="text-neutral-mid">Update {property.name} details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Modern Dublin Apartment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Information */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 15 Grafton Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dublin 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dublin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eircode</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. D02 VN88" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rent (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1800" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5"
                            placeholder="1.5" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="squareMeters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Meters</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="88" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="leased">Leased</SelectItem>
                          <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the property, its features, and what makes it special..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Features */}
                <div>
                  <FormLabel>Features & Amenities</FormLabel>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature (e.g. Parking, Gym, etc.)"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {feature}
                            <button type="button" onClick={() => removeFeature(feature)}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <FormLabel>Property Images (URLs)</FormLabel>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add image URL"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                      />
                      <Button type="button" onClick={addImage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="space-y-2">
                        {images.map((image, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <img src={image} alt="" className="w-16 h-16 object-cover rounded" />
                            <span className="flex-1 text-sm truncate">{image}</span>
                            <button type="button" onClick={() => removeImage(image)}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation('/properties')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePropertyMutation.isPending}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {updatePropertyMutation.isPending ? 'Updating...' : 'Update Property'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}