import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-simple-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Euro, FileText, User, Phone, Mail, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Lease, Property, User as UserType } from "@shared/schema";

interface LeaseWithDetails extends Lease {
  property: Property;
  tenant: {
    user: UserType;
  };
}

export default function MyLease() {
  const { user } = useAuth();

  const { data: leases, isLoading } = useQuery<LeaseWithDetails[]>({
    queryKey: ["/api/tenants/my-leases"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!leases || leases.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Lease</h1>
          <p className="text-gray-600 mt-2">View your current lease details and information</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Lease</h3>
              <p className="text-gray-600 mb-4">
                You don't currently have an active lease. Contact your property manager if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLease = leases[0]; // For now, show the first/most recent lease

  const getLeaseStatus = (lease: Lease) => {
    const now = new Date();
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);

    if (now < startDate) return { status: "upcoming", color: "bg-blue-100 text-blue-800" };
    if (now > endDate) return { status: "expired", color: "bg-red-100 text-red-800" };
    return { status: "active", color: "bg-green-100 text-green-800" };
  };

  const { status, color } = getLeaseStatus(currentLease);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Lease</h1>
        <p className="text-gray-600 mt-2">View your current lease details and information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Lease Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lease Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Lease Agreement</CardTitle>
                  <CardDescription>
                    Property: {currentLease.property.name}
                  </CardDescription>
                </div>
                <Badge className={color}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(currentLease.startDate), "PPP")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">End Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(currentLease.endDate), "PPP")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Euro className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                    <p className="text-sm text-gray-600">
                      €{currentLease.monthlyRent.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Euro className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Security Deposit</p>
                    <p className="text-sm text-gray-600">
                      €{currentLease.securityDeposit?.toLocaleString() || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Lease Status</p>
                <p className="text-sm text-gray-600">
                  This lease agreement is currently {status} and all terms are binding as per the original agreement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Property Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{currentLease.property.name}</h3>
                <p className="text-gray-600 mt-1">
                  {currentLease.property.address}, {currentLease.property.city}, {currentLease.property.state} {currentLease.property.zipCode}
                </p>
              </div>
              
              {currentLease.property.description && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Description</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentLease.property.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {currentLease.property.bedrooms && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{currentLease.property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                )}
                {currentLease.property.bathrooms && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{currentLease.property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                )}
                {currentLease.property.squareMeters && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{currentLease.property.squareMeters}</p>
                    <p className="text-sm text-gray-600">m²</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">€{currentLease.property.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Listed Price</p>
                </div>
              </div>

              {currentLease.property.features && currentLease.property.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Property Features</p>
                  <div className="flex flex-wrap gap-2">
                    {currentLease.property.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Euro className="h-4 w-4 mr-2" />
                View Payment History
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Lease Document
              </Button>
              <Button className="w-full" variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Request Maintenance
              </Button>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Next Rent Due</p>
                <p className="text-sm text-gray-600">
                  {format(
                    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                    "PPP"
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">Lease Renewal</p>
                <p className="text-sm text-gray-600">
                  Contact your property manager 60 days before lease expiration
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Emergency Contact</p>
                <p className="text-sm text-gray-600">
                  Check with property management for emergency maintenance contacts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}