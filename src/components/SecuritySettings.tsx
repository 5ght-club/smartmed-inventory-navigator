
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, KeyRound, ShieldCheck, UserRoundCheck, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const securityFormSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.boolean().default(false),
  activityLogging: z.boolean().default(true),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

const SecuritySettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      twoFactorAuth: false,
      sessionTimeout: false,
      activityLogging: true,
    },
  });

  const onSubmit = async (values: SecurityFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Security settings saved:", values);
    if (values.password) {
      toast.success("Password updated successfully");
    } else {
      toast.success("Security settings saved successfully");
    }
    
    // Reset password fields
    form.reset({
      ...values,
      password: "",
      confirmPassword: "",
    });
    
    setIsPasswordOpen(false);
    setIsSaving(false);
  };

  const lastLoginDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and authentication preferences.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <UserRoundCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Account Information</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Email: {user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last login: {lastLoginDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Collapsible open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Password Management</h3>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {isPasswordOpen ? "Cancel" : "Change Password"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use at least 8 characters with a mix of letters, numbers, and symbols
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-medium">
                <ShieldCheck className="h-5 w-5 mr-2" />
                Security Features
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="twoFactorAuth"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Two-Factor Authentication
                        </FormLabel>
                        <FormDescription>
                          Require a verification code when signing in
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
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center">
                          <KeyRound className="h-4 w-4 mr-2" />
                          Auto Session Timeout
                        </FormLabel>
                        <FormDescription>
                          Automatically log out after 30 minutes of inactivity
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
                  name="activityLogging"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Activity Logging</FormLabel>
                        <FormDescription>
                          Log account activity for security monitoring
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

            <div className="pt-2">
              <Button variant="outline" type="button" className="text-destructive border-destructive hover:bg-destructive/10">
                Log Out of All Devices
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

export default SecuritySettings;
