"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Object3D, Vector3 } from 'three';
import { loadGLTF, LoadedModel } from '../../../lib/three/loaders';

interface AnatomyViewerProps {
  modelPath: string;
  defaultTarget?: string;
  defaultDistance?: number;
  onSelectNode?: (nodeName: string | null) => void;
  onHoverNode?: (nodeName: string | null) => void;
  showLabels?: boolean;
  hiddenNodes?: Set<string>;
}

const AnatomyViewer: React.FC<AnatomyViewerProps> = ({
  modelPath,
  defaultTarget,
  defaultDistance = 3,
  onSelectNode,
  onHoverNode,
  showLabels = false,
  hiddenNodes = new Set(),
}) => {
  const Model: React.FC<{ modelPath: string; defaultDistance: number; onStatus: (s: string) => void; onError: (e: string) => void; }> = ({ modelPath, defaultDistance, onStatus, onError }) => {
    const { camera } = useThree();
    const rootRef = useRef<Object3D>(null);
    const [gltf, setGltf] = useState<LoadedModel | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      setGltf(null);
      setError(null);
      console.log('[AnatomyViewer] Loading GLB:', modelPath);
      onStatus('loading');
      loadGLTF(modelPath)
        .then((loaded) => {
          if (!mounted) return;
          setGltf(loaded);
          console.log('[AnatomyViewer] GLB loaded:', modelPath, loaded);
          onStatus('loaded');
          // frame camera to model
          const scene = loaded.scene as Object3D;
          const box = new Box3().setFromObject(scene);
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const distance = Math.max(0.6, defaultDistance * (maxDim / 2));
          camera.position.set(distance, distance, distance);
          camera.lookAt(center);
        })
        .catch((e: any) => {
          if (!mounted) return;
          console.error('[AnatomyViewer] Failed to load GLB:', modelPath, e);
          const msg = e?.message ?? 'Failed to load model';
          setError(msg);
          onError(msg);
        });
      return () => {
        mounted = false;
      };
    }, [modelPath, defaultDistance, camera]);

    if (error) {
      return null;
    }
    if (!gltf) return null;
    return <primitive ref={rootRef as any} object={gltf.scene} />;
  };

  const [status, setStatus] = useState<string>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  return (
    <div className="w-full h-[420px] md:h-full relative">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 50 }} className="w-full h-full">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <Model modelPath={modelPath} defaultDistance={defaultDistance} onStatus={setStatus} onError={setErrMsg} />
        <OrbitControls minDistance={0.6} maxDistance={6} enablePan enableZoom enableRotate />
      </Canvas>
      <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-white">
        {errMsg ? `Error: ${errMsg}` : status === 'loading' ? 'Loading model…' : '3D viewer ready'}
      </div>
    </div>
  );
};

// TODO: Restore Model loader and Html overlays once base Canvas is verified.

// 
// <Canvas
//   dpr={[1, 2]}
//   camera={{ position: [0, 0, 3], fov: 50 }}
//   className="w-full h-full"
// >
//   <ambientLight intensity={0.4} />
//   <directionalLight position={[10, 10, 5]} intensity={1} />
//   <pointLight position={[-10, -10, -5]} intensity={0.5} />
//   <OrbitControls
//     minDistance={0.6}
//     maxDistance={6}
//     enablePan={true}
//     enableZoom={true}
//     enableRotate={true}
//   />
// </Canvas>

export default AnatomyViewer;
