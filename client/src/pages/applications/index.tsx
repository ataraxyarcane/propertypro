import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Calendar, 
  Euro, 
  MapPin, 
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-simple-auth";
import { format } from "date-fns";
import { Link } from "wouter";

interface ApplicationWithProperty {
  id: number;
  propertyId: number;
  status: string;
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  monthlyIncome: number;
  employmentStatus: string;
  property: {
    id: number;
    name: string;
    address: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
  };
}

export default function Applications() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/lease-applications"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      under_review: { color: "bg-blue-100 text-blue-800", icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredApplications = applications.filter((app: ApplicationWithProperty) =>
    app.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <Link href="/properties">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Browse Properties
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search applications by property name, address, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any rental applications. Start browsing available properties to apply.
            </p>
            <Link href="/properties">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application: ApplicationWithProperty) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {application.property?.name || 'Property Name Unavailable'}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {application.property?.address}, {application.property?.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(application.status)}
                    <Link href={`/applications/${application.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-500">Monthly Rent</p>
                      <p className="font-medium">€{application.property?.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-500">Applied</p>
                      <p className="font-medium">
                        {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500">Property Details</p>
                    <p className="font-medium">
                      {application.property?.bedrooms}BR / {application.property?.bathrooms}BA
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Your Income</p>
                    <p className="font-medium">€{application.monthlyIncome?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}