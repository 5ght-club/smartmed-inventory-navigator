import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useInventoryStore, InventoryItem as StoreInventoryItem } from "@/stores/inventoryStore";
import { useEffect } from "react";
import { inventoryTable } from "@/types/supabase-adapter";
import { useAuth } from "@/contexts/AuthContext";

const Analytics = () => {
  const { inventory, setInventory } = useInventoryStore();
  const { user } = useAuth();
  
  // Fetch inventory data from Supabase when the component mounts
  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await inventoryTable.select();
        
        if (error) {
          console.error("Error fetching inventory:", error);
          return;
        }
        
        if (data) {
          // Convert from Supabase format to Store format
          const storeItems = data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            currentStock: item.current_stock,
            minimumStock: item.minimum_stock,
            expiryDate: item.expiry_date || "",
            unitPrice: item.unit_price,
            supplier: item.supplier || "",
            location: item.location || ""
          }));
          setInventory(storeItems);
        }
      } catch (error) {
        console.error("Error in fetchInventory:", error);
      }
    };
    
    fetchInventory();
  }, [user, setInventory]);
  
  // Prepare category data for charts
  const getCategoryData = () => {
    const categoryCounts: Record<string, number> = {};
    
    inventory.forEach(item => {
      if (!categoryCounts[item.category]) {
        categoryCounts[item.category] = 0;
      }
      categoryCounts[item.category]++;
    });
    
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Prepare stock level data
  const getStockLevelData = () => {
    const levels = [
      { name: "Low Stock", value: 0, color: "#FF6B6B" },
      { name: "Medium Stock", value: 0, color: "#FF9F5A" },
      { name: "High Stock", value: 0, color: "#6ECEB2" }
    ];
    
    inventory.forEach(item => {
      if (item.currentStock <= item.minimumStock) {
        levels[0].value++;
      } else if (item.currentStock <= item.minimumStock * 2) {
        levels[1].value++;
      } else {
        levels[2].value++;
      }
    });
    
    return levels;
  };
  
  // Calculate total value by category
  const getValueByCategory = () => {
    const categoryValues: Record<string, number> = {};
    
    inventory.forEach(item => {
      const value = item.currentStock * Number(item.unitPrice);
      if (!categoryValues[item.category]) {
        categoryValues[item.category] = 0;
      }
      categoryValues[item.category] += value;
    });
    
    return Object.entries(categoryValues)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  };
  
  const categoryData = getCategoryData();
  const stockLevelData = getStockLevelData();
  const valueByCategory = getValueByCategory();
  
  // Colors for pie chart
  const COLORS = ['#2D87C8', '#6ECEB2', '#FF9F5A', '#FF6B6B', '#B39DDB', '#90CAF9', '#AED581'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="value">Inventory Value</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
              <CardDescription>
                Distribution of medicine items across categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} items`, 'Count']}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Number of Items" 
                    fill="#2D87C8" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stock" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Distribution</CardTitle>
                <CardDescription>
                  Breakdown of inventory by stock status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockLevelData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {stockLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Details</CardTitle>
                <CardDescription>
                  Current inventory status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 mt-4">
                  {stockLevelData.map((level, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: level.color }}
                          ></div>
                          <span className="font-medium">{level.name}</span>
                        </div>
                        <span className="font-bold">{level.value} items</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(level.value / inventory.length) * 100}%`,
                            backgroundColor: level.color 
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {((level.value / inventory.length) * 100).toFixed(1)}% of total inventory
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="value" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value by Category</CardTitle>
              <CardDescription>
                Financial distribution across medicine categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={valueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `$${value}`}
                  >
                    {valueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
