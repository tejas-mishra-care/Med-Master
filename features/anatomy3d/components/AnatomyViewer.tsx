import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Bounds, Html, useGLTF } from '@react-three/drei';
import { Vector3, Box3, Object3D } from 'three';
import { loadGLTF } from '../../../lib/three/loaders';
import { useAnatomyScene } from '../hooks/useAnatomyScene';

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
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the model
  useEffect(() => {
    setLoading(true);
    setError(null);

    loadGLTF(modelPath)
      .then((gltf) => {
        setModel(gltf);
        
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

        // Set controls target to default target if specified
        if (defaultTarget) {
          const targetNode = modelScene.getObjectByName(defaultTarget);
          if (targetNode) {
            const targetBox = new Box3().setFromObject(targetNode);
            const targetCenter = targetBox.getCenter(new Vector3());
            // You can set the OrbitControls target here if needed
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load model:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [modelPath, scene, camera, defaultTarget, defaultDistance]);

  // Handle node visibility
  useEffect(() => {
    if (!modelRef.current) return;

    const traverseAndHide = (object: Object3D) => {
      if (hiddenNodes.has(object.name)) {
        object.visible = false;
      } else {
        object.visible = true;
      }
      object.children.forEach(traverseAndHide);
    };

    traverseAndHide(modelRef.current);
  }, [hiddenNodes]);

  // Handle hover effects
  useFrame(() => {
    if (!modelRef.current) return;

    const traverseAndHighlight = (object: Object3D) => {
      if (object.type === 'Mesh') {
        const mesh = object as any;
        if (mesh.material) {
          // Reset material
          if (mesh.material.emissive) {
            mesh.material.emissive.setHex(0x000000);
          }
        }
      }
      object.children.forEach(traverseAndHighlight);
    };

    traverseAndHighlight(modelRef.current);
  });

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
          
          <Bounds fit clip observe damping={6} margin={1.2}>
            {/* Model will be added here */}
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AnatomyViewer;
