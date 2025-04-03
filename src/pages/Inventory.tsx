
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
import { Search, Filter, Download, Plus, Pill, Calendar, Clipboard, AlertCircle, Upload } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UploadCSV from "@/components/UploadCSV";

const Inventory = () => {
  const { inventory } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState(inventory);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

    toast.success("Inventory exported successfully", {
      description: `${filteredInventory.length} items exported to CSV`
    });
  };

  const handleAction = (action: string, itemId: string) => {
    if (action === "edit") {
      toast.info("Edit functionality coming soon", {
        description: `Editing item ${itemId}`
      });
    } else if (action === "history") {
      toast.info("History view coming soon", {
        description: `Viewing history for item ${itemId}`
      });
    }
  };

  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiryDateStr: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDateStr);
    if (daysLeft < 0) return { class: "bg-red-100 text-medical-red", text: "Expired" };
    if (daysLeft <= 30) return { class: "bg-orange-100 text-medical-orange", text: `${daysLeft} days left` };
    if (daysLeft <= 90) return { class: "bg-yellow-100 text-amber-600", text: `${daysLeft} days left` };
    return { class: "bg-green-100 text-medical-green", text: "Valid" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Pill className="h-6 w-6 text-medical-blue" />
            <div>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>
                Manage and monitor your medicine stock levels
              </CardDescription>
            </div>
          </div>
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
                  <SelectItem value="all">All Categories</SelectItem>
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
                  <SelectItem value="all">All Levels</SelectItem>
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
              
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-medical-lightBlue">
                  <TableRow>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Expiry Date</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => {
                      const expiryStatus = getExpiryStatus(item.expiryDate);
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              {item.supplier && (
                                <span className="text-xs text-muted-foreground">
                                  Supplier: {item.supplier}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-medical-lightBlue/50 text-medical-blue border-medical-blue/20">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{item.currentStock}</span>
                                {item.currentStock <= item.minimumStock && (
                                  <AlertCircle className="h-4 w-4 text-medical-red" />
                                )}
                              </div>
                              <div className={getStockLevelClass(item.currentStock, item.minimumStock)}>
                                {item.currentStock <= item.minimumStock ? "Low" : 
                                 item.currentStock <= item.minimumStock * 2 ? "Medium" : "High"}
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                Min: {item.minimumStock}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{item.expiryDate}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center mt-1 ${expiryStatus.class}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {expiryStatus.text}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-xs border-medical-blue text-medical-blue hover:bg-medical-blue/10"
                                onClick={() => handleAction("edit", item.id)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-xs border-medical-blue text-medical-blue hover:bg-medical-blue/10"
                                onClick={() => handleAction("history", item.id)}
                              >
                                <Clipboard className="h-3.5 w-3.5 mr-1" />
                                History
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-medical-blue/10 p-3 rounded-full">
                            <Pill className="h-6 w-6 text-medical-blue" />
                          </div>
                          <p className="text-muted-foreground mt-2">No inventory items found</p>
                          {searchQuery || categoryFilter || stockFilter ? (
                            <p className="text-sm text-muted-foreground mt-1">
                              Try adjusting your search or filters
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground flex items-center justify-between">
            <span>Showing {filteredInventory.length} of {inventory.length} items</span>
            <div className="text-xs bg-medical-lightGreen px-3 py-1.5 rounded-full text-medical-green flex items-center">
              <span className="font-medium mr-1">Tip:</span> Click on any column header to sort the inventory
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import CSV Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Inventory Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file to update your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <UploadCSV onSuccess={() => setIsImportDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
