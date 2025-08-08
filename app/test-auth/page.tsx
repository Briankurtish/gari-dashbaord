"use client";

import { useState } from "react";
import { authService } from "@/lib/auth";
import type { LoginResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function TestAuth() {
  const [result, setResult] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTestResult("Attempting login...");

      if (!email || !password) {
        setTestResult("Error: Email and password are required");
        return;
      }

      console.log("Starting login process...");
      const response = await authService.login({ email, password });
      console.log("Login result:", response);

      setResult(response);
      setTestResult(
        `Login successful!\nToken: ${response.token.slice(0, 10)}...\nFull response: ${JSON.stringify(response, null, 2)}`
      );
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to login");
      setTestResult(
        `Login failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAuth = async () => {
    try {
      setIsLoading(true);
      setTestResult("Testing authenticated request...");

      const token = localStorage.getItem("token");
      console.log(
        "Current token:",
        token ? `${token.slice(0, 10)}...` : "No token"
      );

      const response = await fetch("/api/v1/users/me/", {
        headers: {
          Authorization: token || "",
        },
      });

      console.log("Auth test response status:", response.status);
      const data = await response.json();
      console.log("Auth test response:", data);

      setTestResult(
        `Auth test result:\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`
      );
    } catch (err) {
      console.error("Auth test error:", err);
      setTestResult(
        `Auth test failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setResult(null);
    setTestResult("Logged out successfully");
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Test Login"}
          </Button>
          <Button
            onClick={handleTestAuth}
            className="w-full"
            variant="outline"
            disabled={isLoading}
          >
            Test Auth Request
          </Button>
          <Button
            onClick={handleLogout}
            className="w-full"
            variant="destructive"
            disabled={isLoading}
          >
            Logout
          </Button>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Current Token:</h2>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-sm break-all">
            {localStorage.getItem("token") || "No token"}
          </pre>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Current User:</h2>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
            {JSON.stringify(result, null, 2) || "No user"}
          </pre>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">Test Result:</h2>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-sm whitespace-pre-wrap">
            {testResult || "No test run yet"}
          </pre>
        </div>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
      </Card>
    </div>
  );
}
