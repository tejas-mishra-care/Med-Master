// components/ChatRoom.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

// Interface for the message structure

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  type: 'text' | 'attachment';
  // attachmentUrl?: string; // Uncomment if handling attachments
}

// Props for the ChatRoom component

interface ChatRoomProps {
  batchId: string;
  userId: string; // Current user's ID
  username: string; // Current user's username
}

const ChatRoom: React.FC<ChatRoomProps> = ({ batchId, userId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to handle socket connection and event listeners
  useEffect(() => {
    // Connect to the Socket.io server
    const socket = io(); // Assumes Socket.io server is on the same origin

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
      // Join the specific batch room
      socket.emit('joinRoom', batchId);
    });

    // Listen for incoming messages
    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });

    // Handle errors
    socket.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err);
      // Optionally show an error message to the user
    });

    socketRef.current = socket;

    // Clean up the socket connection on component unmount
    // Clean up the socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', batchId);
        socketRef.current.disconnect();
      }
    };
  }, [batchId]);

  useEffect(() => {
    // Scroll to the bottom of the messages list
    // Scroll to the bottom of the messages list whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to send a text message
  const sendMessage = () => {
    if (inputMessage.trim() && socketRef.current) {
      const newMessage: Message = {
        id: Date.now().toString(), // Simple temporary ID
        userId,
        username,
        content: inputMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      socketRef.current.emit('sendMessage', { room: batchId, message: newMessage });
      setInputMessage('');
    }
  };

  // Handle sending message on Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Function to handle attachment upload (placeholder)
  // const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     // Implement file upload logic (e.g., to Supabase Storage)
  //     // After successful upload, emit a message with type 'attachment' and the file URL
  //     console.log('Uploading file:', file.name);
  //     // Example:
  //     // uploadFile(file).then(url => {
  //     //   const newAttachmentMessage: Message = {
  //     //     id: Date.now().toString(),
  //     //     userId,
  //     //     username,
  //     //     content: file.name, // Or a description
  //     //     timestamp: new Date().toISOString(),
  //     //     type: 'attachment',
  //     //     attachmentUrl: url,
  //     //   };
  //     //   socketRef.current?.emit('sendMessage', { room: batchId, message: newAttachmentMessage });
  //     // });
  //   }
  // };

  return (
    // Main chat container with border and rounded corners
    <div className="flex flex-col h-full border rounded-md">
      {/* Message display area, scrollable */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.userId === userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              <div className="font-bold text-sm">{msg.username}</div>
              {msg.type === 'text' && <p>{msg.content}</p>}
              {/* {msg.type === 'attachment' && ( // Uncomment for attachments
                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {msg.content}
                </a>
              )} */}
              <div className="text-xs text-right opacity-75 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4 flex items-center">
        {/* Input area for typing messages */}
        {/* Attachment input (uncomment and style as needed) */}
        {/* <input type="file" onChange={handleAttachmentUpload} className="hidden" id="attachment-upload" />
        <label htmlFor="attachment-upload" className="cursor-pointer p-2 rounded-full hover:bg-gray-200 mr-2">
          📎
        </label> */}
        {/* Text input for typing messages */}
        <input
          id="chat-message"
          name="chat-message"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          aria-label="Type your message"
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {/* Send button */}
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;