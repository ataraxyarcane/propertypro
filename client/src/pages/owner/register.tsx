import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Building2, User, CheckCircle } from 'lucide-react';

const ownerRegistrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().default('Dublin'),
  zipCode: z.string().min(1, 'Eircode is required'),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
  verifyOwnership: z.boolean().refine(val => val === true, 'You must verify property ownership'),
});

type OwnerRegistrationValues = z.infer<typeof ownerRegistrationSchema>;

export default function PropertyOwnerRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<OwnerRegistrationValues>({
    resolver: zodResolver(ownerRegistrationSchema),
    defaultValues: {
      state: 'Dublin',
      agreeToTerms: false,
      verifyOwnership: false,
    },
  });

  const registerOwnerMutation = useMutation({
    mutationFn: async (data: OwnerRegistrationValues) => {
      return await apiRequest('/api/auth/register-owner', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Registration Successful!',
        description: 'Your property owner account has been created. You can now start listing properties!',
      });
      setStep(3);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Failed to create property owner account',
      });
    },
  });

  const onSubmit = (data: OwnerRegistrationValues) => {
    registerOwnerMutation.mutate(data);
  };

  const nextStep = () => {
    if (step === 1) {
      const userFields = ['username', 'email', 'password', 'firstName', 'lastName'];
      form.trigger(userFields as any).then((isValid) => {
        if (isValid) setStep(2);
      });
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Welcome to PropertyPro!</CardTitle>
            <CardDescription>
              Your property owner account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Start listing your Dublin properties</li>
                <li>• Set competitive rental prices in Euros</li>
                <li>• Upload high-quality property photos</li>
                <li>• Manage inquiries from potential tenants</li>
              </ul>
            </div>
            <Button 
              onClick={() => setLocation('/login')} 
              className="w-full"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Become a Property Owner
          </CardTitle>
          <CardDescription>
            Join PropertyPro's marketplace and start listing your Dublin properties
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Account Info</span>
            <span>Business Details</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      placeholder="John"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      placeholder="Doe"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...form.register('username')}
                    placeholder="johndoe"
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="john@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register('password')}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="button" onClick={nextStep} className="w-full">
                  Continue to Business Details
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Business Information</h3>
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    {...form.register('companyName')}
                    placeholder="Dublin Properties Ltd."
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="+353 1 234 5678"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    placeholder="123 O'Connell Street"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      placeholder="Dublin"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="state">County</Label>
                    <Input
                      id="state"
                      {...form.register('state')}
                      placeholder="Dublin"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">Eircode</Label>
                    <Input
                      id="zipCode"
                      {...form.register('zipCode')}
                      placeholder="D01 X2Y3"
                    />
                    {form.formState.errors.zipCode && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    {...form.register('website')}
                    placeholder="https://www.yourproperties.ie"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">About Your Business (Optional)</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Tell us about your property business, experience, and what makes you unique..."
                    rows={3}
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={form.watch('agreeToTerms')}
                      onCheckedChange={(checked) => form.setValue('agreeToTerms', checked as boolean)}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                      I agree to PropertyPro's Terms of Service and Privacy Policy
                    </Label>
                  </div>
                  {form.formState.errors.agreeToTerms && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.agreeToTerms.message}
                    </p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="verifyOwnership"
                      checked={form.watch('verifyOwnership')}
                      onCheckedChange={(checked) => form.setValue('verifyOwnership', checked as boolean)}
                    />
                    <Label htmlFor="verifyOwnership" className="text-sm leading-relaxed">
                      I verify that I own or have legal authority to list the properties I will be adding to PropertyPro
                    </Label>
                  </div>
                  {form.formState.errors.verifyOwnership && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.verifyOwnership.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerOwnerMutation.isPending}
                    className="flex-1"
                  >
                    {registerOwnerMutation.isPending ? 'Creating Account...' : 'Create Property Owner Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}