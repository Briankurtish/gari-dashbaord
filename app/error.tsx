"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="space-x-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
          <Button onClick={() => reset()} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
