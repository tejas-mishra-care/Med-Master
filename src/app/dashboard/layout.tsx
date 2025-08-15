"use client";

import Header from '@/components/layout/header';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  BookOpen,
  Brain,
  FileText,
  Users,
  Trophy,
  User,
  Home,
  Box,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <SidebarProvider defaultOpen>
        {/* Fixed Header */}
        <div className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-[2000px] px-4">
            <Header />
          </div>
        </div>

        {/* Main Layout Container */}
        <div className="flex min-h-[100dvh] pt-[3.5rem]">
          {/* Sidebar */}
          <Sidebar className="fixed inset-y-[3.5rem] left-0 z-30 w-64 border-r bg-background transition-all duration-300 ease-in-out lg:relative lg:inset-y-0">
            <SidebarContent className="flex h-full flex-col">
              <SidebarMenu className="flex-1 space-y-1 p-4">
                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Home className="h-4 w-4 shrink-0" />
                    <span className="truncate">Dashboard</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/medical-assistant" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">AI Assistant</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/quiz" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">Daily Quiz</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/srs" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Brain className="h-4 w-4 shrink-0" />
                    <span className="truncate">SRS</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/anatomy" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Box className="h-4 w-4 shrink-0" />
                    <span className="truncate">3D Anatomy</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/pdf-annotation" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">PDF Annotation</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/notes" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">Notes</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/leaderboard" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Trophy className="h-4 w-4 shrink-0" />
                    <span className="truncate">Leaderboard</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/dashboard/batch" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="truncate">Batch System</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton variant="ghost" asChild>
                  <Link href="/profile" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-3.5rem)] w-full transition-[margin] duration-300 ease-in-out lg:ml-64">
            <div className="mx-auto max-w-[2000px] p-6">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
