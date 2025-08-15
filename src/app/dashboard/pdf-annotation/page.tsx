'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Highlighter, 
  PenTool,
  MessageSquare,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  BookOpen,
  Split,
  Save,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Annotation {
  id: string;
  type: 'highlight' | 'draw' | 'note' | 'comment';
  content: string;
  color: string;
  page: number;
  position: { x: number; y: number };
  timestamp: Date;
}

interface PDFDocument {
  id: string;
  name: string;
  url: string;
  pages: number;
  annotations: Annotation[];
}

const mockPDFs: PDFDocument[] = [
  {
    id: '1',
    name: 'Cardiology Guidelines 2024',
    url: '/sample-pdf.pdf',
    pages: 45,
    annotations: []
  },
  {
    id: '2',
    name: 'ECG Interpretation Manual',
    url: '/ecg-manual.pdf',
    pages: 32,
    annotations: []
  }
];

const annotationColors = [
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Green', value: '#34d399' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Purple', value: '#a78bfa' }
];

export default function PDFAnnotationPage() {
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [annotationMode, setAnnotationMode] = useState<'highlight' | 'draw' | 'note' | 'comment' | null>(null);
  const [selectedColor, setSelectedColor] = useState('#fbbf24');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [newNote, setNewNote] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newPDF: PDFDocument = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        pages: 1, // This would be determined by the actual PDF
        annotations: []
      };
      setSelectedPDF(newPDF);
    }
  };

  const addAnnotation = (type: 'highlight' | 'draw' | 'note' | 'comment', content: string = '') => {
    if (!selectedPDF) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      content,
      color: selectedColor,
      page: currentPage,
      position: { x: Math.random() * 500, y: Math.random() * 300 }, // Mock position
      timestamp: new Date()
    };

    setAnnotations([...annotations, newAnnotation]);
    setAnnotationMode(null);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation(null);
    }
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'highlight': return <Highlighter className="w-4 h-4" />;
      case 'draw': return <PenTool className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'comment': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
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
    <div className="min-h-screen w-full bg-background gradient-bg dark:gradient-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
            PDF Viewer & Annotations
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="btn-modern">
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Upload PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="btn-modern">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* PDF List */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="card-modern dark:card-modern-dark">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="font-headline text-base sm:text-lg">My PDFs</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                {mockPDFs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className={`p-3 rounded-lg border-modern dark:border-modern-dark cursor-pointer hover:bg-muted/50 transition-all duration-200 ${
                      selectedPDF?.id === pdf.id ? 'bg-muted border-primary/50 ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedPDF(pdf)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{pdf.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{pdf.pages} pages</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="badge-modern dark:badge-modern-dark text-xs">
                            {pdf.annotations.length} annotations
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="h-[calc(100vh-12rem)] card-modern dark:card-modern-dark">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="font-headline text-base sm:text-lg">
                    {selectedPDF ? selectedPDF.name : 'Select a PDF'}
                  </CardTitle>
                  {selectedPDF && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={annotationMode === 'highlight' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAnnotationMode('highlight')}
                        className="btn-modern"
                      >
                        <Highlighter className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Highlight</span>
                      </Button>
                      <Button
                        variant={annotationMode === 'draw' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAnnotationMode('draw')}
                        className="btn-modern"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Draw</span>
                      </Button>
                      <Button
                        variant={annotationMode === 'note' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAnnotationMode('note')}
                        className="btn-modern"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Note</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnnotations(!showAnnotations)}
                        className="btn-modern"
                      >
                        {showAnnotations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSplitView(!splitView)}
                        className="btn-modern"
                      >
                        <Split className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-full p-4 sm:p-6 pt-0">
                {selectedPDF ? (
                  <div className="space-y-4 h-full">
                    {/* PDF Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border/50 rounded-lg glass dark:glass-dark gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="btn-modern"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-xs sm:text-sm whitespace-nowrap">
                            Page {currentPage} of {selectedPDF.pages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(selectedPDF.pages, currentPage + 1))}
                            disabled={currentPage === selectedPDF.pages}
                            className="btn-modern"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.max(50, zoom - 10))}
                            className="btn-modern"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <span className="text-xs sm:text-sm w-12 sm:w-16 text-center">{zoom}%</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.min(200, zoom + 10))}
                            className="btn-modern"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="pdf-search"
                            name="pdf-search"
                            aria-label="Search PDF"
                            autoComplete="off"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-32 sm:w-48 input-modern dark:input-modern-dark text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PDF Content */}
                    <div className="flex-1 border border-border/50 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
                      <div className="p-4 sm:p-8 text-center">
                        <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">PDF Viewer</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4">
                          Page {currentPage} of {selectedPDF.name}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            This is a simulated PDF viewer. In a real implementation, this would display the actual PDF content.
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            You can highlight text, draw annotations, add notes, and search within the document.
                          </p>
                        </div>
                      </div>

                      {/* Annotation Overlay */}
                      {showAnnotations && annotations.filter(ann => ann.page === currentPage).map((annotation) => (
                        <div
                          key={annotation.id}
                          className="absolute cursor-pointer"
                          style={{
                            left: annotation.position.x,
                            top: annotation.position.y,
                            backgroundColor: annotation.color,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: 'white',
                            zIndex: 10
                          }}
                          onClick={() => setSelectedAnnotation(annotation)}
                        >
                          {getAnnotationIcon(annotation.type)}
                        </div>
                      ))}
                    </div>

                    {/* Annotation Mode Indicator */}
                    {annotationMode && (
                      <div className="p-3 sm:p-4 border border-border/50 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Annotation Mode:</span>
                            <Badge variant="outline" className="badge-modern dark:badge-modern-dark text-xs">{annotationMode}</Badge>
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: selectedColor }}
                            ></div>
                          </div>
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="btn-modern">
                                  Color
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass">
                                {annotationColors.map((color) => (
                                  <DropdownMenuItem
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className="hover:bg-accent/50 transition-colors duration-200"
                                  >
                                    <div
                                      className="w-4 h-4 rounded mr-2"
                                      style={{ backgroundColor: color.value }}
                                    ></div>
                                    {color.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              size="sm"
                              onClick={() => addAnnotation(annotationMode)}
                              className="btn-modern"
                            >
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAnnotationMode(null)}
                              className="btn-modern"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-4">
                    <div>
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">No PDF Selected</h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        Choose a PDF from the list or upload a new one to get started.
                      </p>
                      <Button className="btn-modern">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Annotations Panel */}
          <div className="lg:col-span-1 order-3">
            <Card className="h-[calc(100vh-12rem)] card-modern dark:card-modern-dark">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="font-headline text-base sm:text-lg">Annotations ({annotations.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {annotations.length > 0 ? (
                  <div className="space-y-3">
                    {annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className={`p-3 rounded-lg border-modern dark:border-modern-dark cursor-pointer hover:bg-muted/50 transition-all duration-200 ${
                          selectedAnnotation?.id === annotation.id ? 'bg-muted border-primary/50 ring-2 ring-primary/20' : ''
                        }`}
                        onClick={() => setSelectedAnnotation(annotation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getAnnotationIcon(annotation.type)}
                              <span className="text-xs sm:text-sm font-medium capitalize truncate">{annotation.type}</span>
                              <Badge variant="outline" className="badge-modern dark:badge-modern-dark text-xs">
                                Page {annotation.page}
                              </Badge>
                            </div>
                            {annotation.content && (
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{annotation.content}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: annotation.color }}
                              ></div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(annotation.timestamp)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAnnotation(annotation.id);
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm sm:text-base text-muted-foreground">No annotations yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Start highlighting and adding notes to your PDF
                    </p>
                  </div>
                )}

                {/* Selected Annotation Details */}
                {selectedAnnotation && (
                  <div className="mt-6 p-3 sm:p-4 border border-border/50 rounded-lg glass dark:glass-dark">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Annotation Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs sm:text-sm font-medium">Type</label>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize">{selectedAnnotation.type}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium">Page</label>
                        <p className="text-xs sm:text-sm text-muted-foreground">{selectedAnnotation.page}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium">Note</label>
                        <Textarea
                          value={selectedAnnotation.content}
                          onChange={(e) => {
                            setAnnotations(annotations.map(ann =>
                              ann.id === selectedAnnotation.id
                                ? { ...ann, content: e.target.value }
                                : ann
                            ));
                            setSelectedAnnotation({
                              ...selectedAnnotation,
                              content: e.target.value
                            });
                          }}
                          placeholder="Add a note..."
                          rows={3}
                          className="input-modern dark:input-modern-dark text-xs sm:text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 btn-modern text-xs sm:text-sm">
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAnnotation(null)}
                          className="btn-modern text-xs sm:text-sm"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="pdf-upload"
        />
      </div>
    </div>
  );
}
