
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Pill, PieChart, ShieldAlert } from "lucide-react";

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

  // Function to get category icon
  const getCategoryIcon = (category: string) => {
    const defaultIcon = <Pill className="h-3.5 w-3.5" />;
    
    const iconMap: Record<string, JSX.Element> = {
      "Antibiotics": <ShieldAlert className="h-3.5 w-3.5" />,
      "Pain Relief": <ShieldAlert className="h-3.5 w-3.5" />,
      // Add more category-specific icons as needed
    };
    
    return iconMap[category] || defaultIcon;
  };

  return (
    <Card className="border-medical-blue/20 hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-medical-blue" />
          <CardTitle className="text-xl">Inventory Overview</CardTitle>
        </div>
        <CardDescription>
          Stock levels by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-medical-lightBlue p-3 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-medical-blue">Critical Stock Status</p>
              <p className="text-xs text-medical-blue/80">
                {lowStockItems.length} items below minimum stock level
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${
                lowStockPercentage > 50 
                  ? "text-medical-red" 
                  : lowStockPercentage > 20 
                    ? "text-medical-orange" 
                    : "text-medical-green"
              }`}>{lowStockPercentage}%</span>
              <div className="w-20">
                <Progress 
                  value={lowStockPercentage} 
                  className="h-2" 
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

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-medical-blue">Category Distribution</h4>
            {totalItems ? (
              sortedCategories.map(([category, count]) => {
                const percentage = Math.round((count / totalItems) * 100);
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-medical-blue/10 flex items-center justify-center mr-2">
                          {getCategoryIcon(category)}
                        </div>
                        <p className="text-sm font-medium">{category}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {count} items ({percentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-1.5" 
                      indicatorClassName="bg-medical-blue/80"
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Pill className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No inventory data available</p>
                <p className="text-xs text-muted-foreground mt-1">Upload a CSV to see category distribution</p>
              </div>
            )}
          </div>
          
          {totalItems > 0 && (
            <div className="text-xs bg-medical-lightGreen px-3 py-2 rounded-lg text-medical-green mt-2">
              <span className="font-medium">Inventory Health:</span> {" "}
              {lowStockPercentage > 20 
                ? "Some categories need attention" 
                : "All categories well stocked"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryOverview;
