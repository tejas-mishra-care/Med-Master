import Header from '@/components/layout/header';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SidebarProvider defaultOpen>
        <Header />
        <main className="flex-1 pt-16">
          <div className="relative flex h-[calc(100vh-4rem)]">
            <Sidebar className="border-r bg-background">
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Home className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/medical-assistant" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">AI Assistant</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/quiz" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">Daily Quiz</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/srs" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Brain className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">SRS</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/anatomy" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Box className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">3D Anatomy</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/pdf-annotation" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">PDF Annotation</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/notes" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">Notes</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/leaderboard" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Trophy className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">Leaderboard</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/dashboard/batch" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Users className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">Batch System</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuButton variant="ghost" asChild>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline-flex truncate">Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <div className="h-full w-full overflow-auto">
                <div className="container flex items-start gap-4 py-6">
                  <div className="flex-1">
                    {children}
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
