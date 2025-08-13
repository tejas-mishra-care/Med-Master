'use client';

import { useState, useRef, useEffect } from 'react';
import AIChat from '@/components/AIChat'; // Assuming you'll create this component

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);

  // Function to send a message
  const sendMessage = async (message) => {
    // Add user message to state
    setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'user', timestamp: new Date() }]);

    // TODO: Call your AI query API here
    // Replace with actual API call and error handling
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: message, userId: 'current_user_id' /* Replace with actual user ID */ }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Add AI response to state
      setMessages((prevMessages) => [...prevMessages, { text: data.answer, sender: 'ai', timestamp: new Date(), sources: data.sources, disclaimer: data.disclaimer }]);

    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message to state
      setMessages((prevMessages) => [...prevMessages, { text: 'Sorry, I could not process your request.', sender: 'ai', timestamp: new Date(), isError: true }]);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">AI Medical Assistant</h1>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 border rounded-md bg-background">
        <AIChat messages={messages} />
      </div>
      <div className="mt-4">
        {/* Input and Send Button - This will likely be part of the AIChat component or a separate input component */}
        {/* For now, a simple placeholder: */}
        {/* <input type="text" placeholder="Ask me anything..." className="w-full p-2 border rounded-md" /> */}
        {/* <button className="mt-2 p-2 bg-primary text-white rounded-md">Send</button> */}
      </div>
    </div>
  );
}