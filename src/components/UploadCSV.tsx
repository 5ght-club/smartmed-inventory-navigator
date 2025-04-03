import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Check, FileText, AlertCircle } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { inventoryTable } from "@/types/supabase-adapter";
import { InventoryItem as StoreInventoryItem } from "@/stores/inventoryStore";

interface UploadCSVProps {
  onSuccess?: () => void;
}

const UploadCSV = ({ onSuccess }: UploadCSVProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setInventory } = useInventoryStore();
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(header => header.trim());
      
      const items = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(",").map(value => value.trim());
        const item: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          // Store all values as strings initially
          item[header] = values[index] || '';
        });
        
        items.push(item);
      }
      
      return items;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw error;
    }
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return null;
    
    // Try to parse various date formats and convert to YYYY-MM-DD
    try {
      // Check if it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Handle DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
      }
      
      // Handle MM/DD/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
      }
      
      // If we couldn't parse it, return null
      return null;
    } catch (error) {
      console.log("Error parsing date:", dateStr);
      return null;
    }
  };

  const saveToSupabase = async (items: any[]) => {
    if (!user) {
      toast.error("You must be logged in to save inventory data");
      return;
    }

    try {
      // First delete existing inventory data for this user
      const { error: deleteError } = await inventoryTable.delete({ user_id: user.id });
      
      if (deleteError) throw deleteError;

      // Prepare data for insertion with proper type conversion
      const inventoryData = items.map(item => {
        // Get the expiry date and format it correctly, if it exists
        const rawExpiryDate = item.expiryDate || item.expiry_date || item["Expiry Date"] || null;
        const formattedExpiryDate = formatDateString(rawExpiryDate);

        // Ensure numeric values are properly parsed as numbers
        const currentStock = parseInt(item.currentStock || item.current_stock || item["Current Stock"] || 0, 10);
        const minimumStock = parseInt(item.minimumStock || item.minimum_stock || item["Minimum Stock"] || 0, 10);
        const unitPrice = parseFloat(item.unitPrice || item.unit_price || item["Unit Price"] || 0);

        // Create an object that matches the required Supabase table structure
        return {
          user_id: user.id,
          // Ensure all required fields exist with proper types
          name: String(item.name || item.Name || "Unnamed Item"),
          category: String(item.category || item.Category || "Uncategorized"),
          current_stock: isNaN(currentStock) ? 0 : currentStock,
          minimum_stock: isNaN(minimumStock) ? 0 : minimumStock,
          expiry_date: formattedExpiryDate,
          unit_price: isNaN(unitPrice) ? 0 : unitPrice,
          supplier: item.supplier || item.Supplier || null,
          location: item.location || item.Location || null
        };
      });

      // Insert data
      const { error: insertError } = await inventoryTable.insert(inventoryData);
      
      if (insertError) throw insertError;
      
      return true;

    } catch (error: any) {
      console.error("Error saving to Supabase:", error);
      toast.error(`Failed to save to database: ${error.message}`);
      return false;
    }
  };

  const processFile = async (file: File) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      // Convert the parsed data to match our store's expected format
      const storeItems: StoreInventoryItem[] = data.map(item => ({
        id: item.id || Math.random().toString(36).substring(2, 11),
        name: String(item.name || item.Name || "Unnamed Item"),
        category: String(item.category || item.Category || "Uncategorized"),
        currentStock: parseInt(item.currentStock || item.current_stock || item["Current Stock"] || 0, 10),
        minimumStock: parseInt(item.minimumStock || item.minimum_stock || item["Minimum Stock"] || 0, 10),
        expiryDate: item.expiryDate || item.expiry_date || item["Expiry Date"] || "",
        unitPrice: parseFloat(item.unitPrice || item.unit_price || item["Unit Price"] || 0),
        supplier: item.supplier || item.Supplier || "",
        location: item.location || item.Location || ""
      }));
      
      // Set data to our store
      setInventory(storeItems);
      
      // Save to Supabase
      const saveSuccess = await saveToSupabase(data);
      
      if (saveSuccess) {
        toast.success("Inventory data uploaded successfully!", {
          description: `${data.length} items imported and saved to your account.`
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.warning("Data loaded locally but not saved to your account", {
          description: "Please try again or contact support if the issue persists."
        });
      }
    } catch (error: any) {
      toast.error("Failed to process CSV file", {
        description: error.message || "Unknown error occurred"
      });
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const csvRequiredFields = [
    { field: "name/Name", description: "Name of the medicine/product" },
    { field: "category/Category", description: "Product category (e.g., Pain Relief, Antibiotics)" },
    { field: "currentStock/current_stock/Current Stock", description: "Current quantity in stock" },
    { field: "minimumStock/minimum_stock/Minimum Stock", description: "Minimum required quantity" },
    { field: "unitPrice/unit_price/Unit Price", description: "Price per unit" },
    { field: "expiryDate/expiry_date/Expiry Date", description: "Expiry date (YYYY-MM-DD, DD-MM-YYYY, or MM/DD/YYYY)" },
    { field: "supplier/Supplier", description: "Supplier name (optional)" },
    { field: "location/Location", description: "Storage location (optional)" }
  ];

  const downloadSampleCSV = () => {
    const headers = "name,category,currentStock,minimumStock,unitPrice,expiryDate,supplier,location";
    const sampleRow1 = "Paracetamol 500mg,Pain Relief,120,50,0.15,2024-12-31,PharmaCorp,Shelf A1";
    const sampleRow2 = "Amoxicillin 250mg,Antibiotics,45,60,0.45,2024-10-15,MediSource,Shelf B2";
    
    const csvContent = [headers, sampleRow1, sampleRow2].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Sample CSV downloaded", {
      description: "Use this as a template for your inventory data"
    });
  };

  return (
    <Card className={`border-2 ${isDragging ? 'border-dashed border-primary' : ''}`}>
      <CardHeader>
        <CardTitle>Import Inventory Data</CardTitle>
        <CardDescription>
          Upload a CSV file with your inventory details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">CSV Format Instructions</AlertTitle>
          <AlertDescription className="mt-2 text-amber-700">
            <p className="mb-2">Your CSV file should include the following columns (column names are case-sensitive):</p>
            <ul className="space-y-1 pl-5 list-disc text-sm">
              {csvRequiredFields.map((field, index) => (
                <li key={index}>
                  <span className="font-semibold">{field.field}</span>: {field.description}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs bg-white"
                onClick={downloadSampleCSV}
              >
                <FileText className="h-3.5 w-3.5" />
                Download Sample CSV
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? 'bg-primary/5 border-primary' : 'border-muted'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drag and drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse from your computer
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Select File"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="flex items-start space-x-2">
          <Check className="h-5 w-5 text-medical-green mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>Your data will be securely stored in your account</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UploadCSV;
