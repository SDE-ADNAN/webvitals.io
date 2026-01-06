"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { ThemeToggle } from "../Theme/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleMobileMenu } from "@/lib/redux/slices/uiSlice";
import { selectUser, logout } from "@/lib/redux/slices/userSlice";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleMobileMenuToggle = () => {
    dispatch(toggleMobileMenu());
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        {/* Left side: Mobile menu button + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleMobileMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
            type="button"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {title && (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        {/* Right side: Theme toggle + User avatar */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="User menu"
              type="button"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.firstName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-700 dark:text-gray-300 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || "Guest User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || "guest@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
