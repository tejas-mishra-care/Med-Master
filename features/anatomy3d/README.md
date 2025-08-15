# 3D Anatomy Module

A comprehensive 3D anatomy viewer for MedMaster, built with React Three Fiber and featuring interactive anatomical models.

## Features

### 🎯 Core Functionality
- **Interactive 3D Models**: View detailed anatomical structures with real-time rendering
- **System Selection**: Switch between different anatomical systems (Angiology, Neurology, Myology, etc.)
- **Orbit Controls**: Rotate, zoom, and pan around 3D models
- **Node Selection**: Click on anatomical structures to view information
- **Hover Effects**: Visual feedback when hovering over structures

### 🏷️ Labeling System
- **Custom Labels**: Add personal notes and labels to anatomical structures
- **Persistent Storage**: Labels are saved locally using IndexedDB
- **System-specific Labels**: Labels are organized by anatomical system
- **Quick Access**: View all labels for selected structures

### 🎮 Controls & Shortcuts
- **Mouse Controls**: 
  - Left click: Select structure
  - Right click + drag: Rotate view
  - Scroll: Zoom in/out
  - Middle click + drag: Pan view
- **Keyboard Shortcuts**:
  - `R`: Reset view
  - `L`: Toggle labels
  - `H`: Hide selected structure
  - `U`: Unhide all structures

### 🔧 Developer Features
- **Debug Panel**: Explore scene graph and node names
- **Performance Optimized**: Uses demand frameloop and DPR scaling
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## File Structure

```
features/anatomy3d/
├── components/
│   ├── AnatomyViewer.tsx      # Main 3D viewer component
│   ├── AnatomySidebar.tsx     # Left sidebar with system selection
│   ├── LabelsPanel.tsx        # Right panel for labels and info
│   └── DebugPanel.tsx         # Developer debug panel
├── data/
│   ├── anatomyManifest.json   # System configuration and model paths
│   └── defaultLabels.json     # Default label templates
├── hooks/
│   └── useAnatomyScene.ts     # Custom hook for scene management
├── styles/
│   └── anatomy.css            # Module-specific styles
└── README.md                  # This file
```

## Usage

### Basic Setup

1. **Navigate to the anatomy page**:
   ```
   /dashboard/anatomy
   ```

2. **Select an anatomical system** from the left sidebar

3. **Interact with the 3D model**:
   - Click on structures to select them
   - Use mouse to rotate, zoom, and pan
   - Use keyboard shortcuts for quick actions

### Adding Labels

1. **Select a structure** by clicking on it
2. **Click the bookmark icon** in the right panel
3. **Enter a title and notes** for your label
4. **Save the label** - it will be stored locally

### Debug Mode

1. **Open browser console** (F12)
2. **Look for debug information** about scene graph
3. **Use the debug panel** to explore node names and toggle visibility

## Technical Details

### Dependencies
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **three**: 3D graphics library
- **IndexedDB**: Local storage for labels

### Model Format
- **GLB/GLTF**: Standard 3D model format
- **DRACO Compression**: Automatic decompression support
- **Meshopt**: Additional compression support

### Performance Features
- **Lazy Loading**: Models load on demand
- **Caching**: Loaded models are cached in memory
- **Demand Frameloop**: Only renders when needed
- **DPR Scaling**: Optimized for different screen densities

## Configuration

### Anatomy Manifest

The `anatomyManifest.json` file defines available systems:

```json
{
  "id": "angiology",
  "name": "Angiology",
  "path": "/models/3D anatomy/angiology.glb",
  "color": "#6fb1ff",
  "defaultTarget": "Heart",
  "defaults": { "distance": 2.8 }
}
```

### Adding New Models

1. **Place GLB file** in `public/models/3D anatomy/`
2. **Add entry** to `anatomyManifest.json`
3. **Update default target** and distance as needed
4. **Test the model** by navigating to the anatomy page

## Troubleshooting

### Model Not Loading
- Check file path in manifest
- Verify GLB file is valid
- Check browser console for errors
- Ensure DRACO decoder files are present

### Performance Issues
- Reduce model complexity
- Enable compression (DRACO/Meshopt)
- Check for memory leaks in console
- Consider model optimization tools

### Labels Not Saving
- Check IndexedDB support in browser
- Verify browser storage permissions
- Check console for database errors

## Attribution

3D models are sourced from Z-Anatomy and are licensed under CC BY-SA 4.0.

## Contributing

When contributing to the anatomy module:

1. **Follow existing patterns** for component structure
2. **Add TypeScript types** for new interfaces
3. **Test with different models** and screen sizes
4. **Update documentation** for new features
5. **Consider accessibility** in new features

## Future Enhancements

- [ ] **2D Slice Views**: Cross-sectional anatomy views
- [ ] **Animation Support**: Animated anatomical processes
- [ ] **Quiz Integration**: Interactive anatomy quizzes
- [ ] **Collaborative Features**: Shared annotations
- [ ] **Mobile Optimization**: Touch controls for mobile devices
- [ ] **AR/VR Support**: Extended reality viewing modes
