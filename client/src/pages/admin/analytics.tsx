import { useState } from "react";
import SEO from "@/components/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("month");

  // Sample data for charts
  const monthlyPropertyData = [
    { name: "Jan", properties: 38 },
    { name: "Feb", properties: 40 },
    { name: "Mar", properties: 39 },
    { name: "Apr", properties: 42 },
    { name: "May", properties: 45 },
    { name: "Jun", properties: 44 },
    { name: "Jul", properties: 49 },
    { name: "Aug", properties: 53 },
    { name: "Sep", properties: 57 },
    { name: "Oct", properties: 60 },
    { name: "Nov", properties: 61 },
    { name: "Dec", properties: 65 },
  ];

  const userGrowthData = [
    { name: "Jan", tenants: 52, admins: 3 },
    { name: "Feb", tenants: 58, admins: 3 },
    { name: "Mar", tenants: 61, admins: 4 },
    { name: "Apr", tenants: 66, admins: 4 },
    { name: "May", tenants: 70, admins: 4 },
    { name: "Jun", tenants: 72, admins: 4 },
    { name: "Jul", tenants: 78, admins: 5 },
    { name: "Aug", tenants: 82, admins: 5 },
    { name: "Sep", tenants: 87, admins: 6 },
    { name: "Oct", tenants: 93, admins: 6 },
    { name: "Nov", tenants: 97, admins: 6 },
    { name: "Dec", tenants: 102, admins: 7 },
  ];

  const propertyTypeData = [
    { name: "Apartment", value: 45 },
    { name: "House", value: 30 },
    { name: "Condo", value: 15 },
    { name: "Townhouse", value: 10 },
  ];

  const maintenanceStatusData = [
    { name: "Pending", value: 14 },
    { name: "In Progress", value: 8 },
    { name: "Resolved", value: 32 },
  ];

  const propertyStatusData = [
    { name: "Available", value: 28 },
    { name: "Leased", value: 62 },
    { name: "Maintenance", value: 10 },
  ];

  // Colors for charts
  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  
  // Helper function to get data subset based on time range
  const getTimeFilteredData = (data: any[], months: number) => {
    return data.slice(-months);
  };

  const filteredPropertyData = 
    timeRange === "year" ? monthlyPropertyData :
    timeRange === "quarter" ? getTimeFilteredData(monthlyPropertyData, 3) :
    getTimeFilteredData(monthlyPropertyData, 1);

  const filteredUserData = 
    timeRange === "year" ? userGrowthData :
    timeRange === "quarter" ? getTimeFilteredData(userGrowthData, 3) :
    getTimeFilteredData(userGrowthData, 1);

  return (
    <>
      <SEO 
        title="Analytics" 
        description="System analytics and data visualization for property management" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium">Analytics</h1>
          <p className="text-neutral-mid">View system analytics and performance metrics</p>
        </div>

        <div className="mb-6 flex justify-end">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredPropertyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="properties"
                      stroke="hsl(var(--chart-1))"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredUserData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tenants" fill="hsl(var(--chart-2))" name="Tenants" />
                    <Bar dataKey="admins" fill="hsl(var(--chart-3))" name="Admins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="propertyType">
          <TabsList className="mb-4">
            <TabsTrigger value="propertyType">Property Types</TabsTrigger>
            <TabsTrigger value="maintenanceStatus">Maintenance Status</TabsTrigger>
            <TabsTrigger value="propertyStatus">Property Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="propertyType">
            <Card>
              <CardHeader>
                <CardTitle>Property Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenanceStatus">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maintenanceStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {maintenanceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="propertyStatus">
            <Card>
              <CardHeader>
                <CardTitle>Property Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {propertyStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
