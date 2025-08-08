"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Bike,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface LoanApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string;
  social_security_number: string;
  employment_status: string;
  employer_name: string;
  monthly_income: number;
  loan_amount: number;
  loan_purpose: string;
  credit_score: number;
  status: "pending" | "approved" | "rejected" | "under_review";
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    category: string;
    currency?: string;
  };
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  duration?: string;
  images?: string[];
  documents?: string[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<LoanApplication>>({});

  const loanId = params.id as string;

  // Fetch loan details
  const fetchLoanDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/loan-applications/${loanId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch loan details: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Loan details received:", data);
      setLoan(data);
      setEditData(data);
    } catch (err: any) {
      console.error("Error fetching loan details:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load loan details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save loan changes
  const saveChanges = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/loan-applications/${loanId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update loan: ${response.statusText}`);
      }

      const updatedLoan = await response.json();
      setLoan(updatedLoan);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Loan details updated successfully",
      });
    } catch (err: any) {
      console.error("Error updating loan:", err);
      toast({
        title: "Error",
        description: "Failed to update loan details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update loan status
  const updateStatus = async (newStatus: string, reason?: string) => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updateData: any = { status: newStatus };
      if (newStatus === "rejected" && reason) {
        updateData.rejection_reason = reason;
      }
      if (newStatus === "approved") {
        updateData.approved_at = new Date().toISOString();
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/loan-applications/${loanId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      const updatedLoan = await response.json();
      setLoan(updatedLoan);
      setEditData(updatedLoan);

      toast({
        title: "Success",
        description: `Loan status updated to ${newStatus}`,
      });
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update loan status",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: X },
      under_review: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Loan</h3>
              <p className="text-gray-600 mb-4">{error || "Loan not found"}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Loan Application #{loan.id}</h1>
            <p className="text-gray-600">
              {loan.first_name} {loan.last_name} • {formatDate(loan.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(loan.status)}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={saveChanges} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  {isEditing ? (
                    <Input
                      value={editData.first_name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, first_name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.first_name}</p>
                  )}
                </div>
                <div>
                  <Label>Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={editData.last_name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, last_name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.last_name}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.email}</p>
                  )}
                </div>
                <div>
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editData.phone || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.phone}</p>
                  )}
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.date_of_birth || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {loan.date_of_birth}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Social Security Number</Label>
                  {isEditing ? (
                    <Input
                      value={editData.social_security_number || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          social_security_number: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      •••-••-{loan.social_security_number?.slice(-4)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Address</Label>
                {isEditing ? (
                  <Input
                    value={editData.address || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm text-foreground">{loan.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  {isEditing ? (
                    <Input
                      value={editData.city || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, city: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.city}</p>
                  )}
                </div>
                <div>
                  <Label>State</Label>
                  {isEditing ? (
                    <Input
                      value={editData.state || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, state: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.state}</p>
                  )}
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  {isEditing ? (
                    <Input
                      value={editData.zip_code || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, zip_code: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{loan.zip_code}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Employment Status</Label>
                  {isEditing ? (
                    <Select
                      value={editData.employment_status || ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, employment_status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">
                          Self Employed
                        </SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground">
                      {loan.employment_status}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Monthly Income</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.monthly_income || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monthly_income: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {formatCurrency(loan.monthly_income)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Employer Name</Label>
                {isEditing ? (
                  <Input
                    value={editData.employer_name || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        employer_name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {loan.employer_name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loan Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Loan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Loan Amount</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.loan_amount || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          loan_amount: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {formatCurrency(loan.loan_amount)}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Credit Score</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.credit_score || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          credit_score: parseInt(e.target.value),
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">
                      {loan.credit_score}
                    </p>
                  )}
                </div>
                {loan.duration && (
                  <div>
                    <Label>Duration</Label>
                    <p className="text-sm text-foreground">{loan.duration}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Loan Purpose</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.loan_purpose || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, loan_purpose: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm text-foreground">{loan.loan_purpose}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images and Documents */}
          {(loan.images && loan.images.length > 0) ||
          (loan.documents && loan.documents.length > 0) ? (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  Images and documents provided with the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Images */}
                {loan.images && loan.images.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Images
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {loan.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Application image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => window.open(image, "_blank")}
                            >
                              View Full
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {loan.documents && loan.documents.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Documents
                    </Label>
                    <div className="space-y-2">
                      {loan.documents.map((document, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              {document.split("/").pop() ||
                                `Document ${index + 1}`}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(document, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.notes || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  placeholder="Add notes about this loan application..."
                />
              ) : (
                <p className="text-sm text-foreground">
                  {loan.notes || "No notes added"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Fields - Display any fields not explicitly defined */}
          {(() => {
            const definedFields = [
              "id",
              "first_name",
              "last_name",
              "email",
              "phone",
              "address",
              "city",
              "state",
              "zip_code",
              "date_of_birth",
              "social_security_number",
              "employment_status",
              "employer_name",
              "monthly_income",
              "loan_amount",
              "loan_purpose",
              "credit_score",
              "status",
              "created_at",
              "updated_at",
              "product",
              "notes",
              "approved_by",
              "approved_at",
              "rejection_reason",
              "duration",
              "images",
              "documents",
            ];

            const additionalFields = Object.keys(loan).filter(
              (key) => !definedFields.includes(key)
            );

            if (additionalFields.length > 0) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Additional fields from the API response
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {additionalFields.map((field) => (
                        <div
                          key={field}
                          className="flex justify-between items-start"
                        >
                          <Label className="text-sm font-medium capitalize">
                            {field.replace(/_/g, " ")}
                          </Label>
                          <div className="text-sm text-foreground max-w-md text-right">
                            {typeof loan[field as keyof typeof loan] ===
                            "object"
                              ? JSON.stringify(
                                  loan[field as keyof typeof loan],
                                  null,
                                  2
                                )
                              : String(
                                  loan[field as keyof typeof loan] || "N/A"
                                )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Information */}
          {loan.product && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bike className="h-5 w-5 mr-2" />
                  Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-foreground">{loan.product.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-foreground">
                    {loan.product.category}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Price</Label>
                  <p className="text-sm text-foreground">
                    {formatCurrency(loan.product.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status Actions</CardTitle>
              <CardDescription>
                Update the loan application status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loan.status === "pending" && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="default">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Loan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Loan Application</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to approve this loan
                          application? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={() => updateStatus("approved")}>
                          Approve Loan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        <X className="h-4 w-4 mr-2" />
                        Reject Loan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Loan Application</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejecting this loan
                          application.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rejection-reason">
                            Rejection Reason
                          </Label>
                          <Textarea
                            id="rejection-reason"
                            placeholder="Enter the reason for rejection..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const reason = (
                              document.getElementById(
                                "rejection-reason"
                              ) as HTMLTextAreaElement
                            )?.value;
                            updateStatus("rejected", reason);
                          }}
                        >
                          Reject Loan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {loan.status === "approved" && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Loan Approved
                  </p>
                  {loan.approved_at && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {formatDate(loan.approved_at)}
                    </p>
                  )}
                </div>
              )}

              {loan.status === "rejected" && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Loan Rejected
                  </p>
                  {loan.rejection_reason && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Reason: {loan.rejection_reason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Application Submitted
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(loan.created_at)}
                  </p>
                </div>
              </div>

              {loan.updated_at !== loan.created_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Last Updated
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(loan.updated_at)}
                    </p>
                  </div>
                </div>
              )}

              {loan.approved_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Loan Approved
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(loan.approved_at)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
