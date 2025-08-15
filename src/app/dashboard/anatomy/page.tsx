'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AnatomySidebar from '../../../../features/anatomy3d/components/AnatomySidebar';
import LabelsPanel from '../../../../features/anatomy3d/components/LabelsPanel';
import '../../../../features/anatomy3d/styles/anatomy.css';

// Dynamically import the 3D viewer to avoid SSR issues
const AnatomyViewer = dynamic(
  () => import('../../../../features/anatomy3d/components/AnatomyViewer'),
  { ssr: false, loading: () => <div className="anatomy-loading">Loading 3D viewer...</div> }
);

interface AnatomySystem {
  id: string;
  name: string;
  path: string;
  color: string;
  defaultTarget: string;
  defaults: { distance: number };
}

interface PinnedLabel {
  id: string;
  nodeName: string;
  systemId: string;
  title: string;
  notes: string;
  createdAt: Date;
}

// IndexedDB utilities for storing labels
const DB_NAME = 'MedMasterAnatomy';
const DB_VERSION = 1;
const STORE_NAME = 'pinnedLabels';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('nodeName', 'nodeName', { unique: false });
        store.createIndex('systemId', 'systemId', { unique: false });
      }
    };
  });
};

const saveLabel = async (label: Omit<PinnedLabel, 'id' | 'createdAt'>): Promise<PinnedLabel> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const newLabel: PinnedLabel = {
    ...label,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(newLabel);
    request.onsuccess = () => resolve(newLabel);
    request.onerror = () => reject(request.error);
  });
};

const loadLabels = async (): Promise<PinnedLabel[]> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const removeLabel = async (labelId: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(labelId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export default function AnatomyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [systems, setSystems] = useState<AnatomySystem[]>([]);
  const [activeSystemId, setActiveSystemId] = useState('angiology');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showSlice, setShowSlice] = useState(false);
  const [pinnedLabels, setPinnedLabels] = useState<PinnedLabel[]>([]);
  const [loading, setLoading] = useState(true);

  // Load anatomy manifest
  useEffect(() => {
    const loadManifest = async () => {
      try {
        const response = await fetch('/features/anatomy3d/data/anatomyManifest.json');
        const manifest = await response.json();
        console.log('Loaded manifest:', manifest);
        setSystems(manifest);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load anatomy manifest:', error);
        setLoading(false);
      }
    };
    
    loadManifest();
  }, []);

  // Load pinned labels from IndexedDB
  useEffect(() => {
    const loadLabelsFromDB = async () => {
      try {
        const labels = await loadLabels();
        setPinnedLabels(labels);
      } catch (error) {
        console.error('Failed to load labels from IndexedDB:', error);
      }
    };
    
    loadLabelsFromDB();
  }, []);

  // Handle URL query parameter for active system
  useEffect(() => {
    const systemFromUrl = searchParams.get('system');
    if (systemFromUrl && systems.some(s => s.id === systemFromUrl)) {
      setActiveSystemId(systemFromUrl);
    }
  }, [searchParams, systems]);

  // Update URL when system changes
  const handleSystemChange = useCallback((systemId: string) => {
    setActiveSystemId(systemId);
    const params = new URLSearchParams(searchParams);
    params.set('system', systemId);
    router.push(`/dashboard/anatomy?${params.toString()}`);
  }, [router, searchParams]);

  // Handle adding new labels
  const handleAddLabel = useCallback(async (label: Omit<PinnedLabel, 'id' | 'createdAt'>) => {
    try {
      const newLabel = await saveLabel(label);
      setPinnedLabels(prev => [...prev, newLabel]);
    } catch (error) {
      console.error('Failed to save label:', error);
    }
  }, []);

  // Handle removing labels
  const handleRemoveLabel = useCallback(async (labelId: string) => {
    try {
      await removeLabel(labelId);
      setPinnedLabels(prev => prev.filter(label => label.id !== labelId));
    } catch (error) {
      console.error('Failed to remove label:', error);
    }
  }, []);

  // Get current active system
  const activeSystem = systems.find(s => s.id === activeSystemId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading anatomy module...</div>
      </div>
    );
  }

  console.log('Rendering with systems:', systems);
  
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <AnatomySidebar
        systems={systems}
        activeSystemId={activeSystemId}
        onSystemChange={handleSystemChange}
        showLabels={showLabels}
        showSlice={showSlice}
        onToggleLabels={() => setShowLabels(!showLabels)}
        onToggleSlice={() => setShowSlice(!showSlice)}
        onResetView={() => {
          // This will be handled by the viewer component
          console.log('Reset view requested');
        }}
      />

      {/* Center Viewer */}
      <div className="flex-1 relative">
        {activeSystem && (
          <AnatomyViewer
            modelPath={activeSystem.path}
            defaultTarget={activeSystem.defaultTarget}
            defaultDistance={activeSystem.defaults.distance}
            onSelectNode={setSelectedNode}
            onHoverNode={(nodeName) => {
              // Handle hover if needed
            }}
            showLabels={showLabels}
            hiddenNodes={new Set()} // You can implement node hiding logic here
          />
        )}
      </div>

      {/* Right Labels Panel */}
      <LabelsPanel
        selectedNode={selectedNode}
        activeSystemId={activeSystemId}
        pinnedLabels={pinnedLabels}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
      />
    </div>
  );
}
