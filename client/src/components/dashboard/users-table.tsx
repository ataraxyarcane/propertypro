import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2
} from 'lucide-react';
import { User, getUserInitials } from '@/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onViewAll?: () => void;
}

export default function UsersTable({ users, onEdit, onDelete, onViewAll }: UsersTableProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary-light bg-opacity-10 text-primary';
      case 'tenant':
        return 'bg-secondary-light bg-opacity-10 text-secondary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success bg-opacity-10 text-success';
      case 'pending':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'suspended':
        return 'bg-destructive bg-opacity-10 text-destructive';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatLastActivity = (date: string | null | undefined) => {
    if (!date) return 'Never';
    
    const lastLogin = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };
  
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };
  
  const confirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setUserToDelete(null);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="px-4 py-3 border-b flex-row justify-between items-center space-y-0">
          <CardTitle className="font-medium text-base">Recent Users</CardTitle>
          {onViewAll && (
            <Button variant="link" className="text-primary p-0 h-auto" onClick={onViewAll}>
              View all
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-neutral-mid uppercase tracking-wider">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 bg-primary-light text-white">
                          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-neutral-mid">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getRoleStyle(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getStatusStyle(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatLastActivity(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        className="text-primary hover:text-primary-dark mr-2"
                        aria-label={`Edit ${user.username}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(user)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label={`Delete ${user.username}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-mid">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{' '}
              <span className="font-semibold">{userToDelete?.username}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
