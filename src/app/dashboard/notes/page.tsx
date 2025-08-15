'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Plus, 
  Folder, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Clock,
  Tag,
  Star,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Beta-blockers Mechanism of Action',
    content: 'Beta-blockers work by blocking beta-adrenergic receptors, reducing heart rate, blood pressure, and cardiac contractility. They are used for hypertension, angina, and post-myocardial infarction.',
    folder: 'Pharmacology',
    tags: ['cardiology', 'hypertension', 'drugs'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isStarred: true
  },
  {
    id: '2',
    title: 'ECG Findings in Atrial Fibrillation',
    content: 'Key ECG findings include irregularly irregular rhythm, no discernible P waves, and variable ventricular rate. Risk factors include hypertension, coronary artery disease, and heart failure.',
    folder: 'Cardiology',
    tags: ['ecg', 'arrhythmia', 'diagnosis'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    isStarred: false
  },
  {
    id: '3',
    title: 'Asthma Treatment Guidelines',
    content: 'First-line treatment involves inhaled corticosteroids (ICS) for long-term control and short-acting beta-agonists (SABA) for acute symptom relief. Triggers include allergens, exercise, and respiratory infections.',
    folder: 'Pulmonology',
    tags: ['asthma', 'treatment', 'respiratory'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    isStarred: true
  }
];

const folders = ['All Notes', 'Cardiology', 'Pharmacology', 'Pulmonology', 'Anatomy', 'Physiology'];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All Notes');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    folder: 'Cardiology',
    tags: ''
  });

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === 'All Notes' || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleCreateNote = () => {
    const tags = newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      folder: newNote.folder,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false
    };
    setNotes([note, ...notes]);
    setNewNote({ title: '', content: '', folder: 'Cardiology', tags: '' });
    setShowNewNoteForm(false);
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleUpdateNote = () => {
    if (!selectedNote) return;
    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id
        ? { ...selectedNote, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const toggleStar = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isStarred: !note.isStarred } : note
    ));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Notes Workspace
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewNoteForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Folders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {folders.map((folder) => (
                <Button
                  key={folder}
                  variant={selectedFolder === folder ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder(folder)}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {folder}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Popular Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['cardiology', 'pharmacology', 'anatomy', 'diagnosis', 'treatment'].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Notes ({filteredNotes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{note.title}</h3>
                        {note.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{note.folder}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => toggleStar(note.id)}>
                          {note.isStarred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedNote(note);
                          setIsEditing(true);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedNote ? (isEditing ? 'Edit Note' : 'View Note') : 'Select a note'}
                </CardTitle>
                {selectedNote && (
                  <div className="flex gap-2">
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {isEditing && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleUpdateNote}>
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="h-full">
              {selectedNote ? (
                <div className="space-y-4 h-full">
                  {isEditing ? (
                    <>
                      <Input
                        value={selectedNote.title}
                        onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                        placeholder="Note title"
                        className="text-lg font-semibold"
                      />
                      <div className="flex gap-2">
                        <select
                          value={selectedNote.folder}
                          onChange={(e) => setSelectedNote({ ...selectedNote, folder: e.target.value })}
                          className="px-3 py-2 border rounded-md"
                        >
                          {folders.slice(1).map((folder) => (
                            <option key={folder} value={folder}>{folder}</option>
                          ))}
                        </select>
                        <Input
                          value={selectedNote.tags.join(', ')}
                          onChange={(e) => setSelectedNote({ 
                            ...selectedNote, 
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                          })}
                          placeholder="Tags (comma separated)"
                        />
                      </div>
                      <Textarea
                        value={selectedNote.content}
                        onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                        placeholder="Write your note here..."
                        className="flex-1 min-h-[400px] resize-none"
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{selectedNote.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Folder className="w-4 h-4" />
                          {selectedNote.folder}
                          <Clock className="w-4 h-4 ml-4" />
                          Updated {formatDate(selectedNote.updatedAt)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Note Selected</h3>
                    <p className="text-muted-foreground">
                      Choose a note from the list or create a new one to get started.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Note Modal */}
      {showNewNoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <select
                value={newNote.folder}
                onChange={(e) => setNewNote({ ...newNote, folder: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {folders.slice(1).map((folder) => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
              <Input
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              />
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={6}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewNoteForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} disabled={!newNote.title.trim()}>
                  Create Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
