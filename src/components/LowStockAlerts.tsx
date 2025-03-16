
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryStore } from "@/stores/inventoryStore";
import { AlertCircle, Pill, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LowStockAlerts = () => {
  const { inventory } = useInventoryStore();
  
  // Get items with low stock
  const lowStockItems = inventory
    .filter(item => item.currentStock <= item.minimumStock)
    .sort((a, b) => 
      (a.currentStock / a.minimumStock) - (b.currentStock / b.minimumStock)
    )
    .slice(0, 5); // Top 5 lowest items

  const handleReorder = (itemId: string, itemName: string) => {
    toast.success(`Reorder initiated for ${itemName}`, {
      description: "Purchase order has been created",
      action: {
        label: "View Order",
        onClick: () => console.log(`View order for item ${itemId}`)
      }
    });
  };

  // Calculate criticality percentage
  const getCriticalityPercentage = (current: number, minimum: number) => {
    return Math.min(100, Math.round((current / minimum) * 100));
  };

  return (
    <Card className="border-medical-red/20 hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-medical-red" />
          <CardTitle className="text-xl">Low Stock Alerts</CardTitle>
        </div>
        <CardDescription>
          Critical items that need reordering
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length > 0 ? (
          <div className="space-y-3">
            {lowStockItems.map((item) => {
              const criticalityPercentage = getCriticalityPercentage(item.currentStock, item.minimumStock);
              const isVeryCritical = criticalityPercentage < 50;
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isVeryCritical 
                      ? "bg-red-50 border border-medical-red/20" 
                      : "bg-orange-50 border border-medical-orange/20"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      isVeryCritical ? "bg-medical-red/10" : "bg-medical-orange/10"
                    }`}>
                      <Pill className={`h-4 w-4 ${
                        isVeryCritical ? "text-medical-red" : "text-medical-orange"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm">
                        <span className={isVeryCritical ? "text-medical-red font-medium" : "text-medical-orange font-medium"}>
                          {item.currentStock}
                        </span>
                        <span className="text-muted-foreground text-xs"> / {item.minimumStock}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">In stock</p>
                    </div>
                    <Button 
                      variant={isVeryCritical ? "default" : "outline"}
                      size="sm" 
                      className={`text-xs h-8 ${
                        isVeryCritical 
                          ? "bg-medical-red hover:bg-medical-red/90" 
                          : "text-medical-orange border-medical-orange hover:bg-medical-orange/10"
                      }`}
                      onClick={() => handleReorder(item.id, item.name)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Reorder
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {lowStockItems.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full text-sm mt-2 border-dashed border-medical-red/30 text-medical-red hover:bg-medical-red/5"
              >
                View All Low Stock Items ({inventory.filter(i => i.currentStock <= i.minimumStock).length})
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-medical-green/10 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-medical-green" />
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
