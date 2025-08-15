import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Bounds, Html } from '@react-three/drei';
import { Vector3, Box3, Object3D } from 'three';
import { loadGLTF } from '../../../lib/three/loaders';

interface AnatomyViewerProps {
  modelPath: string;
  defaultTarget?: string;
  defaultDistance?: number;
  onSelectNode?: (nodeName: string | null) => void;
  onHoverNode?: (nodeName: string | null) => void;
  showLabels?: boolean;
  hiddenNodes?: Set<string>;
}

interface ModelProps {
  modelPath: string;
  defaultTarget?: string;
  defaultDistance?: number;
  onSelectNode?: (nodeName: string | null) => void;
  onHoverNode?: (nodeName: string | null) => void;
  showLabels?: boolean;
  hiddenNodes?: Set<string>;
}

const Model: React.FC<ModelProps> = ({
  modelPath,
  defaultTarget,
  defaultDistance = 3,
  onSelectNode,
  onHoverNode,
  showLabels = false,
  hiddenNodes = new Set(),
}) => {
  const { scene, camera } = useThree();
  const modelRef = useRef<Object3D>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the model
  useEffect(() => {
    setLoading(true);
    setError(null);

    loadGLTF(modelPath)
      .then((gltf) => {
        // Clear existing scene
        while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
        }

        // Add the new model
        const modelScene = gltf.scene.clone();
        scene.add(modelScene);
        modelRef.current = modelScene;

        // Auto-frame the model
        const box = new Box3().setFromObject(modelScene);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = defaultDistance * (maxDim / 2);

        // Set camera position
        camera.position.set(distance, distance, distance);
        camera.lookAt(center);

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load model:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [modelPath, scene, camera, defaultDistance]);

  if (loading) {
    return (
      <Html center>
        <div className="text-white text-lg">Loading anatomy model...</div>
      </Html>
    );
  }

  if (error) {
    return (
      <Html center>
        <div className="text-red-500 text-lg">Error loading model: {error}</div>
      </Html>
    );
  }

  return null; // Model is added directly to scene
};

const AnatomyViewer: React.FC<AnatomyViewerProps> = ({
  modelPath,
  defaultTarget,
  defaultDistance = 3,
  onSelectNode,
  onHoverNode,
  showLabels = false,
  hiddenNodes = new Set(),
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ position: [0, 0, 3], fov: 50 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          <Model
            modelPath={modelPath}
            defaultTarget={defaultTarget}
            defaultDistance={defaultDistance}
            onSelectNode={onSelectNode}
            onHoverNode={onHoverNode}
            showLabels={showLabels}
            hiddenNodes={hiddenNodes}
          />
          
          <OrbitControls
            minDistance={0.6}
            maxDistance={6}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AnatomyViewer;
