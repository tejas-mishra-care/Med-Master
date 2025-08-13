// components/SplitScreenNotes.tsx
import React, { useState, useRef, useEffect } from 'react';
import PDFViewer from './PDFViewer'; // Assuming PDFViewer component exists
// Import either TipTap or Quill components based on preference
// // TipTap Example:
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

interface SplitScreenNotesProps {
  pdfUrl: string;
  initialNotes: string;
  onNotesSave: (notes: string) => void;
  onPdfSelection: (selection: string) => void;
  syncStatus: 'online' | 'offline' | 'syncing';
  onInsertSnapshot?: (snapshotData: any) => void; // For 3D viewer integration
}

// Component for a split-screen layout with a PDF viewer on the left and a notes editor on the right.
const SplitScreenNotes: React.FC<SplitScreenNotesProps> = ({
  pdfUrl,
  initialNotes,
  onNotesSave,
  onPdfSelection,
  syncStatus,
  onInsertSnapshot, // Function to handle inserting a snapshot from the 3D viewer
}) => {
  const [leftWidth, setLeftWidth] = useState(50); // Percentage of the container width
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const notesRef = useRef(initialNotes); // To hold the latest notes content

  // --- Rich Text Editor Setup (Example with Placeholder) ---
  // Replace with actual TipTap or Quill implementation
  // This state holds the content of the rich text editor.
  // In a real implementation, this would likely be managed by the editor library itself.
  const [editorContent, setEditorContent] = useState(initialNotes);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    notesRef.current = content;
    // Debounce the save operation
    const debounceSave = setTimeout(() => {
      onNotesSave(content);
    }, 1000); // Save after 1 second of inactivity
    return () => clearTimeout(debounceSave);
  };
  // --- End Rich Text Editor Setup ---

  // Effect to debounce the saving of notes as the user types.
  // This prevents saving on every keystroke, improving performance.
  // Debounce function for saving notes
  useEffect(() => {
    const handler = setTimeout(() => {
      onNotesSave(notesRef.current);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [notesRef.current, onNotesSave]);


  // Handle mouse movement for resizing the split view.
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(Math.max(10, Math.min(90, newLeftWidth))); // Clamp between 10% and 90%
  };

  // Handle mouse release to stop resizing.
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse down on the divider to start resizing.
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Function to append content to the rich text editor
  const appendToNotes = (content: string) => {
    // This needs to be implemented based on the chosen rich text editor
    // Example: if using ReactQuill, you might do something like:
    // const editor = quillRef.current?.getEditor();
    // editor.insertText(editor.getLength(), content + '\n');
    // setEditorContent(editor.getContents()); // Update state if needed
 
    // Placeholder implementation:
    setEditorContent(prev => prev + '\n' + content);
    notesRef.current = notesRef.current + '\n' + content;
  };

  // Handler for text selection events from the PDFViewer.

  // Handle PDF selection event from PDFViewer
  const handlePdfTextSelection = (selection: string) => {
    if (selection) {
      appendToNotes(selection);
      onPdfSelection(selection); // Notify parent about the selection
    }
  };

  // Handler for inserting a snapshot from the 3D viewer into the notes.
  // Handle snapshot insertion from 3D viewer
  const handleInsertSnapshot = (snapshotData: any) => {
    if (onInsertSnapshot) {
        onInsertSnapshot(snapshotData);
        // Append placeholder text or a visual representation to the editor
        appendToNotes(`[3D Model Snapshot: ${snapshotData.modelId}]`);
    }
  };

  // Render the split-screen layout.
 
  return (
    <div
      ref={containerRef}
      className="flex h-full overflow-hidden theme-aware-styles" // Add a class for theme styling
      // The split layout is achieved using flexbox and setting the width of each pane.
    >
      {/* Left Pane: PDF Viewer */}
      <div style={{ width: `${leftWidth}%` }} className="flex-shrink-0 h-full overflow-hidden">
        <PDFViewer
          pdfUrl={pdfUrl}
          onTextSelection={handlePdfTextSelection} // Pass the handler for text selection
          onAnnotationSave={(annotation) => {
            // Call API to save annotation
            console.log('Saving annotation:', annotation);
          }}
           // Add other necessary props
        />
      </div>

      {/* Resizable Divider - allows dragging to change the width of the panes. */}
      <div
        className="w-2 cursor-ew-resize bg-gray-300 dark:bg-gray-700 flex-shrink-0"
        onMouseDown={handleMouseDown}
      >
        {/* Drag Handle - add visual indicator if desired */}
        {/* A simple visual handle could be added here, e.g., a few vertical dots. */}
      </div>

      {/* Right Pane: Rich Text Editor */}
      {/* This pane contains the area where the user can type and see clipped content. */}
      <div style={{ width: `${100 - leftWidth}%` }} className="flex-grow h-full overflow-hidden p-4 bg-bg dark:bg-dark-bg">
        {/* Placeholder for Rich Text Editor */}
        {/* This textarea is a temporary placeholder. */}
        <textarea
          // It should be replaced with a full-featured rich text editor like TipTap or Quill.
          className="w-full h-full border rounded p-2 theme-aware-input" // Add a class for theme styling
          value={editorContent}
          onChange={(e) => handleEditorChange(e.target.value)}
          placeholder="Start typing your notes here..."
        />
        {/*
          Replace the textarea above with your chosen rich text editor:
          Example with TipTap:
          <EditorContent editor={editor} />

          Example with ReactQuill:
          <ReactQuill value={editorContent} onChange={handleEditorChange} />
        */}

        {/* Indicator to show the current offline synchronization status. */}
        {/* Offline Sync Indicator */}
        {syncStatus === 'offline' && (
          <div className="text-red-500 mt-2">Offline - Changes will sync when online</div>
        )}
        {syncStatus === 'syncing' && (
          <div className="text-yellow-500 mt-2">Syncing changes...</div>
        )}

        {/* Note on Export */}
        {/* Important note about the limitations of exporting only user-created notes. */}
        <div className="text-sm text-gray-500 mt-2">
          Note: Only your written notes can be exported (as JSON). Full PDF export is not supported.
        </div>
      </div>
    </div>
  );
};

export default SplitScreenNotes;