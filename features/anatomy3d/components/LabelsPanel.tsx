import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkPlus, Info, X } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Textarea } from '../../../src/components/ui/textarea';
import { Input } from '../../../src/components/ui/input';

interface PinnedLabel {
  id: string;
  nodeName: string;
  systemId: string;
  title: string;
  notes: string;
  createdAt: Date;
}

interface LabelsPanelProps {
  selectedNode: string | null;
  activeSystemId: string;
  pinnedLabels: PinnedLabel[];
  onAddLabel: (label: Omit<PinnedLabel, 'id' | 'createdAt'>) => void;
  onRemoveLabel: (labelId: string) => void;
}

const LabelsPanel: React.FC<LabelsPanelProps> = ({
  selectedNode,
  activeSystemId,
  pinnedLabels,
  onAddLabel,
  onRemoveLabel,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabelTitle, setNewLabelTitle] = useState('');
  const [newLabelNotes, setNewLabelNotes] = useState('');

  const handleAddLabel = () => {
    if (!selectedNode || !newLabelTitle.trim()) return;

    onAddLabel({
      nodeName: selectedNode,
      systemId: activeSystemId,
      title: newLabelTitle.trim(),
      notes: newLabelNotes.trim(),
    });

    setNewLabelTitle('');
    setNewLabelNotes('');
    setShowAddForm(false);
  };

  const filteredLabels = pinnedLabels.filter(
    label => label.nodeName === selectedNode && label.systemId === activeSystemId
  );

  return (
    <div className="w-80 h-full bg-background border-l border-border flex flex-col">
      <Card className="border-0 rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Labels & Info</span>
            {selectedNode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Selected Node Info */}
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Selected: {selectedNode}</span>
              </div>

              {/* Placeholder facts - you can expand this with real data */}
              <div className="text-sm text-muted-foreground">
                <p>Click on anatomical structures to view information.</p>
                <p>Use the bookmark button to add custom notes.</p>
              </div>

              {/* Add Label Form */}
              {showAddForm && (
                <Card className="border border-dashed">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Add Label</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Label title"
                      value={newLabelTitle}
                      onChange={(e) => setNewLabelTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Add notes about this structure..."
                      value={newLabelNotes}
                      onChange={(e) => setNewLabelNotes(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddLabel}
                      disabled={!newLabelTitle.trim()}
                    >
                      Save Label
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pinned Labels */}
              {filteredLabels.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Pinned Labels</h4>
                  {filteredLabels.map((label) => (
                    <Card key={label.id} className="border">
                      <CardContent className="pt-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Bookmark className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{label.title}</span>
                            </div>
                            {label.notes && (
                              <p className="text-xs text-muted-foreground">{label.notes}</p>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {label.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveLabel(label.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select an anatomical structure to view information</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Attribution */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
        <p>3D Models from Z-Anatomy</p>
        <p>CC BY-SA 4.0 License</p>
      </div>
    </div>
  );
};

export default LabelsPanel;
