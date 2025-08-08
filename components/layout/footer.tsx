"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <footer className="w-full border-t bg-background py-4 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
      <div className="flex items-center gap-2">
        <Image src="/gari-logo.webp" alt="GARI Logo" width={20} height={20} />
        <span>AppName &copy; {new Date().getFullYear()}</span>
      </div>
      <div className="flex gap-4 items-center">
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <Link href="/help" className="hover:underline">
          Help
        </Link>
        <Button
          size="sm"
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </footer>
  );
}
