// Define interfaces for the MedMaster Stage-1 schema

// Represents the structure of a user profile in the database.
// Linked to Supabase Auth via the 'id' field.
// is_professor flag determines access to admin/professor-only features.
// theme stores user's preferred UI theme.
/**
 * Interface for a user profile.
 */
export interface Profile {
  id: string; // Supabase auth user ID
  username: string | null;
  theme: 'light' | 'dark' | 'system';
  is_professor: boolean;
  created_at: string; // ISO timestamp
}

// Example usage:
// const userProfile: Profile = {
//   id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
//   username: 'Dr. Smith',
//   theme: 'dark',
//   is_professor: true,
//   created_at: '2023-10-27T10:00:00Z',
// };

/**
 * Interface for a medical question stored in the database.
 * Used for daily quizzes, weekly quizzes, and potentially AI context.
 * options and details are stored as JSONB in the database.
 * Interface for a medical question, typically used for quizzes.
 */
export interface Question {
  id: string;
  subject: string;
  question_text: string;
  options: { [key: string]: string }; // e.g., { A: 'Option A', B: 'Option B' }
  correct_option: string; // e.g., 'A'
  explanation: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string; // Profile ID
}

// Example usage:
// const sampleQuestion: Question = {
//   id: '123e4567-e89b-12d3-a456-426614174000',
//   subject: 'Anatomy',
//   question_text: 'Which bone is the longest in the human body?',
//   options: { A: 'Tibia', B: 'Femur', C: 'Humerus', D: 'Fibula' },
//   correct_option: 'B',
//   explanation: 'The femur is the longest bone.',
//   tags: ['bones', 'skeletal system'],
//   created_at: '2023-10-27T10:05:00Z',
//   updated_at: '2023-10-27T10:05:00Z',
//   created_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
// };

// Represents a user's performance and answers for a specific quiz attempt.
/**
 * Interface for a user's result on a specific quiz attempt.
 */
export interface QuizResult {
  id: string;
  user_id: string; // Profile ID
  quiz_date: string; // ISO date string (for daily quiz) or quiz identifier
  score: number; // Number of correct answers
  total_questions: number;
  details: any; // JSONB storing per-question details (e.g., question_id, user_answer, correct)
  completed_at: string; // ISO timestamp
}

// Example usage:
// const userQuizResult: QuizResult = {
//   id: '98765432-10fe-dcba-9876-543210abcdef',
//   user_id: 'fedcba98-7654-3210-fedc-ba9876543210',
//   quiz_date: '2023-10-27',
//   score: 4,
//   total_questions: 5,
//   details: {
//     questions: [
//       { id: 'q1', user_answer: 'A', correct: false },
//       { id: 'q2', user_answer: 'B', correct: true },
//       // ...
//     ],
//   },
//   completed_at: '2023-10-27T15:30:00Z',
// };


// Represents a single review event for a Spaced Repetition System (SRS) card.
// Stores the outcome of the review (quality) and the computed next review date and algorithm parameters.
/**
 * Interface for a Spaced Repetition System (SRS) card review record.
 */
export interface SRSReview {
  id: string;
  user_id: string; // Profile ID
  card_id: string; // Reference to srs_cards
  quality: number; // 0-5 rating
  repetition: number; // How many times reviewed successfully
  interval: number; // Days until next review
  efactor: number; // Easiness factor
  reviewed_at: string; // ISO timestamp of this review
  next_review_at: string; // ISO timestamp of next scheduled review
}

// Example usage:
// const reviewRecord: SRSReview = {
//   id: 'abcdef12-3456-7890-abcd-ef1234567890',
//   user_id: 'fedcba98-7654-3210-fedc-ba9876543210',
//   card_id: 'card-abc',
//   quality: 5,
//   repetition: 3,
//   interval: 8,
//   efactor: 2.5,
//   reviewed_at: '2023-10-20T10:00:00Z',
//   next_review_at: '2023-10-28T10:00:00Z',
// };

/**
 * Interface for logging interactions with the AI assistant.
 * Helps in monitoring usage, debugging, and potentially retraining or analysis.
 * Includes caching status and token usage for cost tracking.
 * Interface for an interaction with the AI assistant.
 */
export interface AIInteraction {
  id: string;
  user_id: string; // Profile ID (or null if anonymous)
  prompt: string;
  response: string;
  context: any | null; // JSONB storing context details (e.g., { type: 'question', id: '...' })
  tokens_used: number | null;
  cached: boolean;
  model: string | null; // e.g., 'gpt-4'
  created_at: string; // ISO timestamp
}

// Example usage:
// const aiChat: AIInteraction = {
//   id: 'ai-interaction-123',
//   user_id: 'fedcba98-7654-3210-fedc-ba9876543210',
//   prompt: 'Explain glycolysis.',
//   response: 'Glycolysis is...',
//   context: null,
//   tokens_used: 150,
//   cached: false,
//   model: 'gpt-3.5-turbo',
//   created_at: '2023-10-27T16:00:00Z',
// };

/**
 * Interface for an annotation made by a user on a PDF.
 * Stores the location, excerpt, color, and associated PDF ID.
 * 'rect' is a JSONB field for flexibility in storing coordinates.
 * Interface for a PDF annotation.
 */
export interface Annotation {
  id: string;
  user_id: string; // Profile ID
  pdf_id: string; // Identifier for the PDF
  page: number;
  rect: any; // JSONB storing rectangle coordinates {x1,y1,x2,y2}
  text_excerpt: string | null; // Text highlighted or associated with the annotation
  color: string; // e.g., '#FFFF00' for yellow
  created_at: string;
  updated_at: string;
}

// Example usage:
// const pdfHighlight: Annotation = {
//   id: 'annotation-abc',
//   user_id: 'fedcba98-7654-3210-fedc-ba9876543210',
//   pdf_id: 'anatomy-chapter1',
//   page: 5,
//   rect: { x1: 100, y1: 200, x2: 300, y2: 220 },
//   text_excerpt: '...',
//   color: '#FFFF00',
//   created_at: '2023-10-27T17:00:00Z',
//   updated_at: '2023-10-27T17:00:00Z',
// };

/**
 * Interface for user-created personal study notes.
 * Content is stored as JSONB to support rich text formatting.
 * Associated with a specific user profile.
 * Interface for user-created notes.
 */
export interface Note {
  id: string;
  user_id: string; // Profile ID
  title: string | null;
  content: any; // JSONB storing rich text content (e.g., TipTap/Quill JSON)
  created_at: string;
  updated_at: string;
}

// Example usage:
// const userNote: Note = {
//   id: 'note-xyz',
//   user_id: 'fedcba98-7654-3210-fedc-ba9876543210',
//   title: 'Glycolysis Steps',
//   content: { type: 'doc', content: [...] }, // Sample content
//   created_at: '2023-10-27T17:30:00Z',
//   updated_at: '2023-10-27T17:30:00Z',
// };

/**
 * Interface for metadata and file information about a 3D anatomical model.
 * Stores URL to the 3D file (GLTF/GLB) and optional metadata for rendering/interaction.
 * Uploaded by a user (likely a professor).
 * Interface for metadata about a 3D model.
 */
export interface Model3D {
  id: string;
  name: string;
  file_url: string; // URL to the GLTF/GLB file
  thumbnail_url: string | null;
  metadata: any | null; // JSONB for additional model info (e.g., layer structure, regions)
  created_at: string;
  uploaded_by: string; // Profile ID
}

// Example usage:
// const anatomyModel: Model3D = {
//   id: 'model-heart',
//   name: 'Human Heart',
//   file_url: 'https://storage.example.com/models/heart.glb',
//   thumbnail_url: 'https://storage.example.com/models/heart_thumb.png',
//   metadata: { regions: ['atria', 'ventricles'] },
//   created_at: '2023-10-27T18:00:00Z',
//   uploaded_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
// };

/**
 * Interface representing a study group or class batch.
 * Created by a professor and can be joined by students using a join code.
 * Contains information about the batch and its creator.
 * Interface for a batch (group) of students/professors.
 */
export interface Batch {
  id: string;
  name: string;
  created_by: string; // Profile ID (professor)
  join_code: string | null; // Code for joining the batch
  created_at: string;
}

// Example usage:
// const medicalBatch: Batch = {
//   id: 'batch-fall-2024',
//   name: 'Fall 2024 Medical Students',
//   created_by: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
//   join_code: 'MED24FALL',
//   created_at: '2023-09-01T09:00:00Z',
// };

// Note: batch_members and batch_posts tables would typically be joined or
// represented through relationships rather than top-level interfaces if
// they are purely join/content tables. For simplicity in this list,
// we define interfaces that could represent fetched data.

/**
 * Interface representing the relationship between a user and a batch,
 * indicating membership.
 * Interface for a batch member (relationship).
 */
export interface BatchMember {
  batch_id: string;
  user_id: string; // Profile ID
  joined_at: string;
}

/**
 * Interface representing a message or announcement posted within a batch.
 * Can be pinned by the creator (professor).
 * Interface for a post within a batch.
 */
export interface BatchPost {
  id: string;
  batch_id: string;
  created_by: string; // Profile ID
  content: string; // Markdown or simple text
  created_at: string;
  is_pinned: boolean;
}