import { useState } from "react";
import { useAuth } from "@/hooks/use-simple-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { useTheme } from "@/components/theme-provider";
import SEO from "@/components/seo";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  propertyUpdates: z.boolean().default(true),
  maintenanceUpdates: z.boolean().default(true),
  leaseReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

const displaySettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  compactView: z.boolean().default(false),
  showImages: z.boolean().default(true),
});

const privacySettingsSchema = z.object({
  shareUsageData: z.boolean().default(true),
  saveLoginHistory: z.boolean().default(true),
});

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");

  // Notification settings form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      propertyUpdates: true,
      maintenanceUpdates: true,
      leaseReminders: true,
      marketingEmails: false,
    },
  });

  // Display settings form
  const displayForm = useForm<z.infer<typeof displaySettingsSchema>>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: {
      theme: theme as "light" | "dark" | "system",
      compactView: false,
      showImages: true,
    },
  });

  // Privacy settings form
  const privacyForm = useForm<z.infer<typeof privacySettingsSchema>>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      shareUsageData: true,
      saveLoginHistory: true,
    },
  });

  const onNotificationSubmit = (data: z.infer<typeof notificationSettingsSchema>) => {
    trackEvent('update_settings', 'user_settings', 'notification_settings');
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  const onDisplaySubmit = (data: z.infer<typeof displaySettingsSchema>) => {
    setTheme(data.theme);
    
    trackEvent('update_settings', 'user_settings', 'display_settings');
    toast({
      title: "Settings Updated",
      description: "Your display preferences have been saved",
    });
  };

  const onPrivacySubmit = (data: z.infer<typeof privacySettingsSchema>) => {
    trackEvent('update_settings', 'user_settings', 'privacy_settings');
    toast({
      title: "Settings Updated",
      description: "Your privacy preferences have been saved",
    });
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-mid">Loading user settings...</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Settings" 
        description="Manage your account settings and preferences" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium">Settings</h1>
          <p className="text-neutral-mid">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Customize when and how you receive notifications
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
                              Receive notifications via email
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
                        name="propertyUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Property Updates
                              </FormLabel>
                              <FormDescription>
                                Updates about your properties
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
                        name="maintenanceUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Maintenance Updates
                              </FormLabel>
                              <FormDescription>
                                Updates on maintenance requests
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
                        name="leaseReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Lease Reminders
                              </FormLabel>
                              <FormDescription>
                                Reminders about lease renewals
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
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Marketing Emails
                              </FormLabel>
                              <FormDescription>
                                Receive promotional and marketing content
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
                    
                    <Button type="submit" className="bg-primary hover:bg-primary-dark">
                      Save Notification Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how the application appears to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...displayForm}>
                  <form onSubmit={displayForm.handleSubmit(onDisplaySubmit)} className="space-y-6">
                    <FormField
                      control={displayForm.control}
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
                          <FormDescription>
                            Choose between light, dark, or system theme
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={displayForm.control}
                        name="compactView"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Compact View
                              </FormLabel>
                              <FormDescription>
                                Display content in a more compact layout
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
                        control={displayForm.control}
                        name="showImages"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Show Images
                              </FormLabel>
                              <FormDescription>
                                Display property images in listings
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
                      Save Display Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-6">
                    <FormField
                      control={privacyForm.control}
                      name="shareUsageData"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Share Usage Data
                            </FormLabel>
                            <FormDescription>
                              Allow anonymous usage data to improve our service
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
                      control={privacyForm.control}
                      name="saveLoginHistory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Save Login History
                            </FormLabel>
                            <FormDescription>
                              Keep a record of your login activity
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
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <p className="text-sm text-neutral-mid">
                          You can request a copy of your data or delete your account at any time.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Button type="button" variant="outline">
                            Download My Data
                          </Button>
                          <Button type="button" variant="destructive">
                            Delete My Account
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="bg-primary hover:bg-primary-dark">
                      Save Privacy Settings
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
