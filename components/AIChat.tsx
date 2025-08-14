// components/AIChat.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
// UI components from shadcn/ui
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { CopyIcon, SaveIcon } from 'lucide-react';

// Interface for messages displayed in the chat
interface Message {
  id: string;
  text: string;
  // Indicates if the message is from the user or the AI
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  cached?: boolean;
  disclaimer?: string;
}

// Interface for items added as context to the AI query
interface ContextItem {
  id: string;
  text: string;
  type: 'pdf' | 'question' | 'srs';
}

// The main AIChat component
export function AIChat() {
  // State to hold the list of messages in the chat
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the user's input in the textarea
  const [input, setInput] = useState('');
  // State to indicate if an API call is in progress
  const [loading, setLoading] = useState(false);
  // State to hold the current context items for the next AI query
  const [context, setContext] = useState<ContextItem[]>([]);
  // Ref for the scroll area to enable auto-scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // TODO: Get this from lib/constants.ts
  const DISCLAIMER_TEXT = "⚠️ For educational purposes only — not a substitute for professional medical advice."; // Should come from constants

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async () => {
    // Prevent sending empty messages or sending while loading
    if (!input.trim() || loading) return;

    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: input,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const contextIds = context.map(c => c.id); // Assuming context items have IDs matching DB records
    // TODO: Pass the actual context text for better results, not just IDs

    try {
      // Replace with actual API call to your /api/ai/query route
      const response = await fetch('/api/ai/query', {
        // Use POST for sending data
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          context_ids: contextIds.length > 0 ? contextIds : undefined,
          userId: 'current-user-id', // Replace with actual user ID
        }),
      });

      // Check if the request was successful
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch AI response');
      }

      const data = await response.json();
      // Parse the JSON response from the API

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: data.answer,
        isUser: false,
        timestamp: new Date(),
        sources: data.sources,
        cached: data.cached,
        disclaimer: data.disclaimer || DISCLAIMER_TEXT,
      };
      setMessages((prev) => [...prev, aiMessage]);

    // Catch any errors during the API call
    } catch (error: unknown) {
      const errorMessageText = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error fetching AI response",
        description: errorMessageText,
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: `Error: ${errorMessageText}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setLoading(false);
      // Clear context after the AI response
      setContext([]); // Clear context after use
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter key press, unless Shift is also held down
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // const addContext = (item: ContextItem) => {
  //   // Prevent duplicates
  //   // Adds an item to the context state
  //   if (!context.some(c => c.id === item.id)) {
  //     setContext(prev => [...prev, item]);
  //     toast({
  //       title: "Context Added",
  //       description: `Added ${item.type} to context.`,
  //     });
  //   }
  // };

  const handleSaveNote = (text: string) => {
    // TODO: Implement "Save to Notes" functionality
    toast({
      title: "Save to Notes",
      description: "This feature is coming soon!", // Placeholder
    });
    console.log("Saving note:", text);
  };

  const handleCopyAnswer = (text: string) => {
    // Copies the AI's answer text to the clipboard
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "AI answer copied to clipboard.",
    });
  };


  return (
    // Main chat container, full height and max height
    <div className="flex flex-col h-full max-h-full bg-bg dark:bg-gray-900">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              // Align messages to the right for user, left for AI
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${msg.isUser
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  // Styling based on whether the message is from the user or AI
                }`}
              >
                {!msg.isUser && msg.disclaimer && (
                  <div className="bg-highlight text-gray-900 p-2 rounded-md mb-2 text-sm">
                    {msg.disclaimer}
                  </div>
                )}
                {/* Display the message text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {/* Actions and metadata for AI messages */}
                {!msg.isUser && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>{format(msg.timestamp, 'HH:mm')}</span>
                    {msg.cached && (
                       // Badge to indicate if the response was from cache
                       <span className="ml-2 px-1 py-0.5 bg-accent text-gray-900 rounded-full text-[10px]">Cached</span>
                    )}
                    <div className="flex space-x-2 ml-auto">
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyAnswer(msg.text)} aria-label="Copy answer">
                         <CopyIcon className="h-3 w-3" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSaveNote(msg.text)} aria-label="Save to notes">
                          <SaveIcon className="h-3 w-3" />
                       </Button>
                    </div>
                  </div>
                )}
                {/* Display sources if available for AI messages */}
                {!msg.isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    Sources: {msg.sources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Loading indicator while waiting for AI response */}
          {loading && (
            <div className="flex justify-start">
               <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                 Thinking...
               </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area for the user */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
         {context.length > 0 && (
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
               Context: {context.map(c => `${c.type}:${c.id}`).join(', ')}
            </div>
         )}
        <div className="flex items-center space-x-2">
          {/* Textarea for user input */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask MedMaster..."
            className="flex-1"
            disabled={loading}
             rows={1}
          />
          {/* Send button */}
          <Button onClick={handleSend} disabled={!input.trim() || loading}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to add context from other components (example)
// You would call this from the PDF viewer or question list etc.
// TODO: Implement a proper state management solution for context sharing
export const addContextItem = (item: ContextItem) => {
    // This is a simplified example. In a real app, you'd likely use a state management solution
    // or a context provider to manage and update the context state in AIChat.
    console.log("Attempting to add context:", item);
    // A broadcast channel or event emitter could be used here
    // new BroadcastChannel('medmaster-context').postMessage(item);
    // Or pass down an addItemToContext function from a parent/context provider
};