"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

// User interface based on the auth types
interface User {
  id: number;
  reference: string;
  phone: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  nationality: string;
  gender: string;
  date_of_birth: string | null;
  is_active: boolean;
  is_admin: boolean;
  role: string;
  groups: string[];
  picture: string | null;
  picture_url: string | null;
  created_at?: string;
  updated_at?: string;
}

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Stats calculated from users
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.is_active).length;
  const inactiveUsers = users.filter((user) => !user.is_active).length;
  const adminUsers = users.filter((user) => user.is_admin).length;

  // Sort users whenever users or sortDirection changes
  useEffect(() => {
    const sorted = [...users].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
    setSortedUsers(sorted);
  }, [users, sortDirection]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return sortedUsers.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.phone.toLowerCase().includes(searchLower) ||
        user.nationality.toLowerCase().includes(searchLower) ||
        user.reference.toLowerCase().includes(searchLower) ||
        user.groups.some((group) =>
          group.toLowerCase().includes(searchLower)
        ) ||
        (user.date_of_birth && user.date_of_birth.includes(searchLower)) ||
        user.id.toString().includes(searchLower);

      const matchesRole =
        roleFilter === "all" ||
        user.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [sortedUsers, searchQuery, roleFilter, statusFilter]);

  // Refresh users data
  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Try admin endpoint first, fallback to regular users endpoint
      let res = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/list_all_users/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // If admin endpoint fails, try regular users endpoint
      if (!res.ok && res.status === 404) {
        console.log("Admin endpoint not found, trying regular users endpoint");
        res = await fetch(`${API_BASE_URL}/api/v1/users/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Users fetch failed:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        throw new Error(
          errorData?.detail ||
            `Failed to fetch users: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("Users data received:", data);

      // Handle different response formats
      const usersData = data.users || data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);

      toast({
        title: "Users Refreshed",
        description: "User data has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Unknown error occurred while fetching users");
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  useEffect(() => {
    refreshUsers();
  }, []);

  // Toggle user active status
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setActionLoading(`status-${id}`);
    try {
      const token = localStorage.getItem("token");
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");

      // Try admin endpoint first, fallback to regular users endpoint
      let url = `${API_BASE_URL}/api/v1/admin/users/${id}/`;
      let payload = { ...user, is_active: !currentStatus };

      let res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      // If admin endpoint fails, try regular users endpoint
      if (!res.ok && res.status === 404) {
        console.log("Admin endpoint not found, trying regular users endpoint");
        url = `${API_BASE_URL}/api/v1/users/${id}/`;
        res = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("User status update failed:", {
          status: res.status,
          statusText: res.statusText,
          error: responseBody,
        });
        throw new Error(
          responseBody?.detail ||
            `Failed to update user status: ${res.status} ${res.statusText}`
        );
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, is_active: !currentStatus } : user
        )
      );

      toast({
        title: `User ${!currentStatus ? "Activated" : "Deactivated"}`,
        description: responseBody?.message || undefined,
      });

      // Refresh data to ensure consistency
      setTimeout(() => refreshUsers(), 1000);
    } catch (err: any) {
      console.error("Error updating user status:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user
  const handleDelete = async (id: number) => {
    setActionLoading(`delete-${id}`);
    try {
      const token = localStorage.getItem("token");

      // Try admin endpoint first, fallback to regular users endpoint
      let url = `${API_BASE_URL}/api/v1/admin/users/${id}/`;
      let res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // If admin endpoint fails, try regular users endpoint
      if (!res.ok && res.status === 404) {
        console.log("Admin endpoint not found, trying regular users endpoint");
        url = `${API_BASE_URL}/api/v1/users/${id}/`;
        res = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("User delete failed:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        throw new Error(
          errorData?.detail ||
            `Failed to delete user: ${res.status} ${res.statusText}`
        );
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast({ title: "User Deleted" });

      // Refresh data to ensure consistency
      setTimeout(() => refreshUsers(), 1000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // View user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      nationality: user.nationality,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      role: user.role,
      is_admin: user.is_admin,
    });
    setEditDialogOpen(true);
  };

  // Save user edits
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setActionLoading(`edit-${selectedUser.id}`);
    try {
      const token = localStorage.getItem("token");

      // Try admin endpoint first, fallback to regular users endpoint
      let url = `${API_BASE_URL}/api/v1/admin/users/${selectedUser.id}/`;
      let payload = { ...selectedUser, ...editForm };

      let res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      // If admin endpoint fails, try regular users endpoint
      if (!res.ok && res.status === 404) {
        console.log("Admin endpoint not found, trying regular users endpoint");
        url = `${API_BASE_URL}/api/v1/users/${selectedUser.id}/`;
        res = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("User update failed:", {
          status: res.status,
          statusText: res.statusText,
          error: responseBody,
        });
        throw new Error(
          responseBody?.detail ||
            `Failed to update user: ${res.status} ${res.statusText}`
        );
      }

      // Update the user in the list
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? { ...user, ...editForm } : user
        )
      );

      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });

      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});

      // Refresh data to ensure consistency
      setTimeout(() => refreshUsers(), 1000);
    } catch (err: any) {
      console.error("Error updating user:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage your users here</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-start justify-between rounded-xl bg-muted/40 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Users
            </span>
          </div>
          <span className="text-3xl font-bold text-foreground">
            {totalUsers}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-green-50 dark:bg-green-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
            <UserCheck className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Active Users
            </span>
          </div>
          <span className="text-3xl font-bold text-green-700 dark:text-green-400">
            {activeUsers}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-red-50 dark:bg-red-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
            <UserX className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Inactive Users
            </span>
          </div>
          <span className="text-3xl font-bold text-red-700 dark:text-red-400">
            {inactiveUsers}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-blue-50 dark:bg-blue-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Admins
            </span>
          </div>
          <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            {adminUsers}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Results Counter */}
          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {totalUsers} users
              {searchQuery && ` matching "${searchQuery}"`}
              {roleFilter !== "all" && ` with role "${roleFilter}"`}
              {statusFilter !== "all" && ` with status "${statusFilter}"`}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-8 p-0"
                      onClick={() =>
                        setSortDirection((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        )
                      }
                      aria-label="Sort by User ID"
                    >
                      User ID
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {totalUsers === 0 ? (
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No users found
                            </p>
                            <p className="text-sm mb-4">
                              Get started by adding your first user
                            </p>
                            <Button onClick={() => setEditDialogOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add User
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No users match your search
                            </p>
                            <p className="text-sm">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.picture_url || undefined} />
                            <AvatarFallback>
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            user.is_admin
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                          }`}
                        >
                          {user.is_admin ? "Admin" : "User"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            user.is_active
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(user.id, user.is_active)
                              }
                              disabled={actionLoading === `status-${user.id}`}
                            >
                              {user.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete User</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete{" "}
                                    {user.first_name} {user.last_name}? This
                                    action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={
                                      actionLoading === `delete-${user.id}`
                                    }
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.first_name}{" "}
              {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.picture_url || undefined} />
                  <AvatarFallback>
                    {getInitials(
                      selectedUser.first_name,
                      selectedUser.last_name
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{selectedUser.username}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        selectedUser.is_active
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        selectedUser.is_admin
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}
                    >
                      {selectedUser.is_admin ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nationality</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.nationality}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedUser.gender}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.date_of_birth
                      ? new Date(
                          selectedUser.date_of_birth
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reference</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.reference}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedUser.role}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Groups</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.groups.length > 0
                      ? selectedUser.groups.join(", ")
                      : "No groups"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.updated_at
                      ? new Date(selectedUser.updated_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update information for {selectedUser?.first_name}{" "}
              {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={editForm.first_name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={editForm.last_name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editForm.username || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={editForm.nationality || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nationality: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={editForm.gender || ""}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={editForm.date_of_birth || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editForm.role || ""}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={editForm.is_admin || false}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_admin: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="is_admin">Is Admin</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSaveUser}
              disabled={actionLoading === `edit-${selectedUser?.id}`}
            >
              {actionLoading === `edit-${selectedUser?.id}`
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
