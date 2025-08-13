// components/PDFViewer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
/*
This component is the core PDF viewer for MedMaster.
It integrates react-pdf for rendering PDF pages and Fabric.js for overlaying
interactive elements like annotations (highlights and drawings).

Key Features:
- Renders a PDF from a given URL, page by page.
- Allows users to add annotations (highlights, drawings) using Fabric.js.
- Provides a toolbar for selecting annotation tools and colors.
*/
import { fabric } from 'fabric';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { debounce } from 'lodash'; // Assuming lodash is installed
import { useMediaQuery } from 'react-responsive'; // Assuming react-responsive is installed

// Set up pdf.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  pdfUrl: string;
  pdfId: string;
  userId: string;
  onAnnotationSave: (annotationData: any) => void; // Callback for saving annotations
  onAddToNotes: (excerpt: string) => void; // Callback to add excerpt to notes
  initialAnnotations?: any[]; // Initial annotations to load
  // Add a prop for a dictionary lookup function
  onWordLookup?: (word: string, position: { x: number; y: number }) => void;
  // Add a prop to indicate if reduced motion is preferred (or use a hook)
  prefersReducedMotion?: boolean;
  // Add a prop to indicate if the viewer is read-only
  isReadOnly?: boolean;

}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  pdfId,
  userId,
  onAnnotationSave,
  onAddToNotes,
  initialAnnotations = [],
  onWordLookup, // Dictionary lookup callback
  prefersReducedMotion = false, // Default to false if not provided
  isReadOnly = false, // Default to not read-only
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // State to manage loading status of the PDF
  const [isLoading, setIsLoading] = useState(true);
  // State to manage the currently active annotation tool
  // 'pen': for freehand drawing
  // 'highlighter': for highlighting text/areas
  // null: no tool active (allows selection/other interactions)
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | null>(null);
  // State to store the currently selected color for annotations
  const [selectedColor, setSelectedColor] = useState<string>('#ffff00'); // Default highlight color
  // Hook to detect if the user is on a mobile device
  // This can be used for responsive adjustments or enabling mobile-specific features/workarounds
  const isMobile = useMediaQuery({ maxWidth: 767 }); // Example breakpoint

  // Mobile screenshot prevention guidance:
  // On mobile platforms, preventing screenshots programmatically is often
  // difficult or not fully supported by web APIs. Native mobile apps might
  // have better capabilities (e.g., FLAG_SECURE on Android). For a web app,
  // you might need to explore OS-level restrictions or native wrappers if
  // this is a strict requirement. No web standard guarantees this.

  // Debounced function to save annotations to the backend.
  // This helps prevent excessive API calls while the user is actively drawing
  // by waiting for a pause in activity before sending the data.
  // It filters annotations to save only those created by the current user
  // and prepares the data format for the API.
  // Note: `toObject` needs to capture all necessary properties for recreation.
  const debouncedSaveAnnotations = debounce(async (annotations: any[]) => {
    // Filter annotations to only include those drawn by the current user
    const userAnnotations = annotations.filter((anno: any) => anno.userId === userId);
    // Prepare annotation data for saving (simplify fabric objects)
    const annotationData = userAnnotations.map((anno: any) => ({
      pdf_id: pdfId,
      user_id: userId,
      page: anno.page,
      rect: anno.toObject(['left', 'top', 'width', 'height', 'scaleX', 'scaleY', 'angle']), // Basic position/size
      type: anno.type, // e.g., 'path', 'rect'
      color: anno.stroke || anno.fill,
      // You might need to add more specific data based on the fabric object type
    }));

    try {
      // Call the API to save annotations
      const response = await fetch('/api/pdf/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations: annotationData }),
      });
      if (!response.ok) {
        console.error('Failed to save annotations');
      } else {
        onAnnotationSave(annotationData); // Notify parent component
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  }, 1000); // Save annotations 1 second after the last change

  // Effect hook to initialize and manage the Fabric.js canvas.
  // This runs when the component mounts or when key dependencies change (tools, color, initial annotations).
  useEffect(() => {
    // Get canvas and container elements
    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Proceed only if both canvas and container are available
    if (canvas && container) {
      // Create a new Fabric.js canvas instance, linked to the HTML canvas element.
      // Set initial drawing mode based on the current tool.
      const fabricCanvas = new fabric.Canvas(canvas, {
        isDrawingMode: !isReadOnly && currentTool !== null, // Enable drawing only if not read-only and a tool is selected
      });
      // Store the Fabric canvas instance in a ref for later access
      fabricCanvasRef.current = fabricCanvas;

      // Load initial annotations
      // This is crucial for displaying previously saved annotations when the PDF page loads.
      // It requires recreating Fabric objects based on the saved data format.
      initialAnnotations.forEach((anno) => {
        // Check if the annotation is for the current page before loading
        if (anno.page === pageNumber) {


        // Recreate fabric objects from stored data - this requires careful mapping
        // based on how you saved the annotations.
        // Example for a rectangle (highlight):
        if (anno.type === 'rect') {
          const rect = new fabric.Rect({
            ...anno.rect, // Load saved properties
            fill: anno.color,
            opacity: 0.3, // Highlight opacity
            selectable: false, // Make highlights not selectable for drawing
            evented: false, // Do not trigger events on highlights
            userId: anno.user_id, // Store user ID on the fabric object
            page: anno.page, // Store page number
          });
          // Add the created Fabric object to the canvas
          fabricCanvas.add(rect);
        }
        // Add logic for other types (e.g., 'path' for drawings)
        // ...
        }
      });
      // Render the canvas to display the loaded annotations
      fabricCanvas.renderAll();

      // Set up a ResizeObserver to automatically adjust the Fabric canvas size
      // when the container element is resized. This ensures the canvas matches
      // Handle canvas resizing
      const resizeObserver = new ResizeObserver(() => {
        const { width, height } = container.getBoundingClientRect();
        fabricCanvas.setWidth(width);
        fabricCanvas.setHeight(height);
        // You might need to re-render or adjust existing objects on resize
      });
      resizeObserver.observe(container);

      // Add event listeners for drawing/highlighting if not in read-only mode
      if (!isReadOnly) {
        fabricCanvas.on('path:created', (e) => {
          // When a drawing path is created, configure its properties
          if (e.path) {
            e.path.set({
              stroke: selectedColor, // Set stroke color based on selectedColor state
              strokeWidth: currentTool === 'pen' ? 2 : 15, // Adjust stroke width based on the tool
              // Use 'multiply' composition for highlighter effect (darkens pixels below)
              globalCompositeOperation: currentTool === 'highlighter' ? 'multiply' : 'source-over',
              opacity: currentTool === 'highlighter' ? 0.5 : 1, // Adjust opacity
              selectable: false, // Make drawn objects not selectable after creation
              evented: false, // Prevent event propagation
              userId: userId, // Attach the current user's ID to the annotation object
              page: pageNumber, // Attach the current page number to the annotation object
            });
            // Trigger the debounced save function to persist the new annotation
            debouncedSaveAnnotations(fabricCanvas.getObjects());
          }
        });
      }

      // Long-press detection for dictionary lookup
      // This logic is complex as it needs to correlate screen coordinates with PDF text.
      // The current implementation is a placeholder.
      let pressTimer: any;
      fabricCanvas.on('mouse:down', (options) => {
        // Only detect long-press if no tool is active and a word lookup function is provided
        if (!currentTool && onWordLookup) {
          // Start a timer. If the mouse is held down for the duration, it's considered a long press.
          pressTimer = setTimeout(() => {
            // On long press, attempt to identify the word under the cursor.
            // Attempt to get text under the cursor (this is complex with pdf.js text layer and fabric)
            // A simpler approach might be to get the coordinates and query the rendered PDF text layer
            // outside of Fabric. For now, this is a placeholder.
            console.log('Long press detected at:', options.pointer);
            // Call the onWordLookup callback with placeholder data.
            // Placeholder: Logic to get text excerpt under cursor and call dictionary API
            onWordLookup('placeholder_word', { x: options.pointer.x!, y: options.pointer.y! });
            // Example: fetch(`/api/dict/define?word=medical`)
            // .then(res => res.json())
            // .then(data => console.log(data))
            // .catch(err => console.error(err));
          }, 700); // 700ms for long press
        } else {
          // If a tool is active or no lookup function, clear any potential timer
          clearTimeout(pressTimer);
        }
      });
      fabricCanvas.on('mouse:up', () => {
        clearTimeout(pressTimer);
      });
      fabricCanvas.on('mouse:move', () => {
        clearTimeout(pressTimer);
      });


      return () => {
        resizeObserver.disconnect();
        // Dispose of the Fabric canvas instance to free up resources
        fabricCanvas.dispose();
        // Cancel any pending debounced save operations
        debouncedSaveAnnotations.cancel(); // Cancel any pending saves
      };
    }
  }, [
    currentTool, selectedColor, initialAnnotations, pdfId, userId, pageNumber, // Dependencies that require canvas re-initialization
    isReadOnly, onWordLookup // Include read-only state and lookup callback
  ]);
  // Re-initialize canvas when tools, color, initialAnnotations, read-only state, or page number changes

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  // Function to toggle between annotation tools (Pen, Highlighter, or none)
  const toggleTool = (tool: 'pen' | 'highlighter' | null) => {
    if (isReadOnly) return; // Do nothing if in read-only mode
    setCurrentTool(currentTool === tool ? null : tool);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = (currentTool !== tool); // Enable drawing mode if a tool is selected
      // Configure brush for the selected tool
      if (currentTool !== tool) {
        if (tool === 'pen') {
          fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
          fabricCanvasRef.current.freeDrawingBrush.width = 2;
          // Potentially set composition mode here if needed for pen
        } else if (tool === 'highlighter') {
          fabricCanvasRef.current.freeDrawingBrush.color = selectedColor; // Highlighter color
          fabricCanvasRef.current.freeDrawingBrush.width = 15; // Thicker for highlight
          fabricCanvasRef.current.freeDrawingBrush.globalCompositeOperation = 'multiply'; // Achieve highlight effect
        }
      } else {
        // When turning off drawing mode
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.globalCompositeOperation = 'source-over'; // Reset composition
        }
      }
    }
  };

  // Function to select the color for the active annotation tool
  const selectColor = (color: string) => {
    setSelectedColor(color);
    if (fabricCanvasRef.current && fabricCanvasRef.current.isDrawingMode) {
      fabricCanvasRef.current.freeDrawingBrush.color = color;
      fabricCanvasRef.current.renderAll(); // Re-render to show color change on brush
    }
  };

  const undo = () => {
    if (fabricCanvasRef.current) {
      // This requires tracking canvas history manually or using a library
      // Fabric's built-in undo/redo is limited.
      // Placeholder for undo logic
      console.log('Undo not implemented yet.');
    }
  };

  // Function to clear annotations from the current page.
  // It currently only targets annotations made by the current user on the displayed page.
  const clearCanvas = () => {
    if (fabricCanvasRef.current && !isReadOnly) { // Allow clearing only if not read-only
      // Clear only the current user's annotations on the current page
      const objects = fabricCanvasRef.current.getObjects();
      objects.forEach((obj: any) => {
        if (obj.userId === userId && obj.page === pageNumber) {
          fabricCanvasRef.current?.remove(obj);
        }
      });
      fabricCanvasRef.current.renderAll();
      debouncedSaveAnnotations(fabricCanvasRef.current.getObjects()); // Save the cleared state
    }
  };

  // Function to add the currently selected text from the PDF to the notes.
  // Requires integration with the PDF text layer selection events.
  const addSelectionToNotes = () => {
    // Call the onAddToNotes callback with the selected text.
    // This requires getting the selected text from the PDF.
    // This is not straightforward with pdf.js and Fabric.
    // You would need to integrate with the pdf.js text layer and get selection events.
    // For now, it calls the callback with a placeholder string.
    // Placeholder: Call onAddToNotes with a dummy or actual selected text
    onAddToNotes('Selected text excerpt...');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex items-center space-x-2">
        {/* Toolbar: Display only if not in read-only mode */}
        {!isReadOnly && (
          <>
            <button
              onClick={() => toggleTool('pen')}
              className={`p-2 rounded ${currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              aria-pressed={currentTool === 'pen'}
              aria-label="Toggle Pen Tool"
            >
              Pen
            </button>
            <button
              onClick={() => toggleTool('highlighter')}
              className={`p-2 rounded ${currentTool === 'highlighter' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
              aria-pressed={currentTool === 'highlighter'}
              aria-label="Toggle Highlighter Tool"
            >
              Highlighter
            </button>
            {/* Color Palette (Simple example) */}
            <div className="flex space-x-1">
              {['#ffff00', '#ff0000', '#00ff00', '#0000ff'].map(color => (
                <button
                  key={color}
                  style={{ backgroundColor: color, width: '20px', height: '20px' }}
                  className={`rounded-full border ${selectedColor === color ? 'border-black' : 'border-gray-400'}`}
                  onClick={() => selectColor(color)}
                  aria-label={`Select color ${color}`}
                ></button>
              ))}
            </div>
            {/* Undo and Clear buttons - implement functionality */}
            <button onClick={undo} className="p-2 rounded bg-gray-200" aria-label="Undo Last Action" disabled>Undo</button>
            <button onClick={clearCanvas} className="p-2 rounded bg-red-200" aria-label="Clear Annotations on this page">Clear Page</button>
          </>
        )}
         {/* Button to add selected text (or placeholder) to notes */}
         {/* This button is available even in read-only mode if adding to notes is a feature */}
         <button onClick={addSelectionToNotes} className="p-2 rounded bg-gray-200" aria-label="Add Selection to Notes">Add to Notes</button>
      </div>

      {/* Main viewer area: contains the PDF document and the Fabric canvas overlay */}
      <div className="flex-grow overflow-auto relative" ref={containerRef}>
        {/* Skeleton Loader: Shown while the PDF is loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-gray-300 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-gray-300 rounded col-span-2"></div>
                    <div className="h-2 bg-gray-300 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* PDF Document component from react-pdf */}
         {/* Apply reduced motion if user preference is set */}
         {/* Note: Simple scale transformation is just an example for reduced motion.
             More advanced handling might involve disabling animations or transitions. */}
         <div style={{ transition: prefersReducedMotion ? 'none' : 'transform 0.3s ease-out' }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-center p-4">Loading PDF...</div>}
            error={<div className="text-center p-4 text-red-500">Error loading PDF.</div>}
            options={{
              // Disable worker support if running in a restricted environment,
              // but this can impact performance. Prefer dedicated worker.
              // workerSrc: "/pdf.worker.js"
            }}
          >
            <Page
              // Render only the current page
              pageNumber={pageNumber}
              // Enable rendering of annotations already present in the PDF file
              renderAnnotationLayer={true}
              // Enable rendering of the text layer, which is useful for text selection
              // and potentially for the dictionary lookup feature.
              renderTextLayer={true}
              canvasRef={canvasRef} // pdf.js will render to this canvas
              onRenderSuccess={() => {
                // After PDF page is rendered, set fabric canvas size
                if (canvasRef.current && containerRef.current && fabricCanvasRef.current) {
                  const { width, height } = canvasRef.current.getBoundingClientRect();
                   // Match Fabric canvas size to the rendered PDF page canvas
                   fabricCanvasRef.current.setWidth(width);
                   fabricCanvasRef.current.setHeight(height);
                   fabricCanvasRef.current.renderAll(); // Ensure Fabric canvas is rendered
                }
              }}
            />
          </Document>
        </div>
        {/* The Fabric.js canvas is positioned absolutely to overlay the PDF page rendered by pdf.js */}
        {/* Fabric canvas overlays the PDF rendering */}
        {/* This canvas is managed by Fabric.js */}
        {/* Position absolutely over the pdf.js canvas */}
      </div>

      <div className="p-2 border-t flex justify-center items-center space-x-4">
        {/* Pagination controls */}
        <button
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className="p-2 rounded bg-gray-200 disabled:opacity-50"
          aria-label="Previous Page"
        >
          Previous
        </button>
        <span>
          Page {pageNumber || (numPages ? 1 : '—')} of {numPages || '—'}
        </span>
        <button
          disabled={pageNumber >= (numPages || 0)}
          onClick={nextPage}
          className="p-2 rounded bg-gray-200 disabled:opacity-50"
          aria-label="Next Page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;