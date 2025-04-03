
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotificationStore, NotificationType } from "@/stores/notificationStore";
import { Bell, RefreshCw, ShieldAlert, Package } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const notificationFormSchema = z.object({
  lowStock: z.boolean().default(true),
  expiring: z.boolean().default(true),
  reorder: z.boolean().default(true),
  critical: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  notificationFrequency: z.enum(["immediate", "hourly", "daily"]).default("immediate"),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const NotificationSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { clearAll } = useNotificationStore();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      lowStock: true,
      expiring: true,
      reorder: true,
      critical: true,
      emailNotifications: false,
      pushNotifications: true,
      notificationFrequency: "immediate",
    },
  });

  const onSubmit = async (values: NotificationFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Notification settings saved:", values);
    toast.success("Notification settings saved successfully");
    setIsSaving(false);
  };

  const handleClearAllNotifications = () => {
    clearAll();
    toast.success("All notifications cleared");
  };

  const getNotificationTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "low-stock":
        return <Package className="h-4 w-4" />;
      case "expiring":
        return <RefreshCw className="h-4 w-4" />;
      case "reorder":
        return <Bell className="h-4 w-4" />;
      case "critical":
        return <ShieldAlert className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you receive notifications and alerts from the system.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Types</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lowStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Low Stock Alerts</FormLabel>
                        <FormDescription>
                          Receive notifications when inventory items are running low
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
                  control={form.control}
                  name="expiring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Expiring Items</FormLabel>
                        <FormDescription>
                          Get alerts for items approaching expiration dates
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
                  control={form.control}
                  name="reorder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Reorder Alerts</FormLabel>
                        <FormDescription>
                          Be notified when items need to be reordered
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
                  control={form.control}
                  name="critical"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Critical Alerts</FormLabel>
                        <FormDescription>
                          Receive high-priority notifications for urgent matters
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Delivery Methods</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Email Notifications</FormLabel>
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
                <FormField
                  control={form.control}
                  name="pushNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>In-App Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications within the application
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Frequency</h3>
              <FormField
                control={form.control}
                name="notificationFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update Frequency</FormLabel>
                    <FormDescription>
                      Choose how often you want to receive notifications
                    </FormDescription>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="immediate" aria-label="Immediate">
                          Immediate
                        </ToggleGroupItem>
                        <ToggleGroupItem value="hourly" aria-label="Hourly">
                          Hourly
                        </ToggleGroupItem>
                        <ToggleGroupItem value="daily" aria-label="Daily">
                          Daily
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Management</h3>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearAllNotifications}
                className="w-full md:w-auto"
              >
                Clear All Notifications
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default NotificationSettings;
