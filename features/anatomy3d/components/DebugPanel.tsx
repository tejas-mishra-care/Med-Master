import React, { useState, useEffect } from 'react';
import { Search, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';

interface DebugPanelProps {
  sceneGraph: string[];
  onToggleVisibility: (nodeName: string, visible: boolean) => void;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  sceneGraph,
  onToggleVisibility,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState(sceneGraph);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

  // Filter nodes based on search query
  useEffect(() => {
    const filtered = sceneGraph.filter(node =>
      node.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNodes(filtered);
  }, [sceneGraph, searchQuery]);

  // Common anatomical patterns for quick filtering
  const anatomicalPatterns = [
    { name: 'Artery', pattern: /artery/i },
    { name: 'Vein', pattern: /vein/i },
    { name: 'Muscle', pattern: /muscle|musculus/i },
    { name: 'Bone', pattern: /bone|os/i },
    { name: 'Nerve', pattern: /nerve|nervus/i },
    { name: 'Ligament', pattern: /ligament/i },
    { name: 'Tendon', pattern: /tendon/i },
    { name: 'Organ', pattern: /liver|heart|lung|kidney|stomach/i },
  ];

  const handleToggleNode = (nodeName: string) => {
    const isHidden = hiddenNodes.has(nodeName);
    if (isHidden) {
      hiddenNodes.delete(nodeName);
      onToggleVisibility(nodeName, true);
    } else {
      hiddenNodes.add(nodeName);
      onToggleVisibility(nodeName, false);
    }
    setHiddenNodes(new Set(hiddenNodes));
  };

  const handlePatternFilter = (pattern: RegExp) => {
    const matchingNodes = sceneGraph.filter(node => pattern.test(node));
    setFilteredNodes(matchingNodes);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilteredNodes(sceneGraph);
  };

  return (
    <div className="anatomy-debug-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Scene Graph Debug</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
          <Input
            id="debug-nodes-search"
            name="debug-nodes-search"
            aria-label="Search nodes"
            autoComplete="off"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 h-7 text-xs"
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Quick Filters */}
        <div className="mb-3">
          <div className="text-xs font-medium mb-2">Quick Filters:</div>
          <div className="flex flex-wrap gap-1">
            {anatomicalPatterns.map(({ name, pattern }) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => handlePatternFilter(pattern)}
              >
                {name}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Node List */}
        <div className="anatomy-debug-content">
          <div className="text-xs font-medium mb-2">
            Nodes ({filteredNodes.length}):
          </div>
          <div className="space-y-1">
            {filteredNodes.slice(0, 100).map((nodeName) => (
              <div
                key={nodeName}
                className="flex items-center justify-between text-xs hover:bg-muted p-1 rounded"
              >
                <span className="truncate flex-1">{nodeName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleToggleNode(nodeName)}
                >
                  {hiddenNodes.has(nodeName) ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
            {filteredNodes.length > 100 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                Showing first 100 results. Use search to find specific nodes.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default DebugPanel;
