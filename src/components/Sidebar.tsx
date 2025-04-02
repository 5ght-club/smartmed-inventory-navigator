
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  BarChart4, 
  Settings as SettingsIcon,
  Menu,
  X,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth < 768;
      setIsSmallScreen(smallScreen);
      
      // Auto-open sidebar on large screens
      if (!smallScreen && !isOpen) {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { title: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Inventory", path: "/inventory", icon: <Package className="h-5 w-5" /> },
    { title: "Analytics", path: "/analytics", icon: <BarChart4 className="h-5 w-5" /> },
    { title: "AI Chat", path: "/ai-chat", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", path: "/settings", icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      {isSmallScreen && (
        <Button
          variant="outline"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Desktop toggle button */}
      {!isSmallScreen && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar fixed top-0 left-0 h-full flex-shrink-0 flex flex-col border-r border-sidebar-border z-40 transition-all duration-200 ease-in-out",
          isOpen ? "w-64" : "w-0 md:w-16",
          isSmallScreen && !isOpen && "hidden"
        )}
      >
        <div className="p-6">
          <h1 className={cn("text-sidebar-foreground text-xl font-bold transition-opacity", 
            !isOpen && !isSmallScreen ? "opacity-0" : "opacity-100"
          )}>SmartMed</h1>
          <p className={cn("text-sidebar-foreground/70 text-sm transition-opacity", 
            !isOpen && !isSmallScreen ? "opacity-0" : "opacity-100"
          )}>Inventory Manager</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isSmallScreen && setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 rounded-md text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                isActive && "bg-sidebar-accent text-sidebar-foreground font-medium",
                !isOpen && !isSmallScreen && "justify-center px-2"
              )}
            >
              {item.icon}
              <span className={cn("ml-3 transition-opacity", 
                !isOpen && !isSmallScreen ? "opacity-0 w-0 hidden" : "opacity-100"
              )}>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border/20">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className={cn(
                "flex items-center text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                !isOpen && !isSmallScreen ? "justify-center px-2" : "justify-start"
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className={cn("transition-opacity", 
                !isOpen && !isSmallScreen ? "opacity-0 w-0 hidden" : "opacity-100"
              )}>Sign Out</span>
            </Button>
            <div className={cn(
              "flex items-center space-x-3 px-4 py-3",
              !isOpen && !isSmallScreen && "justify-center px-2"
            )}>
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground">
                U
              </div>
              <div className={cn("text-sidebar-foreground transition-opacity", 
                !isOpen && !isSmallScreen ? "opacity-0 w-0 hidden" : "opacity-100"
              )}>
                <p className="text-sm font-medium">User</p>
                <p className="text-xs opacity-70">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content shift when sidebar is open on desktop */}
      <div className={cn(
        "transition-all duration-200 ease-in-out md:pl-0",
        isOpen && !isSmallScreen ? "md:pl-64" : isSmallScreen ? "pl-0" : "md:pl-16"
      )} />
    </>
  );
};

export default Sidebar;
