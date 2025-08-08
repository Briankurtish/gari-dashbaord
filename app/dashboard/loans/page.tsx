"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ListChecks,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-red-600";
    case "pending":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    default:
      return null;
  }
};

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/loan-application/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }

          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail || `Failed to fetch loans: ${response.statusText}`
          );
        }

        const data = await response.json();
        setLoans(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch loans"
        );
        toast({
          title: "Error Loading Loans",
          description:
            error instanceof Error ? error.message : "Failed to load loans",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, [toast, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Loan Applications</h1>
        <Button>New Loan Application</Button>
      </div>

      <div className="grid gap-6">
        {loans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <p className="text-lg font-medium mb-2 text-muted-foreground">
                  No loan applications found
                </p>
                <p className="text-sm mb-4 text-muted-foreground">
                  Loan applications will appear here when submitted
                </p>
                <Button>
                  <ListChecks className="mr-2 h-4 w-4" />
                  View All Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => (
            <Card key={loan.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {loan.product?.primary_image && (
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                        <Image
                          src={loan.product.primary_image.image_url}
                          alt={loan.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <CardTitle>
                        {loan.product?.name || `Loan #${loan.id}`}
                      </CardTitle>
                      <CardDescription>
                        {loan.user?.first_name} {loan.user?.last_name}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(loan.status)}
                        <span
                          className={`text-sm font-medium ${getStatusColor(loan.status)}`}
                        >
                          {loan.status.charAt(0).toUpperCase() +
                            loan.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {loan.product?.price && (
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: loan.product.currency || "RWF",
                        }).format(parseFloat(loan.product.price))}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {loan.product?.category_name}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contact Information</p>
                    <p>Phone: {loan.phone_number}</p>
                    <p>Email: {loan.user?.email}</p>
                    <p className="text-muted-foreground mt-2">Address</p>
                    <p>{loan.address}</p>
                    <p className="text-muted-foreground mt-2">License ID</p>
                    <p>{loan.license_id}</p>
                    <p className="text-muted-foreground mt-2">ID Number</p>
                    <p>{loan.id_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Documents</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(loan.id_front_url, "_blank")}
                      >
                        View ID
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(loan.license_front_url, "_blank")
                        }
                      >
                        View License
                      </Button>
                    </div>
                    <div className="mt-2">
                      <p className="text-muted-foreground">Location Document</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-1"
                        onClick={() =>
                          window.open(loan.location_document_url, "_blank")
                        }
                      >
                        View Location
                      </Button>
                    </div>
                    <div className="mt-2">
                      <p className="text-muted-foreground">Dates</p>
                      <p>
                        Created:{" "}
                        {new Date(loan.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        Updated:{" "}
                        {new Date(loan.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
