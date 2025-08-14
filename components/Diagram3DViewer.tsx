'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei';

import { Box, Button, Text } from '@chakra-ui/react'; // Assuming Chakra UI is used for styling and components
import * as THREE from 'three';
import { Suspense } from 'react';

interface ModelMetadata {
  layers: {
    name: string;
    nodes: string[]; // Node names in the GLTF scene that belong to this layer
  }[];
}

interface Diagram3DViewerProps {
  modelPath: string; // URL to the GLTF/GLB model
  metadata?: ModelMetadata;
  onCopyToNotes?: (snapshotUrl: string) => void;
}

const Model: React.FC<{ modelPath: string; metadata?: ModelMetadata; visibleLayers: string[] }> = ({ modelPath, metadata, visibleLayers }) => {
  const gltf = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!modelRef.current || !metadata) return;

    modelRef.current.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh) {
        const isInVisibleLayer = metadata.layers.some(layer =>
          visibleLayers.includes(layer.name) && layer.nodes.includes(node.name)
        );
        node.visible = isInVisibleLayer;
      }
    });
  }, [visibleLayers, metadata]);

  useEffect(() => {
    if (!modelRef.current) return;

    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 10 / maxDim; // Scale to fit within a reasonable view area

    modelRef.current.scale.set(scale, scale, scale);
    modelRef.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [gltf]);

  return <primitive object={gltf.scene} ref={modelRef} />;
};

const Diagram3DViewer: React.FC<Diagram3DViewerProps> = ({ modelPath, metadata, onCopyToNotes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false); // Placeholder for mobile detection
  const [visibleLayers, setVisibleLayers] = useState<string[]>(metadata?.layers.map(l => l.name) || []);
  const { progress } = useProgress();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopyToNotes = () => {
    if (canvasRef.current && onCopyToNotes) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCopyToNotes(dataUrl);
      alert('Snapshot copied to notes!');
    }
  };

  const toggleLayer = (layerName: string) => {
    setVisibleLayers(prev =>
      prev.includes(layerName) ? prev.filter(name => name !== layerName) : [...prev, layerName]
    );
  };

  if (isMobile) {
    return (
      <Box w="100%" h="400px" display="flex" justifyContent="center" alignItems="center" bg="gray.100">
        <Text>3D Viewer not available on mobile.</Text>
      </Box>
    );
  }

  return (
    <Box w="100%" h="600px" position="relative">
      <Canvas ref={canvasRef} camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        {/* Spot light to highlight specific areas and cast shadows */}
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        {/* Suspense boundary for loading the 3D model */}
        <Suspense fallback={<Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">Loading...</Box>}>
          {/* The 3D model component */}
          <Model modelPath={modelPath} metadata={metadata} visibleLayers={visibleLayers} />
        </Suspense>
        {/* OrbitControls allows users to rotate, zoom, and pan the camera */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        {/*
          TODO: Implement hover labels/tooltips to show information when hovering over model parts.
        */}
        {/* Add hover labels/tooltips here */}
      </Canvas>
      {/* Layer Toggles */}
      {metadata?.layers && (
        <Box position="absolute" top="10px" left="10px" bg="white" p={2} rounded="md" shadow="md">
          {metadata.layers.map(layer => {
            const active = visibleLayers.includes(layer.name);
            return (
              <Button
                key={layer.name}
                size="sm"
                onClick={() => toggleLayer(layer.name)}
                variant={active ? 'solid' : 'outline'}
                mr={1}
              >
                {layer.name}
              </Button>
            );
          })}
        </Box>
      )}

      {/* Button to copy a snapshot of the 3D view to the notes */}
      {onCopyToNotes && (
         <Button
            position="absolute"
            bottom="10px"
            right="10px"
            onClick={handleCopyToNotes}
            colorScheme="blue"
          >
            Copy to Notes
          </Button>
      )}

      {/* Loading progress bar for the 3D model */}
      {progress < 100 && (
        <Box position="absolute" bottom="10px" left="10px" w="160px">
          <Text fontSize="sm" mb={1}>Loading: {progress.toFixed(0)}%</Text>
          <Box
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number(progress.toFixed(0))}
            h="6px"
            w="100%"
            bg="gray.200"
            rounded="sm"
            overflow="hidden"
          >
            <Box h="100%" w={`${progress}%`} bg="blue.500" />
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default Diagram3DViewer;