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
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  ListChecks,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
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
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

const stats = [
  {
    name: "Total Applications",
    value: "156",
    change: "+12% from last month",
  },
  {
    name: "Approval Rate",
    value: "68%",
    change: "+4% from last month",
  },
  {
    name: "Average Loan",
    value: "$2,850",
    change: "+$150 from last month",
  },
  {
    name: "Processing Time",
    value: "2.3 days",
    change: "-0.5 days from last month",
  },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function LoanApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Sorting state
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortedApplications, setSortedApplications] = useState<any[]>([]);

  // Dialog state for status change
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogLoan, setStatusDialogLoan] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Stats calculated from applications
  const totalApplications = applications.length;
  const approvedCount = applications.filter(
    (a: any) => (a.status || "").toLowerCase() === "approved"
  ).length;
  const rejectedCount = applications.filter(
    (a: any) => (a.status || "").toLowerCase() === "rejected"
  ).length;
  const pendingCount = applications.filter(
    (a: any) => (a.status || "").toLowerCase() === "pending"
  ).length;
  const underReviewCount = applications.filter(
    (a: any) => (a.status || "").toLowerCase() === "under_review"
  ).length;

  // Sort applications whenever applications or sortDirection changes
  useEffect(() => {
    const sorted = [...applications].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
    setSortedApplications(sorted);
  }, [applications, sortDirection]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/v1/admin/loan-applications/list_all_applications/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data.applications || []);
        // Debugging output
        console.log("Applications:", data.applications);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Approve/Reject handler
  const handleStatusChange = async (id: number, status: string) => {
    setActionLoading(`status-${id}`);
    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE_URL}/api/v1/loan-application/${id}/`;
      // Find the full application object
      const app = applications.find((a) => a.id === id);
      if (!app) throw new Error("Application not found");
      // Construct the payload with all fields, updating only status
      const payload = { ...app, status };
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
      if (!res.ok)
        throw new Error(
          responseBody?.detail || `Failed to update status: ${res.status}`
        );
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      toast({
        title: `Loan ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: responseBody?.message || undefined,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    setActionLoading(`delete-${id}`);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/v1/loan-application/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete loan");
      setApplications((prev) => prev.filter((app) => app.id !== id));
      toast({ title: "Loan Deleted" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle view application
  const handleViewApplication = (application: any) => {
    router.push(`/dashboard/loan-applications/${application.id}`);
  };

  // Handle status dialog
  const handleStatusDialog = (application: any) => {
    setStatusDialogLoan(application);
    setSelectedStatus(application.status || "pending");
    setStatusDialogOpen(true);
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
      <div>
        <h1 className="text-3xl font-bold">Loan Applications</h1>
        <p className="text-muted-foreground">
          Review and manage loan applications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Modern, accurate loan stats from applications list */}
        <div className="flex flex-col items-start justify-between rounded-xl bg-muted/40 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <ListChecks className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total
            </span>
          </div>
          <span className="text-3xl font-bold text-foreground">
            {totalApplications}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-green-50 dark:bg-green-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Approved
            </span>
          </div>
          <span className="text-3xl font-bold text-green-700 dark:text-green-400">
            {approvedCount}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-red-50 dark:bg-red-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Rejected
            </span>
          </div>
          <span className="text-3xl font-bold text-red-700 dark:text-red-400">
            {rejectedCount}
          </span>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl bg-yellow-50 dark:bg-yellow-900/10 p-6 min-h-[120px]">
          <div className="flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-400">
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending
            </span>
          </div>
          <span className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
            {pendingCount}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>View and process loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search applications..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                      aria-label="Sort by Application ID"
                    >
                      Application ID
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Bike Model</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Credit Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {totalApplications === 0 ? (
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No loan applications found
                            </p>
                            <p className="text-sm mb-4">
                              Loan applications will appear here when submitted
                            </p>
                            <Button variant="outline">
                              <ListChecks className="mr-2 h-4 w-4" />
                              View All Applications
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No applications match your criteria
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
                  sortedApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>
                        {app.first_name} {app.last_name}
                      </TableCell>
                      <TableCell>{app.product?.name || "-"}</TableCell>
                      <TableCell>
                        {app.product?.price
                          ? `${app.product.price} ${app.product.currency}`
                          : "-"}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={async (newStatus) => {
                            if (newStatus !== app.status) {
                              setActionLoading(`status-${app.id}`);
                              await handleStatusChange(app.id, newStatus);
                            }
                          }}
                          disabled={actionLoading === `status-${app.id}`}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString()
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
                              onClick={() => handleViewApplication(app)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusDialog(app)}
                              disabled={actionLoading === `status-${app.id}`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Change Status
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
                                  <DialogTitle>Delete Application</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this loan
                                    application? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(app.id)}
                                    disabled={
                                      actionLoading === `delete-${app.id}`
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
    </div>
  );
}
