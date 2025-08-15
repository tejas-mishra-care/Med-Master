'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Brain, 
  Eye, 
  MessageSquare, 
  Trophy, 
  Users, 
  TrendingUp, 
  Clock,
  Target,
  Award,
  BookOpen,
  Zap,
  Star,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface QuickStats {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'quiz' | 'note' | 'study' | 'achievement';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const quickStats: QuickStats[] = [
  {
    label: 'Quizzes Taken',
    value: '127',
    icon: <Target className="w-5 h-5" />,
    trend: '+12%',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    label: 'Study Hours',
    value: '89h',
    icon: <Clock className="w-5 h-5" />,
    trend: '+8%',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    label: 'Notes Created',
    value: '45',
    icon: <FileText className="w-5 h-5" />,
    trend: '+15%',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    label: 'Current Streak',
    value: '7 days',
    icon: <Zap className="w-5 h-5" />,
    trend: '+2 days',
    color: 'text-orange-600 dark:text-orange-400'
  }
];

const features = [
  {
    title: 'PDF Viewer & Annotations',
    description: 'View medical PDFs with advanced annotation tools, highlighting, and instant definitions.',
    icon: <FileText className="w-8 h-8" />,
    features: ['Highlight Text', 'Draw Annotations', 'Instant Definitions'],
    href: '/dashboard/pdf-annotation',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: '3D Anatomy Viewer',
    description: 'Interactive 3D models of organs and body systems with rotation, zoom, and layer controls.',
    icon: <Eye className="w-8 h-8" />,
    features: ['3D Models', 'Layer Toggle', 'Interactive'],
    href: '/dashboard/3d-anatomy',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Notes Workspace',
    description: 'Create, organize, and sync your study notes with cloud storage and search capabilities.',
    icon: <Brain className="w-8 h-8" />,
    features: ['Cloud Sync', 'Search Notes', 'Organize'],
    href: '/dashboard/notes',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Daily Quizzes',
    description: 'Test your knowledge with daily quizzes, timed challenges, and instant feedback.',
    icon: <BookOpen className="w-8 h-8" />,
    features: ['Daily Challenges', 'Timed Mode', 'Instant Feedback'],
    href: '/dashboard/quiz',
    color: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Leaderboard',
    description: 'Compete with peers on daily, weekly, and all-time leaderboards with badge rewards.',
    icon: <Trophy className="w-8 h-8" />,
    features: ['Daily Rankings', 'Badge Rewards', 'Peer Competition'],
    href: '/dashboard/leaderboard',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    title: 'Batch System',
    description: 'Join professor-led batches, access exclusive materials, and collaborate with peers.',
    icon: <Users className="w-8 h-8" />,
    features: ['Professor Materials', 'Batch Chat', 'Collaboration'],
    href: '/dashboard/batch',
    color: 'from-red-500 to-red-600'
  }
];

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'quiz',
    title: 'Completed Cardiology Quiz',
    description: 'Scored 85% on Advanced ECG Interpretation',
    time: '2 hours ago',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: '2',
    type: 'note',
    title: 'Created New Note',
    description: 'Beta-blockers Mechanism of Action',
    time: '4 hours ago',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: '3',
    type: 'study',
    title: 'Studied 3D Anatomy',
    description: 'Explored Cardiovascular System for 45 minutes',
    time: '6 hours ago',
    icon: <Eye className="w-4 h-4" />
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Earned Badge',
    description: 'Unlocked "Study Streak" badge for 7 days',
    time: '1 day ago',
    icon: <Award className="w-4 h-4" />
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'quiz': return <Target className="w-4 h-4" />;
    case 'note': return <FileText className="w-4 h-4" />;
    case 'study': return <Eye className="w-4 h-4" />;
    case 'achievement': return <Award className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'quiz': return 'text-blue-600 dark:text-blue-400';
    case 'note': return 'text-purple-600 dark:text-purple-400';
    case 'study': return 'text-green-600 dark:text-green-400';
    case 'achievement': return 'text-yellow-600 dark:text-yellow-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-background gradient-bg dark:gradient-bg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-4 pt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to continue your medical education journey?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="stats-card dark:stats-card-dark hover-lift">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-br ${stat.color.replace('text-', 'from-').replace(' dark:text-', ' to-')} bg-opacity-10 flex-shrink-0`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline text-center sm:text-left">Main Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card dark:feature-card-dark hover-lift">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{feature.title}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {feature.features.map((feat, featIndex) => (
                      <Badge key={featIndex} variant="secondary" className="badge-modern dark:badge-modern-dark text-xs">
                        {feat}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full btn-modern text-sm">
                    <Link href={feature.href}>
                      Open {feature.title.split(' ')[0]}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Study Progress & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Study Progress */}
          <Card className="card-modern dark:card-modern-dark">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Study Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>This Week</span>
                  <span className="font-medium">12.5 hours</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Monthly Goal</span>
                  <span className="font-medium">45/60 hours</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span>Next Milestone</span>
                  <Badge variant="outline" className="badge-modern dark:badge-modern-dark text-xs">
                    15 hours to go
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-modern dark:card-modern-dark">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                    <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${getActivityColor(activity.type).replace('text-', 'from-').replace(' dark:text-', ' to-')} bg-opacity-10 flex-shrink-0`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Tip */}
        <Card className="card-modern dark:card-modern-dark bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Daily Study Tip</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  "Spaced repetition is more effective than cramming. Review your notes at increasing intervals to strengthen long-term memory retention."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
