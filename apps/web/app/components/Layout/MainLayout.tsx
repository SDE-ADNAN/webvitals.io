"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { ErrorBoundary } from "../UI/ErrorBoundary";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <div className="md:pl-64">
        {/* Header */}
        <Header title={title} />

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
