
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInventoryStore } from "@/stores/inventoryStore";

const InventoryOverview = () => {
  const { inventory } = useInventoryStore();
  
  // Calculate stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
  const lowStockPercentage = totalItems ? Math.round((lowStockItems.length / totalItems) * 100) : 0;
  
  // Get categories with counts
  const categories = inventory.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by count (descending)
  const sortedCategories = Object.entries(categories)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5); // Top 5 categories

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Overview</CardTitle>
        <CardDescription>
          Stock levels by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Stock Status</p>
              <p className="text-xs text-muted-foreground">
                {lowStockItems.length} items below minimum stock level
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{lowStockPercentage}%</span>
              <div className="w-20">
                <Progress value={lowStockPercentage} className="h-2" 
                  indicatorClassName={
                    lowStockPercentage > 50 
                      ? "bg-medical-red" 
                      : lowStockPercentage > 20 
                        ? "bg-medical-orange" 
                        : "bg-medical-green"
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {totalItems ? (
              sortedCategories.map(([category, count]) => {
                const percentage = Math.round((count / totalItems) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{category}</p>
                      <span className="text-sm text-muted-foreground">
                        {count} items ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No inventory data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryOverview;
