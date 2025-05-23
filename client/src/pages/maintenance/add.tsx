import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-simple-auth";
import { Property } from "@/types";
import { ArrowLeft, Wrench } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/seo";
import { apiRequest } from "@/lib/queryClient";

const maintenanceRequestSchema = z.object({
  propertyId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
});

type MaintenanceRequestForm = z.infer<typeof maintenanceRequestSchema>;

export default function AddMaintenanceRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get properties for selection (only owner's properties)
  const { data: properties = [], isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const ownerProperties = properties.filter(property => 
    user?.role === 'admin' || property.ownerId === user?.id
  );

  const form = useForm<MaintenanceRequestForm>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MaintenanceRequestForm) => {
      return apiRequest('/api/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          tenantId: user?.id, // Assuming the owner is creating on behalf of tenant
          status: 'pending'
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      setLocation('/maintenance');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MaintenanceRequestForm) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <SEO 
        title="Add Maintenance Request - PropertyPro"
        description="Create a new maintenance request for property management."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/maintenance">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Maintenance
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Add Maintenance Request</h1>
            <p className="text-neutral-mid">Create a new maintenance request for a property</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-primary" />
                New Maintenance Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingProperties ? (
                              <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                            ) : ownerProperties.length > 0 ? (
                              ownerProperties.map((property) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.name} - {property.address}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No properties available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Leaking faucet in kitchen"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low - Non-urgent issue</SelectItem>
                            <SelectItem value="medium">Medium - Standard maintenance</SelectItem>
                            <SelectItem value="high">High - Urgent repair needed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of the maintenance issue, including location, symptoms, and any relevant information..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Request"}
                    </Button>
                    <Link href="/maintenance">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}