import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { User, isAdmin, isPropertyOwner, canManageProperties } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  BarChart, 
  Settings, 
  Building, 
  FileText,
  UsersRound, 
  Drill, 
  User as UserIcon,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-simple-auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuToggle = document.getElementById('sidebar-toggle');
      
      if (
        sidebar && 
        isOpen && 
        !sidebar.contains(event.target as Node) && 
        menuToggle !== event.target && 
        !menuToggle?.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const isActive = (path: string) => {
    // For exact matches, only highlight when the path matches exactly
    if (path === '/properties') {
      return location === '/properties';
    }
    if (path === '/owner/properties') {
      return location === '/owner/properties';
    }
    // For other paths, allow sub-routes
    return location === path || location.startsWith(`${path}/`);
  };
  
  return (
    <aside 
      id="sidebar"
      className={cn(
        "bg-white w-64 shadow-md md:shadow-none fixed inset-y-0 flex-shrink-0 md:sticky top-0 z-20 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">

        
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-1">
          {/* Admin navigation */}
          {isAdmin(user) && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-neutral-mid uppercase">
                Admin Dashboard
              </div>
              
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/admin/dashboard") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/admin/users") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              </Link>
              
              <Link href="/admin/analytics">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/admin/analytics") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              
              <Link href="/admin/settings">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/admin/settings") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </Link>
              
              <div className="border-t border-gray-200 my-2"></div>
            </>
          )}
          
          {/* Property Owner Dashboard */}
          {isPropertyOwner(user) && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-neutral-mid uppercase">
                Property Management
              </div>
              
              <Link href="/owner/dashboard">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/owner/dashboard") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Owner Dashboard
                </Button>
              </Link>
              
              <Link href="/properties/add">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/properties/add") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <Building className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </Link>
              
              <Link href="/owner/properties">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/owner/properties") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <Building className="mr-2 h-4 w-4" />
                  My Properties
                </Button>
              </Link>
            </>
          )}
          
          {/* General Properties Browsing */}
          <div className="px-3 py-2 text-xs font-semibold text-neutral-mid uppercase">
            {isPropertyOwner(user) ? 'Browse All Properties' : 'Properties'}
          </div>
          
          <Link href="/properties">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/properties") && "bg-primary/10 text-primary border-l-4 border-primary"
              )}
            >
              <Building className="mr-2 h-4 w-4" />
              {isPropertyOwner(user) ? 'All Properties' : 'Properties'}
            </Button>
          </Link>
          
          {/* Management features - visible to admins and property owners */}
          {canManageProperties(user) && (
            <>
              <Link href="/leases">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/leases") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Leases
                </Button>
              </Link>
              
              <Link href="/tenants">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive("/tenants") && "bg-primary/10 text-primary border-l-4 border-primary"
                  )}
                >
                  <UsersRound className="mr-2 h-4 w-4" />
                  Tenants
                </Button>
              </Link>
            </>
          )}
          
          {/* Maintenance - visible to all users but with different context */}
          <Link href="/maintenance">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/maintenance") && "bg-primary/10 text-primary border-l-4 border-primary"
              )}
            >
              <Drill className="mr-2 h-4 w-4" />
              {canManageProperties(user) ? 'Maintenance Requests' : 'Request Maintenance'}
            </Button>
          </Link>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          <div className="px-3 py-2 text-xs font-semibold text-neutral-mid uppercase">
            Your Account
          </div>
          
          <Link href="/profile">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/profile") && "bg-primary/10 text-primary border-l-4 border-primary"
              )}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          
          <Link href="/settings">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/settings") && "bg-primary/10 text-primary border-l-4 border-primary"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </nav>
      </div>
    </aside>
  );
}
