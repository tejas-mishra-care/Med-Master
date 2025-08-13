# MedMaster Stage 1 Architecture

This document provides a high-level overview of the MedMaster Stage 1 architecture.

<!-- This ASCII diagram illustrates the main components and data flow in the MedMaster Stage 1 architecture. -->
```
ascii
+-----------------+     +-----------------------+     +-------------------+
| User Browser    |     | Next.js Application   |     | Supabase Backend  |
| (Web & Mobile)  |     | (Frontend + API Rts)  |     | (DB, Auth, Storage|
+-----------------+     +-----------------------+     +-------------------+
        |                       |           |               |
        | REST APIs (fetch)     | Socket.io | PostgreSQL DB |
        |---------------------->|<--------->| REST / RPCs   |
        |                       |           |--------------->
        |                       |           | Storage (S3)  |
        |                       |           |--------------->
        |                       | API Rts   |
        |                       |-----------|
        |                       | AI Helper |
        |                       |-----------|
        |                       |             +-----------------+
        |                       | OpenAI API  | OpenAI          |
        |                       |------------>| (LLM)           |
        |                       |             +-----------------+
        |                       | External    | Dictionary API  |
        |                       | Dictionary  | (Optional)      |
        |                       |------------>|                 |
        |                       |             +-----------------+
        |                       | Scheduler   | Background Jobs |
        |                       |------------>| (e.g., Cron)    |
        |                       |             +-----------------+
        |                       | Offline Sync| IndexedDB       |
        |                       |------------>|                 |
        |                       |             +-----------------+
        |                       | 3D Model    | 3D Model Files  |
        |                       | Serving     | (GLTF/GLB)      |
        |                       |------------>|                 |
        |                       |             +-----------------+
        |                       | PDF.js/     | PDF Files       |
        |                       | Fabric.js   |                 |
        |                       |------------>|                 |
        |                       |             +-----------------+

```
**Key Components:**

*   **User Browser:** The client-side application running in the user's web browser or as a mobile app. It handles the user interface, interactions, and local state management.
*   **Next.js Application:** A single Next.js application serving both the frontend (React components) and backend API routes.
    *   **Frontend:** Renders UI components, handles user input, fetches data from API routes, and manages client-side state.
    *   **API Routes:** Serverless functions handling backend logic, interacting with Supabase, OpenAI, and other external services.
*   **Supabase Backend:** A powerful backend-as-a-service providing:
    *   **PostgreSQL Database:** Stores all application data (profiles, questions, quizzes, SRS data, etc.). RLS (Row Level Security) is crucial for data protection.
    *   **Authentication:** Handles user registration, login, and session management (email/password).
    *   **Storage (S3):** Stores assets like PDF files and 3D models.
*   **OpenAI:** Provides the Large Language Model (LLM) for AI-powered features like question answering and content generation. Interacted with via the `/api/ai/query` route.
*   **Socket.io:** Used for real-time communication, specifically for the batch chat feature.
*   **External Dictionary API:** An optional service for word definitions (fallback to local glossary).
*   **Background Jobs (Cron):** Scheduled tasks, like the daily quiz generation, potentially run via external services or serverless functions.
*   **IndexedDB:** Client-side database used for offline storage and synchronization, particularly for notes and annotations.
*   **3D Model Serving:** API routes and possibly Supabase Storage for serving 3D model files.
*   **PDF.js/Fabric.js:** Client-side libraries used within the `PDFViewer` component for rendering PDFs and enabling annotations.

**Data Flow:**

*   User interactions trigger API calls from the frontend to Next.js API routes.
*   API routes interact with the Supabase database (fetching, inserting, updating data).
*   API routes communicate with external services like OpenAI and the Dictionary API.
*   Socket.io handles real-time message exchange between users in batches.
*   Client-side JavaScript handles offline storage and synchronization with the backend when online.
*   Static assets like PDF and 3D model files are served from storage, potentially proxied through API routes for security.

**Security Considerations:**

*   **Row Level Security (RLS) in Supabase:** Essential for ensuring users can only access and modify their own data (e.g., quiz results, SRS reviews, notes, annotations) and permitted batch content.
*   **API Authentication & Authorization:** API routes must verify user identity and permissions (e.g., only professors can create batches or SRS cards).
*   **Service Role Key Security:** The Supabase Service Role Key must be kept strictly confidential and only used in secure server environments (like environment variables in Vercel).
*   **Data Truncation:** Limiting context size sent to the LLM for cost and security.
*   **Disclaimer Text:** Always present when AI provides medical information.
*   **Mobile Screenshot Prevention:** Notes on implementing platform-specific flags (`FLAG_SECURE`) to prevent capturing sensitive medical information.

This architecture provides a foundation for the Stage 1 features, with clear separation of concerns between the client, Next.js backend, and Supabase. Future stages can expand upon this by integrating more external services and enhancing real-time and offline capabilities.