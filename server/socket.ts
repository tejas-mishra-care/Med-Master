// server/socket.ts
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'url';
// Using uuid for unique message IDs
import { v4 as uuidv4 } from 'uuid';

// Placeholder for file upload logic (replace with actual storage implementation)
const uploadFileToStorage = async (file: Buffer, filename: string): Promise<string> => {
  // In a real application, upload to S3, Supabase Storage, etc.
  console.log(`Placeholder: Uploading file ${filename} (${file.length} bytes)`);
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return a dummy URL
  return `https://your-storage-url.com/uploads/${filename}`;
};

// --- Message Persistence (Optional) ---
// Placeholder for message persistence (uncomment and implement if needed)
// import { supabase } from '../lib/supabaseClient';
// const saveMessageToDB = async (message: ChatMessage) => {
//   const { data, error } = await supabase.from('batch_chat').insert([message]);
//   if (error) console.error('Error saving message:', error);
// };
// const deleteMessageFromDB = async (messageId: string) => {
//   const { error } = await supabase.from('batch_chat').delete().match({ id: messageId });
//   // Consider adding RLS policy to allow only professor to delete
//   if (error) console.error('Error deleting message:', error);
// };

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number; // in bytes
  // Add other message types like 'image', 'audio', 'system' etc.
}

// Events from server to client
interface ServerToClientEvents {
  message: (msg: ChatMessage) => void;
  messageDeleted: (messageId: string) => void;
  // Add other events like user joins/leaves, typing indicators etc.
}

// Events from client to server
interface ClientToServerEvents {
  joinBatch: (batchId: string) => void;
  sendMessage: (msg: { batchId: string; content: string; userId: string; username: string; }) => void;
  sendFile: (data: { batchId: string; file: Buffer; fileName: string; userId: string; username: string; }) => void;
  deleteMessage: (data: { batchId: string; messageId: string; userId: string }) => void; // Requires professor role check
  // Add events like 'typing', 'readMessage' etc.
}

// Internal server events (if needed)
interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  username: string;
  batchId: string;
}

// --- Socket.io Server Setup (Alternative approach for standalone Node.js server) ---
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: '*', // Restrict this in production to your frontend URL(s)
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 10e6, // 10MB
});

// Socket.io connection handler for the standalone server approach
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinBatch', (batchId: string) => {
    // Basic join logic - in a real app, verify user is a member of this batch
    // Joining a room specific to the batch ID
    socket.join(`batch_${batchId}`);
    socket.data.batchId = batchId; // Store batchId in socket data
    console.log(`User ${socket.id} joined batch ${batchId}`);
    // TODO: Emit 'userJoined' event to batch room
  });

  socket.on('sendMessage', async (msg) => {
    // Handle incoming text messages
    // In a real app, verify msg.userId matches authenticated user
    const message: ChatMessage = {
      id: uuidv4(),
      userId: msg.userId,
      username: msg.username,
      content: msg.content,
      timestamp: Date.now(),
      type: 'text',
    };

    // Broadcast the message to all clients in the batch room
    // await saveMessageToDB(message); // Uncomment to persist
    io.to(`batch_${msg.batchId}`).emit('message', message);
    console.log(`Message sent to batch_${msg.batchId}: ${msg.content}`);
  });

  socket.on('sendFile', async (data) => {
    // In a real app, verify data.userId matches authenticated user and file size
    // Handle incoming file data
    if (data.file.length > 10 * 1024 * 1024) {
      console.warn(`File size exceeds limit: ${data.fileName}`);
      // TODO: Emit an error back to the sender
      return;
    }

    try {
      const fileUrl = await uploadFileToStorage(data.file, data.fileName);
      // Create a message object for the file
      const message: ChatMessage = {
        id: uuidv4(),
        userId: data.userId,
        username: data.username,
        content: `${data.username} shared a file: ${data.fileName}`, // Optional: simple text message + link
        timestamp: Date.now(),
        type: 'file',
        fileUrl: fileUrl,
        fileName: data.fileName,
        fileSize: data.file.length,
      };

      // Broadcast the file message to all clients in the batch room
      // await saveMessageToDB(message); // Uncomment to persist
      io.to(`batch_${data.batchId}`).emit('message', message);
      console.log(`File sent to batch_${data.batchId}: ${data.fileName}`);

    } catch (error) {
      console.error('Error handling file upload:', error);
      // TODO: Emit an error back to the sender
    }
  });

  socket.on('deleteMessage', async (data) => {
    // Handle message deletion requests
    // **Important:** Implement robust professor role check here
    const isProfessor = true; // Placeholder: replace with actual check

    if (isProfessor) {
      console.log(`Professor ${data.userId} attempting to delete message ${data.messageId} in batch ${data.batchId}`);
      // Emit 'messageDeleted' event to all clients in the batch room
      // await deleteMessageFromDB(data.messageId); // Uncomment to persist
      io.to(`batch_${data.batchId}`).emit('messageDeleted', data.messageId);
      console.log(`Message ${data.messageId} deleted in batch ${data.batchId}`);
    } else {
      console.warn(`User ${data.userId} attempted to delete message ${data.messageId} without professor role.`);
      // TODO: Emit an unauthorized error back to the user
    }
  });


  socket.on('disconnect', () => {
    // Handle client disconnection
    console.log('user disconnected');
    // TODO: Emit 'userLeft' event from batch room
  });
});

// This is a simplified integration for Next.js API routes.
// You might need a more robust setup depending on your deployment strategy.
// For serverless, you might use a different approach like AWS API Gateway + Lambda + WebSocket API.
// For a Node.js server, you would typically attach Socket.io to the main HTTP server.
// This example assumes a setup where a Next.js API route can manage the Socket.io server.

// --- Socket.io Integration with Next.js API Route ---
// This handler initializes or uses an existing Socket.io server attached to the Next.js server.
const socketHandler = (req: NextApiRequest, res: NextApiResponse) => {
    // @ts-ignore
    if (!res.socket.server.io) {
        console.log('New Socket.io server...');
        // @ts-ignore
        const io = new Server(res.socket.server, {
            cors: {
                origin: '*', // Restrict this in production
                methods: ['GET', 'POST'],
            },
            maxHttpBufferSize: 10e6, // 10MB
        });

        io.on('connection', (socket) => {
             // Connection handler for the Next.js integrated server
             console.log('a user connected (from handler)');
             // Implement your event handlers here, similar to the standalone server approach
             socket.on('joinBatch', (batchId: string) => {
                 socket.join(`batch_${batchId}`);
                 socket.data.batchId = batchId;
                 // Log the join event
                 console.log(`User ${socket.id} joined batch ${batchId} (from handler)`);
             });

             socket.on('sendMessage', async (msg) => {
                const message: ChatMessage = {
                  id: uuidv4(),
                  userId: msg.userId,
                  username: msg.username,
                  content: msg.content,
                  timestamp: Date.now(),
                  type: 'text',
                };
                 // Emit the message to the batch room
                 io.to(`batch_${msg.batchId}`).emit('message', message);
                 console.log(`Message sent to batch_${msg.batchId} (from handler): ${msg.content}`);
             });

             socket.on('sendFile', async (data) => {
               if (data.file.length > 10 * 1024 * 1024) {
                 console.warn(`File size exceeds limit (from handler): ${data.fileName}`);
                 return;
               }
               try {
                 // Upload the file and create a file message
                 const fileUrl = await uploadFileToStorage(data.file, data.fileName);
                 const message: ChatMessage = {
                   id: uuidv4(),
                   userId: data.userId,
                   username: data.username,
                   content: `${data.username} shared a file: ${data.fileName}`,
                   timestamp: Date.now(),
                   type: 'file',
                   fileUrl: fileUrl,
                   fileName: data.fileName,
                   fileSize: data.file.length,
                 };
                 // Emit the file message to the batch room
                 io.to(`batch_${data.batchId}`).emit('message', message);
                 console.log(`File sent to batch_${data.batchId} (from handler): ${data.fileName}`);
               } catch (error) {
                 console.error('Error handling file upload (from handler):', error);
                 // TODO: Emit an error back to the sender
               }
             });

             socket.on('deleteMessage', async (data) => {
               const isProfessor = true; // Placeholder
               if (isProfessor) {
                 io.to(`batch_${data.batchId}`).emit('messageDeleted', data.messageId);
                 // Log the deletion event
                 console.log(`Message ${data.messageId} deleted in batch ${data.batchId} (from handler)`);
               } else {
                 console.warn(`User ${data.userId} attempted to delete message ${data.messageId} without professor role (from handler).`);
                 // TODO: Emit an unauthorized error back to the user
               }
             });


             socket.on('disconnect', () => {
                 // Handle client disconnection
                 console.log('user disconnected (from handler)');
             });
        });

        // @ts-ignore
        res.socket.server.io = io;
    } else {
        // If Socket.io is already running, just log
        console.log('Socket.io server already running');
    }
    res.end();
};

export default socketHandler;

// To use this in Next.js:
// 1. Create a file like `pages/api/socket.ts` or `app/api/socket/route.ts`
// 2. In that file, import and export this handler:
//    `import socketHandler from '../../server/socket'; export default socketHandler;`
// 3. Start your Next.js app: `pnpm dev` or `pnpm start`
// 4. Your Socket.io server should be accessible at `/api/socket`
// 5. On the client side, connect to `ws://localhost:3000/api/socket` (or your deployed URL)
