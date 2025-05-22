import { useState } from "react";
import SEO from "@/components/seo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";

// Form schema for general settings
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string(),
  contactEmail: z.string().email("Invalid email address"),
  phoneNumber: z.string(),
  enableRegistration: z.boolean(),
  requireApproval: z.boolean(),
  defaultUserRole: z.enum(["tenant", "admin"]),
  theme: z.enum(["light", "dark", "system"]),
});

// Form schema for notification settings
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  newUserNotification: z.boolean(),
  maintenanceRequestNotification: z.boolean(),
  leaseExpirationNotification: z.boolean(),
  paymentNotification: z.boolean(),
  notificationFrequency: z.enum(["immediately", "daily", "weekly"]),
});

// Form schema for security settings
const securitySettingsSchema = z.object({
  sessionTimeout: z.number().min(5).max(1440),
  maxLoginAttempts: z.number().min(1).max(10),
  passwordExpiration: z.number().min(0).max(365),
  requireStrongPasswords: z.boolean(),
  twoFactorAuth: z.boolean(),
});

export default function AdminSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("general");

  // General settings form
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "PropertyPro",
      siteDescription: "Property management system for landlords and tenants",
      contactEmail: "contact@propertypro.com",
      phoneNumber: "(555) 123-4567",
      enableRegistration: true,
      requireApproval: true,
      defaultUserRole: "tenant",
      theme: theme as "light" | "dark" | "system",
    },
  });

  // Notification settings form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      newUserNotification: true,
      maintenanceRequestNotification: true,
      leaseExpirationNotification: true,
      paymentNotification: true,
      notificationFrequency: "immediately",
    },
  });

  // Security settings form
  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiration: 90,
      requireStrongPasswords: true,
      twoFactorAuth: false,
    },
  });

  const onGeneralSubmit = (data: z.infer<typeof generalSettingsSchema>) => {
    setTheme(data.theme);
    toast({
      title: "Settings Updated",
      description: "General settings have been saved successfully.",
    });
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSettingsSchema>) => {
    toast({
      title: "Settings Updated",
      description: "Notification settings have been saved successfully.",
    });
  };

  const onSecuritySubmit = (data: z.infer<typeof securitySettingsSchema>) => {
    toast({
      title: "Settings Updated",
      description: "Security settings have been saved successfully.",
    });
  };

  return (
    <>
      <SEO 
        title="System Settings" 
        description="Configure system settings for the property management application" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium">System Settings</h1>
          <p className="text-neutral-mid">Configure system settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure the general system settings and appearance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="defaultUserRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default User Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tenant">Tenant</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setTheme(value as "light" | "dark" | "system");
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="enableRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable User Registration
                              </FormLabel>
                              <FormDescription>
                                Allow users to register new accounts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="requireApproval"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Require Admin Approval
                              </FormLabel>
                              <FormDescription>
                                New users require admin approval
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="bg-primary hover:bg-primary-dark">
                      Save General Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when notifications are sent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Email Notifications
                            </FormLabel>
                            <FormDescription>
                              Enable all email notifications
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={notificationForm.control}
                        name="newUserNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                New User Notifications
                              </FormLabel>
                              <FormDescription>
                                Notify when new users register
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("emailNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="maintenanceRequestNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Maintenance Requests
                              </FormLabel>
                              <FormDescription>
                                Notify on new maintenance requests
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("emailNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={notificationForm.control}
                        name="leaseExpirationNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Lease Expirations
                              </FormLabel>
                              <FormDescription>
                                Notify when leases are expiring
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("emailNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="paymentNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Payment Notifications
                              </FormLabel>
                              <FormDescription>
                                Notify on payment receipts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!notificationForm.watch("emailNotifications")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={notificationForm.control}
                      name="notificationFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Frequency</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!notificationForm.watch("emailNotifications")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediately">Immediately</SelectItem>
                              <SelectItem value="daily">Daily Digest</SelectItem>
                              <SelectItem value="weekly">Weekly Digest</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often notification emails are sent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="bg-primary hover:bg-primary-dark">
                      Save Notification Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes): {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={5}
                              max={1440}
                              step={5}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Time before users are automatically logged out due to inactivity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Login Attempts: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of failed login attempts before account is locked
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="passwordExpiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Expiration (days): {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={365}
                              step={30}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Days before users must change their password (0 = never)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="requireStrongPasswords"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Require Strong Passwords
                              </FormLabel>
                              <FormDescription>
                                Enforce strong password policy
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="twoFactorAuth"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Two-Factor Authentication
                              </FormLabel>
                              <FormDescription>
                                Require 2FA for all users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="bg-primary hover:bg-primary-dark">
                      Save Security Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
