
import { Bell, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";
import { useNotificationStore, NotificationType } from "@/stores/notificationStore";
import { useEffect, useState } from "react";
import { useInventoryStore } from "@/stores/inventoryStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'low-stock':
      return <Badge variant="outline" className="bg-red-50 text-medical-red border-medical-red/30 h-6 w-6 p-1 flex items-center justify-center">!</Badge>;
    case 'expiring':
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-300 h-6 w-6 p-1 flex items-center justify-center">⏱️</Badge>;
    case 'reorder':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300 h-6 w-6 p-1 flex items-center justify-center">🔄</Badge>;
    case 'critical':
      return <Badge variant="outline" className="bg-red-50 text-medical-red border-medical-red/30 h-6 w-6 p-1 flex items-center justify-center">⚠️</Badge>;
    case 'info':
    default:
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 h-6 w-6 p-1 flex items-center justify-center">i</Badge>;
  }
};

const Header = () => {
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { inventory } = useInventoryStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Format the pathname to get a nice title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  // Generate notifications based on inventory data
  useEffect(() => {
    const { addNotification } = useNotificationStore.getState();
    
    // Check for low stock items and generate notifications
    const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
    if (lowStockItems.length > 0 && lowStockItems.length <= 3) {
      lowStockItems.forEach(item => {
        addNotification({
          title: "Low Stock Alert",
          message: `${item.name} is running low (${item.currentStock}/${item.minimumStock})`,
          type: "low-stock",
          link: "/inventory"
        });
      });
    } else if (lowStockItems.length > 3) {
      addNotification({
        title: "Multiple Low Stock Alerts",
        message: `${lowStockItems.length} items are below minimum stock levels`,
        type: "low-stock",
        link: "/inventory"
      });
    }
    
    // Check for expiring items
    const today = new Date();
    const expiringItems = inventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const monthsUntilExpiry = (expiryDate.getFullYear() - today.getFullYear()) * 12 + 
                                (expiryDate.getMonth() - today.getMonth());
      return monthsUntilExpiry <= 1;
    });
    
    if (expiringItems.length > 0 && expiringItems.length <= 3) {
      expiringItems.forEach(item => {
        addNotification({
          title: "Expiring Soon",
          message: `${item.name} will expire on ${new Date(item.expiryDate!).toLocaleDateString()}`,
          type: "expiring",
          link: "/inventory"
        });
      });
    } else if (expiringItems.length > 3) {
      addNotification({
        title: "Multiple Expiring Items",
        message: `${expiringItems.length} items are expiring within the next month`,
        type: "expiring",
        link: "/inventory"
      });
    }
  }, [inventory]);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      // Close the popover
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  return (
    <header className="bg-background fixed top-0 left-0 right-0 z-10 border-b py-4 px-6 flex items-center justify-between md:ml-64">
      <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10 w-[250px] focus-visible:ring-medical-blue" 
            placeholder="Search medicines..."
          />
        </div>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-medical-red text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Notifications</h3>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-8"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-[400px]">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-muted/50 ${notification.read ? 'opacity-70' : 'bg-muted/20'}`}
                    >
                      <div className="flex gap-3">
                        <NotificationIcon type={notification.type} />
                        
                        <div className="flex-1">
                          {notification.link ? (
                            <Link 
                              to={notification.link} 
                              onClick={() => handleNotificationClick(notification.id, notification.link)}
                              className="block"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-semibold">{notification.title}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                            </Link>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-semibold">{notification.title}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <h3 className="font-medium text-foreground">No notifications</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're all caught up! Notifications about low stock, expiring items, and other alerts will appear here.
                  </p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default Header;
