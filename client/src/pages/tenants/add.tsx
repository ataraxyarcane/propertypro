import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-simple-auth';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Save, User, Building, Phone, Mail, Calendar, Euro } from 'lucide-react';
import SEO from '@/components/seo';

// Form schema for adding a tenant
const addTenantSchema = z.object({
  // User information
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  
  // Tenant specific information
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z.string().optional(),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  previousAddress: z.string().optional(),
  moveInDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']).default('pending'),
});

type AddTenantForm = z.infer<typeof addTenantSchema>;

export default function AddTenant() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddTenantForm>({
    resolver: zodResolver(addTenantSchema),
    defaultValues: {
      status: 'pending',
    },
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: AddTenantForm) => {
      // First create the user account
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'tenant',
        status: 'active',
      };

      const userResponse = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.message || 'Failed to create user account');
      }

      const createdUser = await userResponse.json();

      // Then create the tenant profile
      const tenantData = {
        userId: createdUser.user.id,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        occupation: data.occupation,
        monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : null,
        employerName: data.employerName,
        employerPhone: data.employerPhone,
        previousAddress: data.previousAddress,
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
        notes: data.notes,
        status: data.status,
      };

      const tenantResponse = await apiRequest('/api/tenants', {
        method: 'POST',
        body: JSON.stringify(tenantData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!tenantResponse.ok) {
        const error = await tenantResponse.json();
        throw new Error(error.message || 'Failed to create tenant profile');
      }

      return await tenantResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: 'Success',
        description: 'Tenant added successfully!',
      });
      setLocation('/tenants');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add tenant',
      });
    },
  });

  const onSubmit = (data: AddTenantForm) => {
    createTenantMutation.mutate(data);
  };

  return (
    <>
      <SEO 
        title="Add Tenant" 
        description="Add a new tenant to your property management system" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/tenants')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenants
            </Button>
          </div>
          
          <div>
            <h1 className="text-2xl font-medium">Add New Tenant</h1>
            <p className="text-neutral-mid">
              Create a new tenant account and profile
            </p>
          </div>
        </div>

        {/* Add Tenant Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* User Account Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Account Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth (optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Employment Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter occupation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter monthly income in EUR"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Name (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter employer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer Phone (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter employer phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Emergency Contact & Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Emergency Contact & Additional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter emergency contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Phone (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter emergency contact phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="previousAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Address (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter previous address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="moveInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Move-in Date (optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes about the tenant"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/tenants')}
                    disabled={createTenantMutation.isPending}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={createTenantMutation.isPending}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {createTenantMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Adding Tenant...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Tenant
                      </>
                    )}
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