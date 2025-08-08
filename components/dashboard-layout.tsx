"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Bike,
  FolderTree,
  FileText,
  Wallet,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface RouteGroup {
  name: string;
  routes: {
    href: string;
    label: string;
    icon: React.ElementType;
  }[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const routeGroups: RouteGroup[] = [
    {
      name: "Main",
      routes: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/analytics",
          label: "Analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      name: "Management",
      routes: [
        {
          href: "/dashboard/users",
          label: "Users",
          icon: Users,
        },
        {
          href: "/dashboard/e-bikes",
          label: "E-bikes",
          icon: Bike,
        },
        {
          href: "/dashboard/categories",
          label: "Categories",
          icon: FolderTree,
        },
        {
          href: "/dashboard/loan-applications",
          label: "Loan Applications",
          icon: FileText,
        },
        {
          href: "/dashboard/wallet-payments",
          label: "Wallet & Payments",
          icon: Wallet,
        },
      ],
    },
  ];

  const renderNavigation = () => (
    <nav className="flex flex-col gap-4">
      {routeGroups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <h2 className="px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {group.name}
          </h2>
          {group.routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsMobileOpen(false)}
              >
                <Button
                  variant={pathname === route.href ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-6 flex items-center justify-center border-b">
          <Image
            src="/gari-logo.webp"
            alt="GARI Logo"
            width={150}
            height={150}
            className="object-contain -ml-16"
            priority
          />
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          {renderNavigation()}
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed header */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full sticky top-0 z-50">
          <div className="flex h-full items-center px-4 md:px-6">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden transition-transform hover:scale-105 active:scale-95"
                >
                  {isMobileOpen ? (
                    <PanelLeftClose className="h-5 w-5 transition-transform duration-200 ease-in-out" />
                  ) : (
                    <PanelLeftOpen className="h-5 w-5 transition-transform duration-200 ease-in-out" />
                  )}
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-r">
                <div className="p-6 flex items-center justify-center border-b">
                  <Image
                    src="/gari-logo.webp"
                    alt="GARI Logo"
                    width={120}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <ScrollArea className="flex-1 px-3 py-4">
                  {renderNavigation()}
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center space-x-4">
              <ThemeToggle />
              <Separator orientation="vertical" className="h-8 bg-border" />
              <UserProfileMenu />
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
