import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Calendar, 
  Euro, 
  MapPin, 
  User,
  Phone,
  Mail,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/use-simple-auth";
import { format } from "date-fns";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface ApplicationDetail {
  id: number;
  propertyId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  monthlyIncome: number;
  employmentStatus: string;
  employer: string;
  jobTitle: string;
  employmentLength: string;
  emergencyContact: string;
  emergencyPhone: string;
  previousAddress: string;
  reasonForMoving: string;
  additionalNotes: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
  property: {
    id: number;
    name: string;
    address: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
  };
  documents?: Array<{
    type: string;
    filename: string;
  }>;
}

export default function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id");
  const applicationId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ["/api/lease-applications", applicationId],
    enabled: !!applicationId,
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/lease-applications/${applicationId}`);
      if (!response.ok) {
        throw new Error("Failed to withdraw application");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Withdrawn",
        description: "Your application has been successfully withdrawn.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lease-applications"] });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "There was an error withdrawing your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, text: "Pending Review" },
      approved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, text: "Rejected" },
      under_review: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertCircle, text: "Under Review" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-2 px-3 py-1 text-sm`}>
        <Icon className="h-4 w-4" />
        {config.text}
      </Badge>
    );
  };

  const canWithdraw = application?.status === 'pending' || application?.status === 'under_review';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
        <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
        <Link href="/applications">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const app = application as ApplicationDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">Application ID: #{app.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(app.status)}
          {canWithdraw && (
            <Button
              variant="outline"
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
            </Button>
          )}
        </div>
      </div>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.property.name}</h3>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{app.property.address}, {app.property.city}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Monthly Rent</p>
                  <p className="font-medium text-lg">€{app.property.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Property Type</p>
                  <p className="font-medium">{app.property.propertyType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bedrooms</p>
                  <p className="font-medium">{app.property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bathrooms</p>
                  <p className="font-medium">{app.property.bathrooms}</p>
                </div>
              </div>
            </div>
            <Link href={`/properties/${app.propertyId}`}>
              <Button variant="outline" size="sm">
                View Property
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Application Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Application Submitted</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(app.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
            {app.reviewedAt && (
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  app.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium">Application {app.status === 'approved' ? 'Approved' : 'Reviewed'}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(app.reviewedAt), 'MMMM dd, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{app.firstName} {app.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{app.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{app.phone}</p>
              </div>
              {app.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{format(new Date(app.dateOfBirth), 'MMMM dd, yyyy')}</p>
                </div>
              )}
            </div>
            
            {app.emergencyContact && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{app.emergencyContact}</p>
                    </div>
                    {app.emergencyPhone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{app.emergencyPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="font-medium text-lg">€{app.monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Status</p>
                <p className="font-medium capitalize">{app.employmentStatus.replace('_', ' ')}</p>
              </div>
              {app.employer && (
                <div>
                  <p className="text-sm text-gray-500">Employer</p>
                  <p className="font-medium">{app.employer}</p>
                </div>
              )}
              {app.jobTitle && (
                <div>
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p className="font-medium">{app.jobTitle}</p>
                </div>
              )}
              {app.employmentLength && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Length of Employment</p>
                  <p className="font-medium">{app.employmentLength}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(app.previousAddress || app.reasonForMoving || app.additionalNotes) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.previousAddress && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Previous Address</p>
                  <p className="font-medium">{app.previousAddress}</p>
                </div>
              )}
              {app.reasonForMoving && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reason for Moving</p>
                  <p className="font-medium">{app.reasonForMoving}</p>
                </div>
              )}
              {app.additionalNotes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                  <p className="font-medium">{app.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {app.documents && app.documents.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submitted Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {app.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {doc.type.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{doc.filename}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}