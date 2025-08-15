import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Small cache for loaded models
const modelCache = new Map<string, any>();

// Create DRACO loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // You may need to copy draco files to public/draco/

// Create GLTF loader with DRACO and Meshopt support
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

export interface LoadedModel {
  scene: any;
  animations: any[];
  asset: any;
  parser: any;
  userData: any;
}

export const loadGLTF = async (url: string, useCache = true): Promise<LoadedModel> => {
  // Check cache first
  if (useCache && modelCache.has(url)) {
    return modelCache.get(url);
  }

  try {
    const gltf = await gltfLoader.loadAsync(url);
    
    // Cache the loaded model
    if (useCache) {
      modelCache.set(url, gltf);
    }
    
    return gltf;
  } catch (error) {
    console.error(`Failed to load GLTF from ${url}:`, error);
    throw error;
  }
};

export const clearCache = () => {
  modelCache.clear();
};

export const removeFromCache = (url: string) => {
  modelCache.delete(url);
};

export const getCacheSize = () => {
  return modelCache.size;
};

export { gltfLoader, dracoLoader };
