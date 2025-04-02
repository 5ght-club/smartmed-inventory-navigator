
import { BellIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  // Format the pathname to get a nice title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    return path.charAt(1).toUpperCase() + path.slice(2);
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
        
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-medical-red text-white text-xs flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
