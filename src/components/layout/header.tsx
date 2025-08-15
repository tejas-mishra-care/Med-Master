'use client';

import { Stethoscope, LayoutDashboard, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '../ui/sidebar';
import { SidebarTrigger } from '../ui/sidebar';
import { ThemeToggle } from '../theme-toggle';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#', label: 'Pricing' },
];

// TODO: Replace with actual authentication state from auth provider
// Set this to true to see the logged-in state during development
const IS_LOGGED_IN = true;

export default function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { open, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full header-modern dark:header-modern-dark">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
           {/* Always show menu trigger so users can open the sidebar at any width */}
           <SidebarTrigger aria-label="Open menu" />
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold font-headline">MedMaster AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          {IS_LOGGED_IN ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border/50 hover:bg-accent/50 transition-all duration-200">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@email.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-accent/50 transition-colors duration-200">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 hover:bg-accent/50 transition-colors duration-200">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/logout" className="flex items-center gap-2 hover:bg-accent/50 transition-colors duration-200">
                    <LogOut className="w-4 h-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='hidden md:flex items-center gap-2'>
              <Button variant="ghost" asChild className="hover:bg-accent/50 transition-all duration-200">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="btn-modern">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
