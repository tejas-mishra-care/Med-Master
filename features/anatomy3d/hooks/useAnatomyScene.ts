import { useCallback, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster, Object3D, Mesh } from 'three';

export interface AnatomySceneState {
  selectedNode: string | null;
  hoveredNode: string | null;
  showLabels: boolean;
  showSlice: boolean;
  hiddenNodes: Set<string>;
}

export interface AnatomySceneActions {
  onSelectNode: (nodeName: string | null) => void;
  onHoverNode: (nodeName: string | null) => void;
  toggleNodeVisibility: (nodeName: string, visible: boolean) => void;
  toggleLabels: () => void;
  toggleSlice: () => void;
  resetView: () => void;
  hideSelected: () => void;
  unhideAll: () => void;
}

export const useAnatomyScene = (): [AnatomySceneState, AnatomySceneActions] => {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector3());
  const state = useRef<AnatomySceneState>({
    selectedNode: null,
    hoveredNode: null,
    showLabels: false,
    showSlice: false,
    hiddenNodes: new Set(),
  });

  // Analytics events
  const emitAnalytics = useCallback((event: string, data?: any) => {
    // You can integrate with your analytics service here
    console.log('Analytics:', event, data);
  }, []);

  // Raycasting for mouse interactions
  const handlePointerMove = useCallback((event: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let hoveredNode: string | null = null;
    if (intersects.length > 0) {
      const object = intersects[0].object;
      hoveredNode = object.name || object.userData?.nodeName || null;
    }

    if (hoveredNode !== state.current.hoveredNode) {
      state.current.hoveredNode = hoveredNode;
      // Emit hover analytics
      if (hoveredNode) {
        emitAnalytics('anatomy_node_hover', { node: hoveredNode });
      }
    }
  }, [camera, scene, gl, emitAnalytics]);

  // Handle click selection
  const handlePointerClick = useCallback((event: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let selectedNode: string | null = null;
    if (intersects.length > 0) {
      const object = intersects[0].object;
      selectedNode = object.name || object.userData?.nodeName || null;
    }

    if (selectedNode !== state.current.selectedNode) {
      state.current.selectedNode = selectedNode;
      // Emit selection analytics
      if (selectedNode) {
        emitAnalytics('anatomy_node_select', { node: selectedNode });
      }
    }
  }, [camera, scene, gl, emitAnalytics]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'r':
        // Reset view
        event.preventDefault();
        // Reset camera to default position
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
        emitAnalytics('anatomy_reset_view');
        break;
      case 'l':
        // Toggle labels
        event.preventDefault();
        state.current.showLabels = !state.current.showLabels;
        emitAnalytics('anatomy_toggle_labels', { show: state.current.showLabels });
        break;
      case 'h':
        // Hide selected
        event.preventDefault();
        if (state.current.selectedNode) {
          state.current.hiddenNodes.add(state.current.selectedNode);
          emitAnalytics('anatomy_hide_node', { node: state.current.selectedNode });
        }
        break;
      case 'u':
        // Unhide all
        event.preventDefault();
        state.current.hiddenNodes.clear();
        emitAnalytics('anatomy_unhide_all');
        break;
    }
  }, [camera, emitAnalytics]);

  // Set up event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gl, handlePointerMove, handlePointerClick, handleKeyDown]);

  // Actions
  const actions: AnatomySceneActions = {
    onSelectNode: useCallback((nodeName: string | null) => {
      state.current.selectedNode = nodeName;
      if (nodeName) {
        emitAnalytics('anatomy_node_select', { node: nodeName });
      }
    }, [emitAnalytics]),

    onHoverNode: useCallback((nodeName: string | null) => {
      state.current.hoveredNode = nodeName;
      if (nodeName) {
        emitAnalytics('anatomy_node_hover', { node: nodeName });
      }
    }, [emitAnalytics]),

    toggleNodeVisibility: useCallback((nodeName: string, visible: boolean) => {
      if (visible) {
        state.current.hiddenNodes.delete(nodeName);
      } else {
        state.current.hiddenNodes.add(nodeName);
      }
      emitAnalytics('anatomy_toggle_visibility', { node: nodeName, visible });
    }, [emitAnalytics]),

    toggleLabels: useCallback(() => {
      state.current.showLabels = !state.current.showLabels;
      emitAnalytics('anatomy_toggle_labels', { show: state.current.showLabels });
    }, [emitAnalytics]),

    toggleSlice: useCallback(() => {
      state.current.showSlice = !state.current.showSlice;
      emitAnalytics('anatomy_toggle_slice', { show: state.current.showSlice });
    }, [emitAnalytics]),

    resetView: useCallback(() => {
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0);
      emitAnalytics('anatomy_reset_view');
    }, [camera, emitAnalytics]),

    hideSelected: useCallback(() => {
      if (state.current.selectedNode) {
        state.current.hiddenNodes.add(state.current.selectedNode);
        emitAnalytics('anatomy_hide_node', { node: state.current.selectedNode });
      }
    }, [emitAnalytics]),

    unhideAll: useCallback(() => {
      state.current.hiddenNodes.clear();
      emitAnalytics('anatomy_unhide_all');
    }, [emitAnalytics]),
  };

  return [state.current, actions];
};
