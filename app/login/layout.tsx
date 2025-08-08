import { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Login | Dashboard",
  description: "Login to your account to access the dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </>
  );
}
