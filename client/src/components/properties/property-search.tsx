import { useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { formatCurrency } from '@/types';

const formSchema = z.object({
  search: z.string().optional(),
  propertyType: z.string().optional(),
  priceRange: z.array(z.number()).default([0, 5000]),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
});

type PropertySearchValues = z.infer<typeof formSchema>;

interface PropertySearchProps {
  onSearch: (values: PropertySearchValues) => void;
  onReset: () => void;
}

export default function PropertySearch({ onSearch, onReset }: PropertySearchProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  
  const form = useForm<PropertySearchValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      propertyType: '',
      priceRange: [0, 5000],
      bedrooms: '',
      bathrooms: '',
    }
  });
  
  const handleSubmit = (values: PropertySearchValues) => {
    values.priceRange = priceRange;
    onSearch(values);
  };
  
  const handleReset = () => {
    form.reset({
      search: '',
      propertyType: '',
      priceRange: [0, 5000],
      bedrooms: '',
      bathrooms: '',
    });
    setPriceRange([0, 5000]);
    onReset();
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <Input placeholder="Search by name, address, etc." {...field} />
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
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
            
            <div>
              <FormLabel>Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</FormLabel>
              <Slider
                defaultValue={[0, 5000]}
                min={0}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="1.5">1.5+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary-dark flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
