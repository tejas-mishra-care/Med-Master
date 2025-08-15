'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  Calendar,
  Clock,
  Target,
  Crown,
  Zap,
  Flame,
  Brain,
  BookOpen
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  score: number;
  quizzesTaken: number;
  studyHours: number;
  streak: number;
  badges: string[];
  isCurrentUser: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const badges: Badge[] = [
  { id: '1', name: 'Quiz Master', description: 'Complete 100 quizzes', icon: <BookOpen className="w-4 h-4" />, color: 'bg-blue-500', rarity: 'common' },
  { id: '2', name: 'Streak Champion', description: 'Maintain 30-day study streak', icon: <Flame className="w-4 h-4" />, color: 'bg-orange-500', rarity: 'rare' },
  { id: '3', name: 'Perfect Score', description: 'Get 100% on 10 quizzes', icon: <Target className="w-4 h-4" />, color: 'bg-green-500', rarity: 'epic' },
  { id: '4', name: 'Study Legend', description: 'Study for 500+ hours', icon: <Brain className="w-4 h-4" />, color: 'bg-purple-500', rarity: 'legendary' },
  { id: '5', name: 'Speed Demon', description: 'Complete 5 quizzes in 1 hour', icon: <Zap className="w-4 h-4" />, color: 'bg-yellow-500', rarity: 'rare' },
];

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    name: 'Dr. Sarah Johnson',
    avatar: 'https://placehold.co/100x100.png',
    score: 2847,
    quizzesTaken: 127,
    studyHours: 89,
    streak: 7,
    badges: ['Quiz Master', 'Streak Champion'],
    isCurrentUser: true
  },
  {
    id: '2',
    rank: 2,
    name: 'Dr. Michael Chen',
    avatar: 'https://placehold.co/100x100.png',
    score: 2756,
    quizzesTaken: 115,
    studyHours: 92,
    streak: 12,
    badges: ['Perfect Score', 'Quiz Master'],
    isCurrentUser: false
  },
  {
    id: '3',
    rank: 3,
    name: 'Dr. Emily Rodriguez',
    avatar: 'https://placehold.co/100x100.png',
    score: 2689,
    quizzesTaken: 98,
    studyHours: 76,
    streak: 5,
    badges: ['Study Legend'],
    isCurrentUser: false
  },
  {
    id: '4',
    rank: 4,
    name: 'Dr. James Wilson',
    avatar: 'https://placehold.co/100x100.png',
    score: 2543,
    quizzesTaken: 89,
    studyHours: 68,
    streak: 3,
    badges: ['Speed Demon'],
    isCurrentUser: false
  },
  {
    id: '5',
    rank: 5,
    name: 'Dr. Lisa Thompson',
    avatar: 'https://placehold.co/100x100.png',
    score: 2412,
    quizzesTaken: 76,
    studyHours: 54,
    streak: 2,
    badges: ['Quiz Master'],
    isCurrentUser: false
  }
];

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('daily');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800';
      case 3: return 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800';
      default: return '';
    }
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
  <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          Leaderboard
        </h1>
        <div className="flex gap-2">
          <Button 
            variant={timeframe === 'daily' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('daily')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Daily
          </Button>
          <Button 
            variant={timeframe === 'weekly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('weekly')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Weekly
          </Button>
          <Button 
            variant={timeframe === 'all-time' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('all-time')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            All Time
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboardData.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      entry.isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${getRankColor(entry.rank)}`}
                  >
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.avatar} alt={entry.name} />
                      <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{entry.name}</h3>
                        {entry.isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{entry.quizzesTaken} quizzes</span>
                        <span>{entry.studyHours}h studied</span>
                        <span>{entry.streak} day streak</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.badges.slice(0, 3).map((badge) => (
                          <Badge key={badge} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        {entry.badges.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.badges.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">{entry.score}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Badges */}
        <div className="space-y-6">
          {/* Current User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">#1</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">2,847</div>
                  <div className="text-xs text-muted-foreground">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">7</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to next rank</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Available Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedBadge?.id === badge.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${badge.color} text-white`}>
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{badge.name}</h4>
                          <Badge className={getBadgeColor(badge.rarity)}>
                            {badge.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badge Details */}
          {selectedBadge && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedBadge.icon}
                  {selectedBadge.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${selectedBadge.color} text-white text-center`}>
                    <div className="text-2xl mb-2">{selectedBadge.icon}</div>
                    <div className="font-semibold">{selectedBadge.name}</div>
                    <div className="text-sm opacity-90">{selectedBadge.description}</div>
                  </div>
                  <div className="text-center">
                    <Badge className={getBadgeColor(selectedBadge.rarity)}>
                      {selectedBadge.rarity.toUpperCase()} BADGE
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Earn this badge to boost your leaderboard ranking and unlock special features!
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-muted-foreground">Quizzes Taken</div>
              <div className="text-xs text-muted-foreground mt-1">Goal: 200</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">89</div>
              <div className="text-sm text-muted-foreground">Study Hours</div>
              <div className="text-xs text-muted-foreground mt-1">Goal: 500</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">7</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
              <div className="text-xs text-muted-foreground mt-1">Goal: 30</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">85%</div>
              <div className="text-sm text-muted-foreground">Perfect Scores</div>
              <div className="text-xs text-muted-foreground mt-1">Goal: 90%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
