
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Check, AlertCircle } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const UploadCSV = () => {
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
      
      // Validate required headers
      const requiredHeaders = ["id", "name", "category", "currentStock", "minimumStock", "expiryDate", "unitPrice"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`CSV is missing required headers: ${missingHeaders.join(", ")}`);
      }
      
      const items = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(",").map(value => value.trim());
        const item: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          // Parse numeric values
          if (["currentStock", "minimumStock", "unitPrice"].includes(header)) {
            item[header] = parseFloat(values[index]);
          } else {
            item[header] = values[index];
          }
        });
        
        items.push(item);
      }
      
      return items;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw error;
    }
  };

  const saveToSupabase = async (items: any[]) => {
    if (!user) {
      toast.error("You must be logged in to save inventory data");
      return;
    }

    try {
      // First delete existing inventory data for this user
      const { error: deleteError } = await supabase
        .from('inventory_data')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;

      // Then insert the new inventory data
      const supabaseData = items.map(item => ({
        user_id: user.id,
        name: item.name,
        category: item.category,
        current_stock: item.currentStock,
        minimum_stock: item.minimumStock,
        expiry_date: item.expiryDate,
        unit_price: item.unitPrice,
        supplier: item.supplier || null,
        location: item.location || null
      }));

      const { error: insertError } = await supabase
        .from('inventory_data')
        .insert(supabaseData);
      
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
      
      // Set data to our store
      setInventory(data);
      
      // Save to Supabase
      const saveSuccess = await saveToSupabase(data);
      
      if (saveSuccess) {
        toast.success("Inventory data uploaded successfully!", {
          description: `${data.length} items imported and saved to your account.`
        });
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

  return (
    <Card className={`border-2 ${isDragging ? 'border-dashed border-primary' : ''}`}>
      <CardHeader>
        <CardTitle>Import Inventory Data</CardTitle>
        <CardDescription>
          Upload a CSV file with your medicine inventory details
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              Select File
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-medical-orange mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Required CSV format:</p>
            <p>Your CSV file must include these columns:</p>
            <p className="font-mono text-xs bg-muted p-1.5 rounded mt-1">
              id, name, category, currentStock, minimumStock, expiryDate, unitPrice
            </p>
          </div>
        </div>
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
