"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "../components/Layout/MainLayout";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/userSlice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Route protection: redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}
