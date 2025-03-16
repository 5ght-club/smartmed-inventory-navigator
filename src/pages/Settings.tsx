
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure your inventory management system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facility-name">Facility Name</Label>
                <Input id="facility-name" placeholder="Enter facility name" defaultValue="Main Hospital Pharmacy" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@example.com" defaultValue="admin@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="low-stock-threshold">Low Stock Threshold (% of minimum)</Label>
                <Input id="low-stock-threshold" type="number" defaultValue="100" />
                <p className="text-sm text-muted-foreground mt-1">
                  Items will be marked as low stock when they reach this percentage of their minimum stock level
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the interface
                  </p>
                </div>
                <Switch id="dark-mode" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for critical inventory events
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when items fall below minimum stock level
                  </p>
                </div>
                <Switch id="low-stock-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expiry-alerts">Expiry Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when items are approaching expiry date
                  </p>
                </div>
                <Switch id="expiry-alerts" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiry-period">Expiry Alert Period (days)</Label>
                <Input id="expiry-period" type="number" defaultValue="90" />
                <p className="text-sm text-muted-foreground mt-1">
                  Get alerts when items are within this many days of expiry
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your inventory data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>CSV Import/Export</Label>
                <p className="text-sm text-muted-foreground">
                  Import data from CSV files or export your current inventory
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline">Import Data</Button>
                  <Button variant="outline">Export Data</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Backup & Restore</Label>
                <p className="text-sm text-muted-foreground">
                  Create backups of your inventory data or restore from previous backups
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline">Create Backup</Button>
                  <Button variant="outline">Restore Data</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-medical-red">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all inventory data (this cannot be undone)
                </p>
                <Button variant="destructive" className="mt-2">Reset System</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
