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
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Wallet } from "lucide-react";

const transactions = [
  {
    id: "TX001",
    type: "Rental Payment",
    amount: "+$45.99",
    status: "Completed",
    date: "Jan 15, 2024",
    customer: "John Smith",
    paymentMethod: "Credit Card",
  },
  {
    id: "TX002",
    type: "Loan Payment",
    amount: "-$299.99",
    status: "Processing",
    date: "Jan 14, 2024",
    customer: "Sarah Johnson",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "TX003",
    type: "Deposit",
    amount: "+$500.00",
    status: "Completed",
    date: "Jan 13, 2024",
    customer: "Michael Brown",
    paymentMethod: "Debit Card",
  },
  {
    id: "TX004",
    type: "Maintenance Fee",
    amount: "-$75.00",
    status: "Failed",
    date: "Jan 12, 2024",
    customer: "Emily Davis",
    paymentMethod: "Credit Card",
  },
  {
    id: "TX005",
    type: "Rental Payment",
    amount: "+$32.99",
    status: "Completed",
    date: "Jan 11, 2024",
    customer: "David Wilson",
    paymentMethod: "Wallet Balance",
  },
];

const stats = [
  {
    name: "Total Revenue",
    value: "$12,234",
    change: "+8% from last month",
    trend: "up",
  },
  {
    name: "Active Loans",
    value: "$45,678",
    change: "+12% from last month",
    trend: "up",
  },
  {
    name: "Pending Payments",
    value: "$2,345",
    change: "-5% from last month",
    trend: "down",
  },
  {
    name: "Failed Transactions",
    value: "$890",
    change: "-2% from last month",
    trend: "down",
  },
];

export default function WalletPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet & Payments</h1>
        <p className="text-muted-foreground">
          Manage transactions and payment processing
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2">
                {stat.trend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <p
                  className={`text-xs ${
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              View and manage payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" className="h-8 p-0">
                        Transaction ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <div>
                            <p className="text-lg font-medium mb-2">
                              No transactions found
                            </p>
                            <p className="text-sm mb-4">
                              Transaction history will appear here
                            </p>
                            <Button variant="outline">
                              <Wallet className="mr-2 h-4 w-4" />
                              View Wallet
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.id}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell
                          className={
                            tx.amount.startsWith("+")
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {tx.amount}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              tx.status === "Completed"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : tx.status === "Processing"
                                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell>{tx.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Distribution of payment methods used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: "Credit Card", percentage: 45 },
                { method: "Bank Transfer", percentage: 30 },
                { method: "Wallet Balance", percentage: 15 },
                { method: "Debit Card", percentage: 10 },
              ].map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{method.method}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.percentage}%
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
