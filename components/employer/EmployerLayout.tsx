"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import Image from "next/image";
import Link from "next/link";

interface EmployerLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const EmployerLayout = ({ children, title }: EmployerLayoutProps) => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <EmployerSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header with trigger */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <Link href="/" className="flex items-center">
              <Image
                src="/aja-300x300-blue-logo.svg"
                alt="AI Jobs Australia Logo"
                width={48}
                height={48}
                className="hover:opacity-80 transition-opacity mx-7"
              />
            </Link>
          </header>

          {/* Main content */}
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};