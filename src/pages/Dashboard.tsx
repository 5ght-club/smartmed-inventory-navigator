
import { Package, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import StatCard from "@/components/StatCard";
import UploadCSV from "@/components/UploadCSV";
import InventoryOverview from "@/components/InventoryOverview";
import LowStockAlerts from "@/components/LowStockAlerts";
import { useInventoryStore } from "@/stores/inventoryStore";

const Dashboard = () => {
  const { inventory } = useInventoryStore();
  
  // Calculate dashboard metrics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => {
    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
    return sum + (item.currentStock * price);
  }, 0).toFixed(2);
  
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock).length;
  const expiringItems = inventory.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const monthsUntilExpiry = (expiryDate.getFullYear() - today.getFullYear()) * 12 + 
                              (expiryDate.getMonth() - today.getMonth());
    return monthsUntilExpiry <= 3;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Inventory Items" 
          value={totalItems}
          icon={Package}
          description="Different medicines in stock"
          trend={{ value: 3.2, isPositive: true }}
        />
        
        <StatCard 
          title="Low Stock Items" 
          value={lowStockItems}
          icon={AlertCircle}
          description="Items below minimum level"
          trend={{ value: 2.1, isPositive: false }}
          className={lowStockItems > 0 ? "border-medical-red/20" : ""}
        />
        
        <StatCard 
          title="Expiring Soon" 
          value={expiringItems}
          icon={RefreshCw}
          description="Items expiring in next 3 months"
          trend={{ value: 0.5, isPositive: false }}
        />
        
        <StatCard 
          title="Total Inventory Value" 
          value={`$${totalValue}`}
          icon={DollarSign}
          description="Current stock value"
          trend={{ value: 1.8, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UploadCSV />
        </div>
        
        <div className="lg:col-span-1">
          <InventoryOverview />
        </div>
        
        <div className="lg:col-span-1">
          <LowStockAlerts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
