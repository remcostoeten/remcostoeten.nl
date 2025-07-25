import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  FileText, 
  LogOut,
  User
} from "lucide-react";
import { useAuthContext } from 'from "@/modules/auth/providers/AuthProvider"';
import { toast } from "sonner";

const navigation = [
  {
    name: "Analytics",
    href: "/admin", 
    icon: BarChart3,
  },
  {
    name: "CMS",
    href: "/admin/cms",
    icon: FileText,
  },
  {
    name: "Settings", 
    href: "/admin/settings",
    icon: Settings,
  },
];

type TProps = {
  children?: React.ReactNode;
};

export function DashboardLayout({ children }: TProps) {
  const { user, logout } = useAuthContext();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Error signing out");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User info and logout */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Administrator
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children || <Outlet />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
