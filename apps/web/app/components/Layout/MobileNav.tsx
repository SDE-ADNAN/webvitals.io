"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Bell, Settings, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleMobileMenu, selectMobileMenuOpen } from "@/lib/redux/slices/uiSlice";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavLink({ href, icon, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function MobileNav() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen);

  const handleClose = useCallback(() => {
    dispatch(toggleMobileMenu());
  }, [dispatch]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, handleClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/sites",
      icon: <Globe className="w-5 h-5" />,
      label: "Sites",
    },
    {
      href: "/dashboard/alerts",
      icon: <Bell className="w-5 h-5" />,
      label: "Alerts",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
    },
  ];

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            WebVitals.io
          </h1>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
            type="button"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isActive={pathname === link.href}
              onClick={handleClose}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
