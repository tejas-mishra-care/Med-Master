"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { 
  Brain, Heart, Eye, Bone, Activity,
  ZoomIn, ZoomOut, RotateCw, RotateCcw,
  Download, Share, Search, Pause, Play
} from 'lucide-react';

// Dynamically import the 3D viewer to avoid SSR issues
const AnatomyViewer = dynamic(() => import('../../../../features/anatomy3d/components/AnatomyViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading 3D viewer...</div>,
});

interface AnatomicalSystem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  organs: string[];
  layers: string[];
  color: string;
  modelPath: string;
}

interface Organ {
  id: string;
  name: string;
  system: string;
  description: string;
  function: string;
  location: string;
  size: string;
  bloodSupply: string;
  innervation: string;
}

const anatomicalSystems: AnatomicalSystem[] = [
  {
    id: 'angiology',
    name: 'Angiology (Cardiovascular)',
    icon: <Heart className="w-6 h-6" />,
    description: 'Heart and blood vessels responsible for circulation',
    organs: ['Heart', 'Aorta', 'Vena Cava', 'Coronary Arteries', 'Pulmonary Vessels'],
    layers: ['Pericardium', 'Myocardium', 'Endocardium', 'Blood Vessels'],
    color: '#6fb1ff',
    modelPath: '/models/3D anatomy/angiology.glb'
  },
  {
    id: 'neurology',
    name: 'Neurology (Nervous System)',
    icon: <Brain className="w-6 h-6" />,
    description: 'Brain, spinal cord, and peripheral nerves',
    organs: ['Brain', 'Spinal Cord', 'Cranial Nerves', 'Peripheral Nerves'],
    layers: ['Dura Mater', 'Arachnoid', 'Pia Mater', 'Neural Tissue'],
    color: '#ffb86b',
    modelPath: '/models/3D anatomy/neurology.glb'
  },
  {
    id: 'myology',
    name: 'Myology (Muscular System)',
    icon: <Activity className="w-6 h-6" />,
    description: 'Muscles and their functions throughout the body',
    organs: ['Skeletal Muscles', 'Smooth Muscles', 'Cardiac Muscle', 'Tendons'],
    layers: ['Epimysium', 'Perimysium', 'Endomysium', 'Muscle Fibers'],
    color: '#ff7676',
    modelPath: '/models/3D anatomy/myology.glb'
  },
  {
    id: 'arthrology',
    name: 'Arthrology (Skeletal System)',
    icon: <Bone className="w-6 h-6" />,
    description: 'Bones, joints, and connective tissue',
    organs: ['Skull', 'Vertebrae', 'Ribs', 'Long Bones', 'Joints'],
    layers: ['Cortical Bone', 'Cancellous Bone', 'Marrow', 'Cartilage'],
    color: '#f7e36e',
    modelPath: '/models/3D anatomy/arthrology.glb'
  },
  {
    id: 'splanchnology',
    name: 'Splanchnology (Internal Organs)',
    icon: <Eye className="w-6 h-6" />,
    description: 'Internal organs and visceral systems',
    organs: ['Liver', 'Stomach', 'Intestines', 'Kidneys', 'Spleen'],
    layers: ['Serosa', 'Muscularis', 'Submucosa', 'Mucosa'],
    color: '#9be49b',
    modelPath: '/models/3D anatomy/splanchnology.glb'
  },
  {
    id: 'muscular_insertions',
    name: 'Muscular Insertions',
    icon: <Activity className="w-6 h-6" />,
    description: 'Muscle attachment points and insertions',
    organs: ['Humerus', 'Femur', 'Tibia', 'Fibula', 'Scapula'],
    layers: ['Origin', 'Insertion', 'Tendon', 'Ligament'],
    color: '#c39bff',
    modelPath: '/models/3D anatomy/muscular_insertions.glb'
  }
];

export default function Anatomy3DClient() {
  const [selectedSystem, setSelectedSystem] = useState<AnatomicalSystem | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showBloodFlow, setShowBloodFlow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredSystems = anatomicalSystems.filter(system =>
    system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    system.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
  <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8" />
          3D Anatomy Viewer
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* System Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Anatomical Systems</CardTitle>
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="anatomy-search"
                  name="anatomy-search"
                  aria-label="Search anatomical systems"
                  autoComplete="off"
                  placeholder="Search systems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredSystems.map((system) => (
                <div
                  key={system.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedSystem?.id === system.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedSystem(system)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: system.color + '20', color: system.color }}
                    >
                      {system.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{system.name}</h3>
                      <p className="text-sm text-muted-foreground">{system.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {system.organs.length} organs
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {system.layers.length} layers
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedSystem ? selectedSystem.name : 'Select a System'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === '3d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('3d')}
                  >
                    3D View
                  </Button>
                  <Button
                    variant={viewMode === '2d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('2d')}
                  >
                    2D View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              {selectedSystem ? (
                <div className="space-y-4 h-full">
                  {/* Viewer Controls */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setZoom(Math.max(50, zoom - 10))}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm w-16 text-center">{zoom}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setZoom(Math.min(200, zoom + 10))}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRotation(rotation - 15)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <span className="text-sm w-16 text-center">{rotation}°</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRotation(rotation + 15)}
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={resetView}>
                        Reset
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={showLabels ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowLabels(!showLabels)}
                      >
                        Labels
                      </Button>
                      <Button
                        variant={showBloodFlow ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowBloodFlow(!showBloodFlow)}
                      >
                        Blood Flow
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* 3D/2D Viewer */}
                  <div className="flex-1 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
                    {viewMode === '3d' ? (
                      <div className="h-full">
                        {isClient ? (
                          <AnatomyViewer
                            modelPath={selectedSystem.modelPath}
                            defaultTarget={selectedSystem.organs[0]}
                            defaultDistance={3}
                            onSelectNode={(nodeName) => {
                              console.log('Selected node:', nodeName);
                            }}
                            onHoverNode={(nodeName) => {
                              console.log('Hovered node:', nodeName);
                            }}
                            showLabels={showLabels}
                            hiddenNodes={new Set()}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Loading 3D viewer...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center">2D View coming soon</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an anatomical system to view its 3D model.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for details panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSystem ? (
                <div className="space-y-2">
                  <div className="text-sm">Organs: {selectedSystem.organs.length}</div>
                  <div className="text-sm">Layers: {selectedSystem.layers.length}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Select a system to see details.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
