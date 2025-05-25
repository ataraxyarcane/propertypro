import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  Euro, 
  MapPin, 
  Home,
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/use-simple-auth";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

export default function ApplyForProperty() {
  const [, params] = useRoute("/properties/:id/apply");
  const propertyId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    monthlyIncome: "",
    employmentStatus: "employed",
    employer: "",
    jobTitle: "",
    employmentLength: "",
    emergencyContact: "",
    emergencyPhone: "",
    previousAddress: "",
    reasonForMoving: "",
    additionalNotes: "",
    hasBackground: false,
    agreedToTerms: false
  });

  const [documents, setDocuments] = useState({
    payslips: null as File | null,
    bankStatements: null as File | null,
    reference: null as File | null,
    idDocument: null as File | null
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ["/api/properties", propertyId],
    enabled: !!propertyId,
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/lease-applications", data);
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your rental application has been submitted successfully. You'll receive updates via email.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lease-applications"] });
      setLocation("/applications");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyId) return;

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
      toast({
        title: "Invalid Income",
        description: "Please enter a valid monthly income.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    const applicationData = {
      propertyId: parseInt(propertyId),
      ...formData,
      monthlyIncome: parseFloat(formData.monthlyIncome),
      // For now, we'll simulate document upload with file names
      documents: Object.entries(documents)
        .filter(([_, file]) => file !== null)
        .map(([type, file]) => ({ type, filename: file?.name }))
    };

    applicationMutation.mutate(applicationData);
  };

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

  if (!property) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-gray-600 mb-4">The property you're trying to apply for doesn't exist.</p>
        <Link href="/properties">
          <Button>Browse Properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/properties/${propertyId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Property
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Rental</h1>
          <p className="text-gray-600">Submit your application for this property</p>
        </div>
      </div>

      {/* Property Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}, {property.city}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  {property.bedrooms}BR / {property.bathrooms}BA
                </div>
                <div className="flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  €{property.price?.toLocaleString()}/month
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
            </div>
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
                <Label htmlFor="monthlyIncome">Monthly Income (€) *</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select
                  value={formData.employmentStatus}
                  onValueChange={(value) => handleInputChange("employmentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employer">Employer</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) => handleInputChange("employer", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="employmentLength">Length of Employment</Label>
                <Input
                  id="employmentLength"
                  placeholder="e.g., 2 years, 6 months"
                  value={formData.employmentLength}
                  onChange={(e) => handleInputChange("employmentLength", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="previousAddress">Previous Address</Label>
              <Input
                id="previousAddress"
                value={formData.previousAddress}
                onChange={(e) => handleInputChange("previousAddress", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reasonForMoving">Reason for Moving</Label>
              <Textarea
                id="reasonForMoving"
                value={formData.reasonForMoving}
                onChange={(e) => handleInputChange("reasonForMoving", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional information you'd like to share..."
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Please upload the following documents to support your application:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payslips">Recent Payslips (Last 3 months)</Label>
                <Input
                  id="payslips"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("payslips", e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="bankStatements">Bank Statements (Last 3 months)</Label>
                <Input
                  id="bankStatements"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("bankStatements", e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="reference">Employment Reference</Label>
                <Input
                  id="reference"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("reference", e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="idDocument">ID Document (Passport/Driving License)</Label>
                <Input
                  id="idDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("idDocument", e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Submit */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange("agreedToTerms", e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="agreedToTerms" className="text-sm">
                  I agree to the terms and conditions and confirm that all information provided is accurate. 
                  I understand that providing false information may result in application rejection.
                </Label>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Link href={`/properties/${propertyId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={applicationMutation.isPending}
                  className="min-w-[120px]"
                >
                  {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}