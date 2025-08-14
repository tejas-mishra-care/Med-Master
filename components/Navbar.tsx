"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CogIcon,
  HomeIcon,
  BookOpenIcon,
  CubeTransparentIcon,
  ChatBubbleBottomCenterTextIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon as MenuIcon,
} from "@heroicons/react/24/outline"; // Using heroicons for icons

import clsx from "clsx";
// import { useAuthClient } from "@/lib/auth"; // Assuming this hook provides auth state
// import { useTheme } from "@/lib/supabaseClient"; // Assuming this hook provides theme and toggler

// Define navigation links
const navLinks = [
  // Link to the main user dashboard
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  // Link to the daily quiz page
  { href: "/quiz/daily", label: "Daily Quiz", icon: BookOpenIcon },
  // Link to the Spaced Repetition System (SRS) review page
  { href: "/srs", label: "SRS Review", icon: BookOpenIcon },
  // Link to the AI assistant chat page
  { href: "/ai", label: "AI Assistant", icon: ChatBubbleBottomCenterTextIcon }, // Use a more specific icon
  // Link to the 3D models viewer
  { href: "/models", label: "3D Models", icon: CubeTransparentIcon },
  // Link to the Batches (group study) feature
  { href: "/batches", label: "Batches", icon: ChatBubbleBottomCenterTextIcon }, // Use a more specific icon
  // Link to user profile and settings
  { href: "/profile/settings", label: "Settings", icon: CogIcon },
];

export function Navbar() {
  // const { user, profile } = useAuthClient();
  const user = null; // Temporarily disable auth
  const profile: { username?: string } | null = null;
  const pathname = usePathname();
  // const { theme, toggleTheme } = useTheme();
  const theme = 'light'; // Temporarily default to light theme
  const toggleTheme = () => {};
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  // State to manage mobile menu visibility

  return (
    // Sticky header for navigation
    <header className="sticky top-0 z-40 w-full border-b bg-bg text-primary dark:border-primary/20 dark:bg-primary dark:text-bg">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          {/* Logo and site title, links to homepage */}
          <Link href="/" className="flex items-center space-x-2">
            {/* MedMaster title */}
            <span className="inline-block font-bold text-2xl">MedMaster</span>
            {/* TODO: Add a logo or icon here */}
          </Link>
          {/* Desktop navigation links (visible for authenticated users on medium+ screens) */}
          {user && (
            <nav className="hidden gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center text-sm font-medium transition-colors hover:text-accent",
                    pathname === link.href
                      ? "text-accent dark:text-highlight"
                      : "text-primary/60 dark:text-bg/60"
                  )}
                  // Indicate the current page for accessibility
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  <link.icon className="mr-1 h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          {/* End of Desktop Navigation */}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* Theme toggler button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-bg/10"
            >
              {theme === "light" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Display user info if authenticated */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Hi, {profile?.username || "User"}</span>
                {/* Placeholder for Logout button - implement proper logic */}
                <button className="text-sm font-medium transition-colors hover:text-accent dark:hover:text-highlight">
                  Logout
                </button>
              </div>
            ) : (
              <div>
                {/* Display login link if not authenticated */}
                <Link
                  href="/login" // Assuming a login page path
                  className="text-sm font-medium transition-colors hover:text-accent dark:hover:text-highlight"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile menu button (visible on small screens) */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-primary/10 dark:hover:bg-bg/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </nav>
        </div>
      </div>
      {/* Mobile menu dropdown (conditionally rendered) */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-bg text-primary dark:bg-primary dark:text-bg border-b border-primary/20 dark:border-bg/20">
          <nav className="flex flex-col px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center px-2 py-1 text-sm font-medium transition-colors hover:text-accent rounded-md",
                  pathname === link.href
                    ? "text-accent dark:text-highlight bg-primary/10 dark:bg-bg/10"
                    : "text-primary/60 dark:text-bg/60"
                )}
                // Close menu on link click
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}