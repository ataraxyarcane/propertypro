import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, UserPlus, RefreshCw } from "lucide-react";
import { getUserInitials } from "@/types";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

// Form schema for user editing
const userFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "tenant"]),
  status: z.enum(["active", "inactive", "suspended"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users, isLoading, isError, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search query
  const filteredUsers = users?.filter((user) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm))
    );
  });

  // Form for editing user
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "tenant",
      status: "active",
    },
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      role: user.role as "admin" | "tenant",
      status: user.status as "active" | "inactive" | "suspended",
    });
    setIsUserDialogOpen(true);
  };

  const onUserFormSubmit = async (data: UserFormValues) => {
    if (!editingUser) return;

    try {
      await apiRequest("PUT", `/api/users/${editingUser.id}`, data);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      setIsUserDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiRequest("DELETE", `/api/users/${userToDelete.id}`);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      setUserToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <SEO 
        title="User Management" 
        description="Manage users in the property management system" 
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium">User Management</h1>
          <p className="text-neutral-mid">Manage user accounts in your system</p>
        </div>

        <Card>
          <CardHeader className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <CardTitle className="text-xl">Users</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-mid" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-full md:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="secondary"
                size="icon"
                onClick={() => refetch()}
                className="md:ml-2"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button className="bg-primary hover:bg-primary-dark flex gap-2 items-center">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-neutral-mid">Loading users...</p>
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <p className="text-destructive">Error loading users. Please try again.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 bg-primary-light text-white mr-2">
                                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-neutral-mid">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              user.status === "active" ? "success" : 
                              user.status === "suspended" ? "destructive" : "outline"
                            }>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.lastLogin)}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className="text-primary hover:text-primary-dark"
                              aria-label={`Edit ${user.username}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUserToDelete(user)}
                              className="text-destructive hover:text-destructive/80"
                              aria-label={`Delete ${user.username}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile here.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUserFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-dark">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
