'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import dynamic from 'next/dynamic';

// Dynamically import the 3D viewer to avoid SSR issues
const AnatomyViewer = dynamic(
  () => import('../../../../features/anatomy3d/components/AnatomyViewer'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading 3D viewer...</div> }
);
import { 
  Brain, 
  Heart, 
  Eye, 
  Bone, 
  Activity,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Layers,
  Info,
  Download,
  Share,
  BookOpen,
  Target,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const mockOrgans: Organ[] = [
  {
    id: 'heart',
    name: 'Heart',
    system: 'cardiovascular',
    description: 'The heart is a muscular organ that pumps blood throughout the body.',
    function: 'Pumps oxygenated blood to the body and deoxygenated blood to the lungs',
    location: 'Mediastinum, between the lungs',
    size: 'About the size of a fist (250-350g)',
    bloodSupply: 'Coronary arteries',
    innervation: 'Autonomic nervous system'
  },
  {
    id: 'brain',
    name: 'Brain',
    system: 'nervous',
    description: 'The brain is the command center of the nervous system.',
    function: 'Controls all bodily functions, thoughts, emotions, and behavior',
    location: 'Cranial cavity, protected by the skull',
    size: 'About 1.4kg in adults',
    bloodSupply: 'Carotid and vertebral arteries',
    innervation: 'Cranial nerves and spinal cord'
  }
];

export default function Anatomy3DPage() {
  const [selectedSystem, setSelectedSystem] = useState<AnatomicalSystem | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [visibleLayers, setVisibleLayers] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showBloodFlow, setShowBloodFlow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLayerToggle = (layer: string) => {
    setVisibleLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    );
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const getSystemIcon = (systemId: string) => {
    const system = anatomicalSystems.find(s => s.id === systemId);
    return system?.icon || <Activity className="w-4 h-4" />;
  };

  const filteredSystems = anatomicalSystems.filter(system =>
    system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    system.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetView}
                      >
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
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* 3D/2D Viewer */}
                  <div className="flex-1 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
                    {viewMode === '3d' ? (
                      <div className="h-full">
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
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div 
                          className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: selectedSystem.color + '20',
                            color: selectedSystem.color,
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
                          }}
                        >
                          {selectedSystem.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{selectedSystem.name}</h3>
                        <p className="text-muted-foreground mb-4">{selectedSystem.description}</p>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            2D cross-sectional view of the {selectedSystem.name.toLowerCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Toggle layers to see different anatomical structures
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Layer Overlays */}
                    {visibleLayers.map((layer) => (
                      <div
                        key={layer}
                        className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded border text-xs"
                        style={{ color: selectedSystem.color }}
                      >
                        {layer}
                      </div>
                    ))}
                  </div>

                  {/* Layer Controls */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Layer Controls
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSystem.layers.map((layer) => (
                        <Button
                          key={layer}
                          variant={visibleLayers.includes(layer) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleLayerToggle(layer)}
                          className="justify-start"
                        >
                          <div
                            className="w-3 h-3 rounded mr-2"
                            style={{ backgroundColor: selectedSystem.color }}
                          ></div>
                          {layer}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No System Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose an anatomical system from the list to explore in 3D.
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      {anatomicalSystems.slice(0, 4).map((system) => (
                        <Button
                          key={system.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSystem(system)}
                          className="justify-start"
                        >
                          {system.icon}
                          <span className="ml-2">{system.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSystem ? (
                <div className="space-y-4">
                  {/* System Info */}
                  <div>
                    <h4 className="font-semibold mb-2">{selectedSystem.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{selectedSystem.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Organs</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedSystem.organs.map((organ) => (
                            <Badge key={organ} variant="outline" className="text-xs">
                              {organ}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">Layers</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedSystem.layers.map((layer) => (
                            <Badge 
                              key={layer} 
                              variant={visibleLayers.includes(layer) ? 'default' : 'outline'} 
                              className="text-xs cursor-pointer"
                              onClick={() => handleLayerToggle(layer)}
                            >
                              {layer}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organ Details */}
                  {selectedOrgan ? (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">{selectedOrgan.name}</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium">Function:</span>
                          <p className="text-muted-foreground">{selectedOrgan.function}</p>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <p className="text-muted-foreground">{selectedOrgan.location}</p>
                        </div>
                        <div>
                          <span className="font-medium">Size:</span>
                          <p className="text-muted-foreground">{selectedOrgan.size}</p>
                        </div>
                        <div>
                          <span className="font-medium">Blood Supply:</span>
                          <p className="text-muted-foreground">{selectedOrgan.bloodSupply}</p>
                        </div>
                        <div>
                          <span className="font-medium">Innervation:</span>
                          <p className="text-muted-foreground">{selectedOrgan.innervation}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Quick Facts</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>System Type:</span>
                          <span className="text-muted-foreground">Organ System</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Development:</span>
                          <span className="text-muted-foreground">Embryonic</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Function:</span>
                          <span className="text-muted-foreground">Vital</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Study Resources */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Study Resources</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read More
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Target className="w-4 h-4 mr-2" />
                        Take Quiz
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Download Model
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a system to view information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
