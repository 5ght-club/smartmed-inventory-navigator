
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryStore } from "@/stores/inventoryStore";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const LowStockAlerts = () => {
  const { inventory } = useInventoryStore();
  
  // Get items with low stock
  const lowStockItems = inventory
    .filter(item => item.currentStock <= item.minimumStock)
    .sort((a, b) => 
      (a.currentStock / a.minimumStock) - (b.currentStock / b.minimumStock)
    )
    .slice(0, 5); // Top 5 lowest items

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-medical-red" />
          Low Stock Alerts
        </CardTitle>
        <CardDescription>
          Critical items that need reordering
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length > 0 ? (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-background">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-medical-red font-medium">{item.currentStock}</span>
                      <span className="text-muted-foreground text-xs"> / {item.minimumStock}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">In stock</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-medical-green/10 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-medical-green" />
            </div>
            <p className="mt-2 font-medium">All items are well stocked</p>
            <p className="text-sm text-muted-foreground">
              There are no items below minimum stock levels
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;
