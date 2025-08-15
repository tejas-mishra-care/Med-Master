import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Eye, EyeOff, RotateCcw, Tag, Layers } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Switch } from '../../../src/components/ui/switch';
import { Label } from '../../../src/components/ui/label';

interface AnatomySystem {
  id: string;
  name: string;
  path: string;
  color: string;
  defaultTarget: string;
  defaults: { distance: number };
}

interface AnatomySidebarProps {
  systems: AnatomySystem[];
  activeSystemId: string;
  onSystemChange: (systemId: string) => void;
  showLabels: boolean;
  showSlice: boolean;
  onToggleLabels: () => void;
  onToggleSlice: () => void;
  onResetView: () => void;
}

const AnatomySidebar: React.FC<AnatomySidebarProps> = ({
  systems,
  activeSystemId,
  onSystemChange,
  showLabels,
  showSlice,
  onToggleLabels,
  onToggleSlice,
  onResetView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSystems, setFilteredSystems] = useState(systems);

  // Filter systems based on search query
  useEffect(() => {
    const filtered = systems.filter(system =>
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSystems(filtered);
  }, [systems, searchQuery]);

  return (
    <div className="w-80 h-full bg-background border-r border-border flex flex-col">
      <Card className="border-0 rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">3D Anatomy</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {filteredSystems.map((system) => (
              <Button
                key={system.id}
                variant={activeSystemId === system.id ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  activeSystemId === system.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSystemChange(system.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: system.color }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{system.name}</div>
                    <div className="text-xs opacity-70">
                      Target: {system.defaultTarget}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Controls */}
      <Card className="border-0 rounded-none border-t">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Labels Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="labels-toggle" className="text-sm">Labels</Label>
            </div>
            <Switch
              id="labels-toggle"
              checked={showLabels}
              onCheckedChange={onToggleLabels}
            />
          </div>

          {/* 2D Slice Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="slice-toggle" className="text-sm">2D Slice</Label>
            </div>
            <Switch
              id="slice-toggle"
              checked={showSlice}
              onCheckedChange={onToggleSlice}
            />
          </div>

          {/* Reset View Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onResetView}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      <Card className="border-0 rounded-none border-t">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>R</span>
            <span>Reset view</span>
          </div>
          <div className="flex justify-between">
            <span>L</span>
            <span>Toggle labels</span>
          </div>
          <div className="flex justify-between">
            <span>H</span>
            <span>Hide selected</span>
          </div>
          <div className="flex justify-between">
            <span>U</span>
            <span>Unhide all</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnatomySidebar;
