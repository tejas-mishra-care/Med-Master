import Header from '@/components/layout/header';
import { Sidebar, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import { 
  MessageSquare, 
  BookOpen, 
  Brain, 
  FileText, 
  Users, 
  Trophy,
  User,
  Home,
  Box
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background gradient-bg dark:gradient-bg-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar className="sidebar-modern dark:sidebar-modern-dark">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuButton asChild>
                <Link href="/dashboard" className="nav-item hover-lift">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/medical-assistant" className="nav-item hover-lift">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/quiz" className="nav-item hover-lift">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Daily Quiz</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/srs" className="nav-item hover-lift">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">SRS</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/anatomy" className="nav-item hover-lift">
                  <Box className="w-4 h-4" />
                  <span className="hidden sm:inline">3D Anatomy</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/pdf-annotation" className="nav-item hover-lift">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF Annotation</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/notes" className="nav-item hover-lift">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Notes</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/leaderboard" className="nav-item hover-lift">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/batch" className="nav-item hover-lift">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Batch System</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link href="/profile" className="nav-item hover-lift">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 overflow-auto scrollbar-modern">
          <div className="h-full w-full flex justify-center">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}
