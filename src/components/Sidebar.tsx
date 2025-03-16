
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  BarChart4, 
  Settings as SettingsIcon,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { title: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Inventory", path: "/inventory", icon: <Package className="h-5 w-5" /> },
    { title: "Analytics", path: "/analytics", icon: <BarChart4 className="h-5 w-5" /> },
    { title: "Settings", path: "/settings", icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside 
        className={cn(
          "bg-sidebar fixed top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col border-r border-sidebar-border z-40 transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <h1 className="text-sidebar-foreground text-xl font-bold">SmartMed</h1>
          <p className="text-sidebar-foreground/70 text-sm">Inventory Manager</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 rounded-md text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border/20">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground">
              U
            </div>
            <div className="text-sidebar-foreground">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs opacity-70">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
