import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-simple-auth';
import { Link } from 'wouter';
import { User, getUserInitials, isPropertyOwner } from '@/types';
import { Button } from '@/components/ui/button';
import { Menu, Bell, ChevronDown, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuClick: () => void;
  user: User | null;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const { logout } = useAuth();
  const [notificationCount] = useState(3); // Example notification count
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={onMenuClick}
            aria-label="Toggle sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-medium flex items-center">
              <span className="text-primary mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M8 10h.01" />
                  <path d="M16 10h.01" />
                  <path d="M8 14h.01" />
                  <path d="M16 14h.01" />
                </svg>
              </span>
              <span className="text-primary font-medium">PropertyPro</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 p-1">
                <Avatar className="h-8 w-8 bg-primary text-white">
                  <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block">
                  {user?.firstName || user?.username}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">Your Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
