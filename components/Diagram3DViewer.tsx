'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Box, Button, Text, Progress } from '@chakra-ui/react'; // Assuming Chakra UI is used for styling and components
import * as THREE from 'three';
import { Suspense, useLayoutEffect } from 'react';

interface ModelMetadata {
  layers: {
    name: string;
    nodes: string[]; // Node names in the GLTF scene that belong to this layer
  }[];
}

// Placeholder for reduced motion detection (can be implemented with a hook)
const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

interface Diagram3DViewerProps {
  modelPath: string; // URL to the GLTF/GLB model
  metadata?: ModelMetadata;
  onCopyToNotes?: (snapshotUrl: string) => void;
}

const Model: React.FC<{ modelPath: string; metadata?: ModelMetadata; visibleLayers: string[] }> = ({ modelPath, metadata, visibleLayers }) => {
  // Load the GLTF/GLB model using useGLTF from drei
  const gltf = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  // Toggle visibility of model parts based on selected layers
  useEffect(() => {
    if (!modelRef.current || !metadata) return;

    modelRef.current.traverse((node: any) => {
      if (node.isMesh) {
        const isInVisibleLayer = metadata.layers.some(layer =>
          visibleLayers.includes(layer.name) && layer.nodes.includes(node.name)
        );
        node.visible = isInVisibleLayer;
      }
    });
  }, [visibleLayers, metadata]);

  // Center and scale the model
  useLayoutEffect(() => {
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
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false); // Placeholder for mobile detection
  // State to manage which layers of the 3D model are currently visible
  const [visibleLayers, setVisibleLayers] = useState<string[]>(metadata?.layers.map(l => l.name) || []);


  // Basic mobile detection (can be improved)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopyToNotes = () => {
    // If a canvas ref exists and the copy to notes function is provided
    if (canvasRef.current && onCopyToNotes) {
      // Get the canvas and create a data URL
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCopyToNotes(dataUrl);
      // Optional: provide visual feedback
      alert('Snapshot copied to notes!');
    }
  };

  const toggleLayer = (layerName: string) => {
    // Toggle the visibility of a specific layer
    setVisibleLayers(prev =>
      prev.includes(layerName) ? prev.filter(name => name !== layerName) : [...prev, layerName]
    );
  };

  if (isMobile) {
    return (
      // Fallback placeholder for mobile devices where 3D viewer might not be supported or performant
      <Box w="100%" h="400px" display="flex" justifyContent="center" alignItems="center" bg="gray.100">
        <Text>3D Viewer not available on mobile.</Text>
        {/* Optionally show a static image or placeholder */}
      </Box>
    );
  }


  // Use useProgress from drei to show loading progress
  const { progress } = useProgress();

  return (
    <Box w="100%" h="600px" position="relative">
      {/* The main 3D rendering canvas */}
      <Canvas ref={canvasRef} camera={{ position: [0, 0, 15], fov: 45 }}>
        {/* Ambient light for general illumination */}
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
          {metadata.layers.map(layer => (
            <Button key={layer.name} size="sm" onClick={() => toggleLayer(layer.name)} isActive={visibleLayers.includes(layer.name)} mr={1}>
              {layer.name}
            </Button>
          ))}
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
        <Box position="absolute" bottom="10px" left="10px" w="100px">
          <Text fontSize="sm">Loading: {progress.toFixed(0)}%</Text>
          <Progress value={progress} size="sm" colorScheme="blue" />
        </Box>
      )}

    </Box>
  );
};

export default Diagram3DViewer;