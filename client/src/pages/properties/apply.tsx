import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-simple-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Calendar, Euro, User, Briefcase, Users, Heart } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/types';
import SEO from '@/components/seo';

// Form validation schema
const leaseApplicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  
  // Employment Information
  employmentStatus: z.string().min(1, 'Employment status is required'),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.string().min(1, 'Monthly income is required'),
  employmentDuration: z.string().optional(),
  
  // References
  previousLandlord: z.string().optional(),
  previousLandlordPhone: z.string().optional(),
  emergencyContact: z.string().min(2, 'Emergency contact is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  
  // Lease Details
  desiredMoveInDate: z.string().min(1, 'Move-in date is required'),
  leaseDuration: z.string().min(1, 'Lease duration is required'),
  additionalOccupants: z.string().default('0'),
  petsDescription: z.string().optional(),
  
  // Application Details
  motivation: z.string().min(10, 'Please tell us why you want to rent this property (minimum 10 characters)'),
  additionalComments: z.string().optional(),
});

type LeaseApplicationForm = z.infer<typeof leaseApplicationSchema>;

export default function ApplyForProperty() {
  const [, params] = useRoute('/properties/:id/apply');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const propertyId = parseInt(params?.id || '0');

  // Fetch property details
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['/api/properties', propertyId],
    enabled: !!propertyId,
  });

  // Check if user already has an application for this property
  const { data: existingApplications } = useQuery({
    queryKey: ['/api/lease-applications', 'user', user?.id],
    enabled: !!user?.id,
  });

  const hasExistingApplication = existingApplications?.some((app: any) => 
    app.propertyId === propertyId && app.status !== 'withdrawn'
  );

  // Initialize form with user data
  const form = useForm<LeaseApplicationForm>({
    resolver: zodResolver(leaseApplicationSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      employmentStatus: '',
      employer: '',
      jobTitle: '',
      monthlyIncome: '',
      employmentDuration: '',
      previousLandlord: '',
      previousLandlordPhone: '',
      emergencyContact: '',
      emergencyContactPhone: '',
      desiredMoveInDate: '',
      leaseDuration: '12',
      additionalOccupants: '0',
      petsDescription: '',
      motivation: '',
      additionalComments: '',
    },
  });

  // Submit application mutation
  const submitApplication = useMutation({
    mutationFn: async (data: LeaseApplicationForm) => {
      return apiRequest('/api/lease-applications', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          applicantId: user?.id,
          ...data,
          monthlyIncome: parseFloat(data.monthlyIncome),
          leaseDuration: parseInt(data.leaseDuration),
          additionalOccupants: parseInt(data.additionalOccupants),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lease-applications'] });
      toast({
        title: 'Application Submitted!',
        description: 'Your lease application has been submitted successfully. You will be notified once it is reviewed.',
      });
      setLocation(`/properties/${propertyId}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: LeaseApplicationForm) => {
    submitApplication.mutate(data);
  };

  if (propertyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-gray-600 mb-4">The property you're trying to apply for doesn't exist.</p>
        <Link href="/properties">
          <Button>Browse Properties</Button>
        </Link>
      </div>
    );
  }

  if (hasExistingApplication) {
    return (
      <div className="max-w-2xl mx-auto">
        <SEO 
          title={`Application Already Submitted - ${property.name} - PropertyPro`}
          description="You have already submitted an application for this property."
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Application Already Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You have already submitted an application for <strong>{property.name}</strong>.</p>
            <p className="text-gray-600">
              You can view the status of your application in your profile or contact the property owner for updates.
            </p>
            <div className="flex space-x-3">
              <Link href={`/properties/${propertyId}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Property
                </Button>
              </Link>
              <Link href="/profile">
                <Button>View My Applications</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SEO 
        title={`Apply for ${property.name} - PropertyPro`}
        description={`Submit your lease application for ${property.name} in ${property.city}. Monthly rent: ${formatCurrency(property.price)}.`}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/properties/${propertyId}`}>
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Lease</h1>
          <p className="text-gray-600 mt-1">Complete the application form below</p>
        </div>
      </div>

      {/* Property Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{property.name}</h3>
              <p className="text-gray-600">{property.address}, {property.city}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">{property.propertyType}</Badge>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(property.price)}/month
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Please provide your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+353 1 234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Employment Information
              </CardTitle>
              <CardDescription>
                Tell us about your employment status and income
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your employment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employed">Employed Full-time</SelectItem>
                        <SelectItem value="part-time">Employed Part-time</SelectItem>
                        <SelectItem value="self-employed">Self-employed</SelectItem>
                        <SelectItem value="contractor">Independent Contractor</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer/Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Your job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3000" 
                          min="0" 
                          step="100"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Your gross monthly income in Euros
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employmentDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 years, 6 months" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                References
              </CardTitle>
              <CardDescription>
                Provide contact information for references
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="previousLandlord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Landlord (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Landlord name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousLandlordPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Landlord Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+353 1 234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+353 1 234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lease Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Lease Details
              </CardTitle>
              <CardDescription>
                Specify your lease preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="desiredMoveInDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Move-in Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leaseDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Duration (months)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalOccupants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Occupants</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Just me</SelectItem>
                          <SelectItem value="1">1 additional person</SelectItem>
                          <SelectItem value="2">2 additional people</SelectItem>
                          <SelectItem value="3">3 additional people</SelectItem>
                          <SelectItem value="4">4+ additional people</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="petsDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pets (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 small dog, 2 cats, no pets" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please describe any pets you have
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                About You
              </CardTitle>
              <CardDescription>
                Tell us why you're interested in this property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to rent this property?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us what appeals to you about this property and location..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This helps the landlord understand your interest and fit for the property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information you'd like to share..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    By submitting this application, you confirm that all information provided is accurate and complete.
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={submitApplication.isPending}
                  className="bg-primary hover:bg-primary-dark text-white px-8"
                >
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}