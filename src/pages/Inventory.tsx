
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Plus } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Inventory = () => {
  const { inventory } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState(inventory);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  // Get unique categories for filter
  const categories = Array.from(new Set(inventory.map(item => item.category))).sort();

  // Filter inventory when search or filters change
  useEffect(() => {
    let results = inventory;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    // Apply stock level filter
    if (stockFilter) {
      switch (stockFilter) {
        case "low":
          results = results.filter(item => item.currentStock <= item.minimumStock);
          break;
        case "medium":
          results = results.filter(item => 
            item.currentStock > item.minimumStock && 
            item.currentStock <= item.minimumStock * 2
          );
          break;
        case "high":
          results = results.filter(item => item.currentStock > item.minimumStock * 2);
          break;
      }
    }
    
    setFilteredInventory(results);
  }, [inventory, searchQuery, categoryFilter, stockFilter]);

  // Function to get stock level class
  const getStockLevelClass = (current: number, minimum: number) => {
    if (current <= minimum) return "stock-level-low stock-level-box";
    if (current <= minimum * 2) return "stock-level-medium stock-level-box";
    return "stock-level-high stock-level-box";
  };

  // Function to export inventory as CSV
  const exportCSV = () => {
    const headers = ["id", "name", "category", "currentStock", "minimumStock", "expiryDate", "unitPrice"];
    
    const csvRows = [
      headers.join(","),
      ...filteredInventory.map(item => 
        headers.map(header => item[header as keyof typeof item]).join(",")
      )
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>
            Manage and monitor your medicine stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>{categoryFilter || "Category"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>{stockFilter ? `${stockFilter.charAt(0).toUpperCase() + stockFilter.slice(1)} Stock` : "Stock Level"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="medium">Medium Stock</SelectItem>
                  <SelectItem value="high">High Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{item.currentStock}</span>
                          <span className={getStockLevelClass(item.currentStock, item.minimumStock)}>
                            {item.currentStock <= item.minimumStock ? "Low" : 
                             item.currentStock <= item.minimumStock * 2 ? "Medium" : "High"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">History</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <p className="text-muted-foreground">No inventory items found</p>
                      {searchQuery || categoryFilter || stockFilter ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your search or filters
                        </p>
                      ) : null}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredInventory.length} of {inventory.length} items
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
