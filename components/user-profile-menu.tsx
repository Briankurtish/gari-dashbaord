"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

interface UserProfile {
  id: number;
  reference: string;
  phone: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  nationality: string;
  gender: string;
  date_of_birth: string;
  is_active: boolean;
  is_admin: boolean;
  role: string;
  groups: string[];
  picture: string | null;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function UserProfileMenu() {
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setIsLoading(false);
          return;
        }

        console.log(
          "Fetching user profile from:",
          `${API_BASE_URL}/api/v1/profile/`
        );
        const response = await fetch(`${API_BASE_URL}/api/v1/profile/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Profile fetch failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(
            errorData?.detail ||
              `Failed to fetch user profile: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Profile data received:", data);
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error Loading Profile",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const initials = userProfile
    ? getInitials(userProfile.first_name, userProfile.last_name)
    : "U";
  const fullName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : "User";
  const username = userProfile?.username || "User";
  const role = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : "User";

  const handleProfileClick = React.useCallback(() => {
    setIsOpen(false);
    router.push("/dashboard/profile");
  }, [router]);

  const handleLogout = React.useCallback(async () => {
    try {
      setIsLoggingOut(true);
      // Clear any cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      // Call auth service logout
      logout();
      // Close dropdown
      setIsOpen(false);
      // Navigate to login
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router, toast]);

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="relative h-12 w-full justify-start gap-2 px-2 md:w-auto"
        disabled
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            U
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left">
          <p className="text-sm font-medium leading-none">Loading...</p>
          <p className="text-xs text-muted-foreground">Please wait</p>
        </div>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-12 w-full justify-start gap-2 px-2 md:w-auto hover:bg-accent"
          disabled={isLoggingOut}
        >
          <Avatar className="h-8 w-8">
            {userProfile?.picture ? (
              <AvatarImage src={userProfile.picture} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{fullName}</p>
          <p className="text-xs text-muted-foreground">@{username}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {userProfile?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick} disabled={isLoggingOut}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
