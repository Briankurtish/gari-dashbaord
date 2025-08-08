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
  Plus,
  Bike,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  FolderTree,
  Package,
  TrendingUp,
  Wrench,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

// Category interface
interface Category {
  id: number;
  name: string;
  description: string;
  slug?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  total_bikes?: number;
  active_rentals?: number;
  base_price?: number;
  maintenance_count?: number;
  image_url?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [addForm, setAddForm] = useState<Partial<Category>>({
    name: "",
    description: "",
    is_active: true,
  });

  // Debug logging
  console.log("CategoriesPage render state:", {
    categories: categories.length,
    loading,
    error,
    sortedCategories: sortedCategories.length,
  });

  // Stats calculated from categories
  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (cat) => cat.is_active !== false
  ).length;
  const totalBikes = categories.reduce(
    (sum, cat) => sum + (cat.total_bikes || 0),
    0
  );
  const activeRentals = categories.reduce(
    (sum, cat) => sum + (cat.active_rentals || 0),
    0
  );
  const maintenanceCount = categories.reduce(
    (sum, cat) => sum + (cat.maintenance_count || 0),
    0
  );

  // Sort categories whenever categories or sortDirection changes
  useEffect(() => {
    const sorted = [...categories].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setSortedCategories(sorted);
  }, [categories, sortDirection]);

  // Filter categories based on search and filters
  const filteredCategories = useMemo(() => {
    return sortedCategories.filter((category) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        category.name.toLowerCase().includes(searchLower) ||
        category.description.toLowerCase().includes(searchLower) ||
        (category.slug && category.slug.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.is_active !== false) ||
        (statusFilter === "inactive" && category.is_active === false);

      return matchesSearch && matchesStatus;
    });
  }, [sortedCategories, searchQuery, statusFilter]);

  // Debug logging for filtered categories
  console.log("Filtered categories:", filteredCategories.length);

  // Refresh categories data
  const refreshCategories = async () => {
    setLoading(true);
    setError(null);

    console.log("Starting categories refresh...");

    try {
      const token = localStorage.getItem("token");

      // If no token, use demo data immediately
      if (!token) {
        console.log("No token found, using demo data");
        const sampleCategories = [
          {
            id: 1,
            name: "City Commuter",
            description: "Perfect for urban commuting and daily rides",
            is_active: true,
            total_bikes: 15,
            active_rentals: 8,
            base_price: 5.5,
            maintenance_count: 2,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-20T14:45:00Z",
          },
          {
            id: 2,
            name: "Mountain E-Bike",
            description: "Built for off-road adventures and trail riding",
            is_active: true,
            total_bikes: 12,
            active_rentals: 6,
            base_price: 7.25,
            maintenance_count: 1,
            created_at: "2024-01-10T09:15:00Z",
            updated_at: "2024-01-18T16:20:00Z",
          },
          {
            id: 3,
            name: "Cargo E-Bike",
            description:
              "Heavy-duty bikes for transporting goods and equipment",
            is_active: true,
            total_bikes: 8,
            active_rentals: 3,
            base_price: 8.0,
            maintenance_count: 0,
            created_at: "2024-01-05T11:45:00Z",
            updated_at: "2024-01-15T13:30:00Z",
          },
          {
            id: 4,
            name: "Folding E-Bike",
            description: "Compact and portable for easy storage and transport",
            is_active: false,
            total_bikes: 6,
            active_rentals: 0,
            base_price: 6.75,
            maintenance_count: 1,
            created_at: "2024-01-12T08:20:00Z",
            updated_at: "2024-01-19T10:15:00Z",
          },
        ];

        setCategories(sampleCategories);
        console.log("Demo categories set:", sampleCategories);
        toast({
          title: "Demo Mode",
          description: "Using sample data. API endpoints not available.",
        });
        setLoading(false);
        return;
      }

      console.log("Token found, fetching categories from API...");

      // Try categories endpoint first
      let res = await fetch(`${API_BASE_URL}/api/v1/categories/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Categories endpoint response:", res.status, res.statusText);

      // If categories endpoint fails, try products endpoint to get categories
      if (!res.ok) {
        console.log("Categories endpoint failed, trying products endpoint");
        res = await fetch(`${API_BASE_URL}/api/v1/products/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        console.log("Products endpoint response:", res.status, res.statusText);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("All endpoints failed:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });

        // If both endpoints fail, use sample data for demonstration
        console.log("Using sample data for demonstration");
        const sampleCategories = [
          {
            id: 1,
            name: "City Commuter",
            description: "Perfect for urban commuting and daily rides",
            is_active: true,
            total_bikes: 15,
            active_rentals: 8,
            base_price: 5.5,
            maintenance_count: 2,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-20T14:45:00Z",
          },
          {
            id: 2,
            name: "Mountain E-Bike",
            description: "Built for off-road adventures and trail riding",
            is_active: true,
            total_bikes: 12,
            active_rentals: 6,
            base_price: 7.25,
            maintenance_count: 1,
            created_at: "2024-01-10T09:15:00Z",
            updated_at: "2024-01-18T16:20:00Z",
          },
          {
            id: 3,
            name: "Cargo E-Bike",
            description:
              "Heavy-duty bikes for transporting goods and equipment",
            is_active: true,
            total_bikes: 8,
            active_rentals: 3,
            base_price: 8.0,
            maintenance_count: 0,
            created_at: "2024-01-05T11:45:00Z",
            updated_at: "2024-01-15T13:30:00Z",
          },
          {
            id: 4,
            name: "Folding E-Bike",
            description: "Compact and portable for easy storage and transport",
            is_active: false,
            total_bikes: 6,
            active_rentals: 0,
            base_price: 6.75,
            maintenance_count: 1,
            created_at: "2024-01-12T08:20:00Z",
            updated_at: "2024-01-19T10:15:00Z",
          },
        ];

        setCategories(sampleCategories);
        toast({
          title: "Demo Mode",
          description: "Using sample data. API endpoints not available.",
        });
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("API data received:", data);

      // Handle different response formats
      let categoriesData = data.results || data.categories || data || [];

      // If we got products data, extract unique categories
      if (data.results && Array.isArray(data.results)) {
        console.log("Extracting categories from products data");
        const categoryMap = new Map();
        data.results.forEach((product: any) => {
          if (product.category) {
            if (!categoryMap.has(product.category)) {
              categoryMap.set(product.category, {
                id: categoryMap.size + 1,
                name: product.category,
                description: `${product.category} category`,
                is_active: true,
                total_bikes: 0,
                active_rentals: 0,
                maintenance_count: 0,
              });
            }
            const category = categoryMap.get(product.category);
            category.total_bikes = (category.total_bikes || 0) + 1;
          }
        });
        categoriesData = Array.from(categoryMap.values());
        console.log("Extracted categories:", categoriesData);
      }

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      toast({
        title: "Categories Refreshed",
        description: "Category data has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(
        err.message || "Unknown error occurred while fetching categories"
      );
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    refreshCategories();
  }, []);

  // View category details
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setViewDialogOpen(true);
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      description: category.description,
      is_active: category.is_active,
    });
    setEditDialogOpen(true);
  };

  // Save category edits
  const handleSaveCategory = async () => {
    if (!selectedCategory) return;

    setActionLoading(`edit-${selectedCategory.id}`);
    try {
      const token = localStorage.getItem("token");

      // Check if we're in demo mode (no real API)
      if (!token) {
        // Demo mode - just update local state
        setCategories((prev) =>
          prev.map((category) =>
            category.id === selectedCategory.id
              ? { ...category, ...editForm }
              : category
          )
        );

        toast({
          title: "Category Updated (Demo)",
          description: "Category updated in demo mode.",
        });

        setEditDialogOpen(false);
        setSelectedCategory(null);
        setEditForm({});
        setActionLoading(null);
        return;
      }

      const url = `${API_BASE_URL}/api/v1/categories/${selectedCategory.id}/`;
      const payload = { ...selectedCategory, ...editForm };

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Category update failed:", {
          status: res.status,
          statusText: res.statusText,
          error: responseBody,
        });
        throw new Error(
          responseBody?.detail ||
            `Failed to update category: ${res.status} ${res.statusText}`
        );
      }

      // Update the category in the list
      setCategories((prev) =>
        prev.map((category) =>
          category.id === selectedCategory.id
            ? { ...category, ...editForm }
            : category
        )
      );

      toast({
        title: "Category Updated",
        description: "Category information has been updated successfully.",
      });

      setEditDialogOpen(false);
      setSelectedCategory(null);
      setEditForm({});

      // Refresh data to ensure consistency
      setTimeout(() => refreshCategories(), 1000);
    } catch (err: any) {
      console.error("Error updating category:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    setActionLoading("add");
    try {
      const token = localStorage.getItem("token");

      // Check if we're in demo mode (no real API)
      if (!token) {
        // Demo mode - just add to local state
        const newCategory = {
          id: Date.now(), // Use timestamp as ID for demo
          name: addForm.name || "",
          description: addForm.description || "",
          is_active: addForm.is_active !== false,
          total_bikes: 0,
          active_rentals: 0,
          base_price: 0,
          maintenance_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setCategories((prev) => [...prev, newCategory]);

        toast({
          title: "Category Created (Demo)",
          description: "New category created in demo mode.",
        });

        setAddDialogOpen(false);
        setAddForm({
          name: "",
          description: "",
          is_active: true,
        });
        setActionLoading(null);
        return;
      }

      const url = `${API_BASE_URL}/api/v1/categories/`;
      const payload = addForm;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Category creation failed:", {
          status: res.status,
          statusText: res.statusText,
          error: responseBody,
        });
        throw new Error(
          responseBody?.detail ||
            `Failed to create category: ${res.status} ${res.statusText}`
        );
      }

      toast({
        title: "Category Created",
        description: "New category has been created successfully.",
      });

      setAddDialogOpen(false);
      setAddForm({
        name: "",
        description: "",
        is_active: true,
      });

      // Refresh data to ensure consistency
      setTimeout(() => refreshCategories(), 1000);
    } catch (err: any) {
      console.error("Error creating category:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    setActionLoading(`delete-${id}`);
    try {
      const token = localStorage.getItem("token");

      // Check if we're in demo mode (no real API)
      if (!token) {
        // Demo mode - just remove from local state
        setCategories((prev) => prev.filter((category) => category.id !== id));
        toast({
          title: "Category Deleted (Demo)",
          description: "Category deleted in demo mode.",
        });
        setActionLoading(null);
        return;
      }

      const url = `${API_BASE_URL}/api/v1/categories/${id}/`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Category delete failed:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        throw new Error(
          errorData?.detail ||
            `Failed to delete category: ${res.status} ${res.statusText}`
        );
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
      toast({ title: "Category Deleted" });

      // Refresh data to ensure consistency
      setTimeout(() => refreshCategories(), 1000);
    } catch (err: any) {
      console.error("Error deleting category:", err);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Categories</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button
            onClick={refreshCategories}
            className="mt-3"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Test render to see if component is working
  console.log("Rendering categories page with:", {
    totalCategories,
    filteredCategories: filteredCategories.length,
    loading,
    error,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your e-bike categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCategories}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-start justify-between rounded-xl bg-muted/40 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <FolderTree className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Categories
            </span>
          </div>
          <span className="text-3xl font-bold text-foreground">
            {totalCategories}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-blue-50 dark:bg-blue-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
            <Package className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total E-Bikes
            </span>
          </div>
          <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            {totalBikes}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-green-50 dark:bg-green-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Active Rentals
            </span>
          </div>
          <span className="text-3xl font-bold text-green-700 dark:text-green-400">
            {activeRentals}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-orange-50 dark:bg-orange-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-400">
            <Wrench className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Maintenance
            </span>
          </div>
          <span className="text-3xl font-bold text-orange-700 dark:text-orange-400">
            {maintenanceCount}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-Bike Categories</CardTitle>
          <CardDescription>
            View and manage your e-bike categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
          {(searchQuery || statusFilter !== "all") && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredCategories.length} of {totalCategories}{" "}
              categories
              {searchQuery && ` matching "${searchQuery}"`}
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
                      aria-label="Sort by Category Name"
                    >
                      Name
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Bikes</TableHead>
                  <TableHead>Active Rentals</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {totalCategories === 0 ? (
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No categories found
                            </p>
                            <p className="text-sm mb-4">
                              Get started by adding your first category
                            </p>
                            <Button onClick={() => setAddDialogOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Category
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No categories match your search
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
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.total_bikes || 0}</TableCell>
                      <TableCell>{category.active_rentals || 0}</TableCell>
                      <TableCell>
                        {category.base_price
                          ? `$${category.base_price}/hr`
                          : "-"}
                      </TableCell>
                      <TableCell>{category.maintenance_count || 0}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            category.is_active !== false
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {category.is_active !== false ? "Active" : "Inactive"}
                        </span>
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
                              onClick={() => handleViewCategory(category)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Category
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
                                  <DialogTitle>Delete Category</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete{" "}
                                    {category.name}? This action cannot be
                                    undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(category.id)}
                                    disabled={
                                      actionLoading === `delete-${category.id}`
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

      {/* View Category Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedCategory?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Bike className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        selectedCategory.is_active !== false
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {selectedCategory.is_active !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Bikes</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.total_bikes || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Active Rentals</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.active_rentals || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Base Price</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.base_price
                      ? `$${selectedCategory.base_price}/hr`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Maintenance Count
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.maintenance_count || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Slug</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.slug || "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.created_at
                      ? new Date(selectedCategory.created_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.updated_at
                      ? new Date(selectedCategory.updated_at).toLocaleString()
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

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update information for {selectedCategory?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is_active"
                  checked={editForm.is_active !== false}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-is_active">Is Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSaveCategory}
              disabled={actionLoading === `edit-${selectedCategory?.id}`}
            >
              {actionLoading === `edit-${selectedCategory?.id}`
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new e-bike category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={addForm.name || ""}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="add-description">Description</Label>
              <Textarea
                id="add-description"
                value={addForm.description || ""}
                onChange={(e) =>
                  setAddForm({ ...addForm, description: e.target.value })
                }
                placeholder="Enter category description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-is_active"
                checked={addForm.is_active !== false}
                onChange={(e) =>
                  setAddForm({ ...addForm, is_active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="add-is_active">Is Active</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddCategory}
              disabled={actionLoading === "add"}
            >
              {actionLoading === "add" ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
