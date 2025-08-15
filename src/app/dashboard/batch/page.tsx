'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  MessageSquare, 
  FileText, 
  Pin, 
  Calendar,
  Clock,
  User,
  Crown,
  BookOpen,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BatchMember {
  id: string;
  name: string;
  avatar: string;
  role: 'professor' | 'student';
  joinedAt: Date;
  isOnline: boolean;
}

interface BatchPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  type: 'announcement' | 'material' | 'discussion';
  createdAt: Date;
  isPinned: boolean;
  attachments?: string[];
}

interface Batch {
  id: string;
  name: string;
  code: string;
  professor: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  isJoined: boolean;
}

const mockBatches: Batch[] = [
  {
    id: '1',
    name: 'Cardiology Advanced',
    code: 'CARD2024',
    professor: 'Dr. Michael Chen',
    description: 'Advanced cardiology concepts and case studies for medical students.',
    memberCount: 45,
    createdAt: new Date('2024-01-01'),
    isJoined: true
  },
  {
    id: '2',
    name: 'Pharmacology Fundamentals',
    code: 'PHARM101',
    professor: 'Dr. Emily Rodriguez',
    description: 'Core pharmacology principles and drug interactions.',
    memberCount: 32,
    createdAt: new Date('2024-01-15'),
    isJoined: false
  }
];

const mockMembers: BatchMember[] = [
  { id: '1', name: 'Dr. Michael Chen', avatar: 'https://placehold.co/100x100.png', role: 'professor', joinedAt: new Date('2024-01-01'), isOnline: true },
  { id: '2', name: 'Dr. Sarah Johnson', avatar: 'https://placehold.co/100x100.png', role: 'student', joinedAt: new Date('2024-01-02'), isOnline: true },
  { id: '3', name: 'Dr. James Wilson', avatar: 'https://placehold.co/100x100.png', role: 'student', joinedAt: new Date('2024-01-03'), isOnline: false },
  { id: '4', name: 'Dr. Lisa Thompson', avatar: 'https://placehold.co/100x100.png', role: 'student', joinedAt: new Date('2024-01-04'), isOnline: true },
];

const mockPosts: BatchPost[] = [
  {
    id: '1',
    author: 'Dr. Michael Chen',
    authorAvatar: 'https://placehold.co/100x100.png',
    content: 'Welcome everyone to Cardiology Advanced! This week we\'ll be covering atrial fibrillation and its management. Please review the attached materials before our next session.',
    type: 'announcement',
    createdAt: new Date('2024-01-20'),
    isPinned: true,
    attachments: ['cardiology_week1.pdf', 'afib_guidelines.pdf']
  },
  {
    id: '2',
    author: 'Dr. Sarah Johnson',
    authorAvatar: 'https://placehold.co/100x100.png',
    content: 'I found this interesting case study on beta-blocker interactions. Has anyone encountered similar scenarios in their practice?',
    type: 'discussion',
    createdAt: new Date('2024-01-19'),
    isPinned: false,
    attachments: ['beta_blocker_case.pdf']
  },
  {
    id: '3',
    author: 'Dr. Michael Chen',
    authorAvatar: 'https://placehold.co/100x100.png',
    content: 'Here are the updated ECG interpretation guidelines. This will be covered in our next quiz.',
    type: 'material',
    createdAt: new Date('2024-01-18'),
    isPinned: false,
    attachments: ['ecg_guidelines_2024.pdf']
  }
];

export default function BatchPage() {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(mockBatches[0]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'materials'>('posts');
  const [searchQuery, setSearchQuery] = useState('');

  const handleJoinBatch = () => {
    const batch = mockBatches.find(b => b.code === joinCode);
    if (batch) {
      batch.isJoined = true;
      setSelectedBatch(batch);
      setShowJoinModal(false);
      setJoinCode('');
    }
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    // In a real app, this would create a new post
    setNewPost('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'material': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'discussion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
  <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Batch System
        </h1>
        <Button onClick={() => setShowJoinModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Join Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Batch List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Batches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockBatches.map((batch) => (
                <div
                  key={batch.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedBatch?.id === batch.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedBatch(batch)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{batch.name}</h3>
                      <p className="text-sm text-muted-foreground">{batch.professor}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{batch.memberCount} members</span>
                        {batch.isJoined && (
                          <Badge variant="outline" className="text-xs">Joined</Badge>
                        )}
                      </div>
                    </div>
                    {batch.isJoined && (
                      <Badge variant="secondary" className="text-xs">
                        {batch.code}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Batch Content */}
        <div className="lg:col-span-3">
          {selectedBatch ? (
            <div className="space-y-6">
              {/* Batch Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedBatch.name}
                        {selectedBatch.isJoined && (
                          <Badge variant="outline">{selectedBatch.code}</Badge>
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Led by {selectedBatch.professor} • {selectedBatch.memberCount} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Share Material
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Batch Chat
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedBatch.description}</p>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant={activeTab === 'posts' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('posts')}
                      >
                        Posts
                      </Button>
                      <Button
                        variant={activeTab === 'members' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('members')}
                      >
                        Members
                      </Button>
                      <Button
                        variant={activeTab === 'materials' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('materials')}
                      >
                        Materials
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab === 'posts' && (
                    <div className="space-y-6">
                      {/* Create Post */}
                      <div className="border rounded-lg p-4">
                        <Textarea
                          placeholder="Share something with your batch..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          rows={3}
                          className="mb-3"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Attach File
                            </Button>
                            <Button variant="outline" size="sm">
                              <Pin className="w-4 h-4 mr-2" />
                              Pin Post
                            </Button>
                          </div>
                          <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                            Post
                          </Button>
                        </div>
                      </div>

                      {/* Posts */}
                      <div className="space-y-4">
                        {mockPosts.map((post) => (
                          <div key={post.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={post.authorAvatar} alt={post.author} />
                                <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{post.author}</h4>
                                  <Badge className={getPostTypeColor(post.type)}>
                                    {post.type}
                                  </Badge>
                                  {post.isPinned && (
                                    <Pin className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(post.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm mb-3">{post.content}</p>
                                {post.attachments && post.attachments.length > 0 && (
                                  <div className="space-y-2">
                                    {post.attachments.map((attachment, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm">{attachment}</span>
                                        <Button variant="ghost" size="sm">
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Reply</DropdownMenuItem>
                                  <DropdownMenuItem>Share</DropdownMenuItem>
                                  <DropdownMenuItem>Report</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'members' && (
                    <div className="space-y-4">
                      {mockMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{member.name}</h4>
                              {member.role === 'professor' && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              <Badge variant={member.role === 'professor' ? 'default' : 'secondary'}>
                                {member.role}
                              </Badge>
                              {member.isOnline && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Joined {formatDate(member.joinedAt)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'materials' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-600" />
                              <div className="flex-1">
                                <h4 className="font-semibold">Cardiology Week 1</h4>
                                <p className="text-sm text-muted-foreground">PDF • 2.3 MB</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-green-600" />
                              <div className="flex-1">
                                <h4 className="font-semibold">ECG Guidelines 2024</h4>
                                <p className="text-sm text-muted-foreground">PDF • 1.8 MB</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Batch Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a batch from the list or join a new one to get started.
                </p>
                <Button onClick={() => setShowJoinModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Join Batch
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Join Batch Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Join Batch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Batch Code</label>
                <Input
                  placeholder="Enter batch code (e.g., CARD2024)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleJoinBatch} disabled={!joinCode.trim()}>
                  Join Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
