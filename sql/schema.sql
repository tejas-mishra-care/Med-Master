-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    username text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    email text UNIQUE,
    role text DEFAULT 'student' CHECK (role IN ('student', 'professor')),
    theme text DEFAULT 'system'
);

COMMENT ON TABLE profiles IS 'User profiles for MedMaster.';
COMMENT ON COLUMN profiles.role IS 'User role: student or professor.';
COMMENT ON COLUMN profiles.theme IS 'UI theme preference: system, light, or dark.';

-- Example query to test profiles table:
-- SELECT * FROM profiles LIMIT 10;

-- Questions table
CREATE TABLE questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    subject text NOT NULL,
    tags text[],
    question_text text NOT NULL,
    options jsonb NOT NULL, -- Example: {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}
    correct_option text NOT NULL,
    explanation text,
    difficulty integer CHECK (difficulty >= 1 AND difficulty <= 5),
    created_by uuid REFERENCES profiles(id)
);

COMMENT ON TABLE questions IS 'Medical knowledge questions.';
COMMENT ON COLUMN questions.options IS 'JSONB object with answer options.';
COMMENT ON COLUMN questions.correct_option IS 'Key of the correct option (e.g., "A").';

-- Example query to test questions table:
-- SELECT * FROM questions WHERE subject = 'Anatomy' LIMIT 5;

-- Daily Quiz table
CREATE TABLE daily_quiz (
    date date PRIMARY KEY,
    question_ids uuid[] NOT NULL -- Array of question IDs for the day's quiz
);

COMMENT ON TABLE daily_quiz IS 'Daily quiz questions.';

-- Example query to test daily_quiz table:
-- SELECT * FROM daily_quiz WHERE date = CURRENT_DATE;

-- Quiz Results table
CREATE TABLE quiz_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    quiz_date date REFERENCES daily_quiz(date), -- Link to daily quiz date
    quiz_type text DEFAULT 'daily', -- 'daily', 'weekly' etc.
    score integer NOT NULL,
    total_questions integer NOT NULL,
    details jsonb, -- JSONB with per-question results, e.g., {question_id: {answered: "A", correct: true}}
    UNIQUE (user_id, quiz_date) -- Ensure only one daily quiz result per user per day
);

COMMENT ON TABLE quiz_results IS 'Results of quizzes taken by users.';
COMMENT ON COLUMN quiz_results.details IS 'Detailed results for each question in the quiz.';

-- Example query to test quiz_results table:
-- SELECT * FROM quiz_results WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 5;

-- SRS Cards table (Spaced Repetition System)
CREATE TABLE srs_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    subject text NOT NULL,
    tags text[],
    front_text text NOT NULL,
    back_text text NOT NULL,
    image_url text,
    created_by uuid REFERENCES profiles(id)
);

COMMENT ON TABLE srs_cards IS 'Spaced Repetition System flashcards.';

-- Example query to test srs_cards table:
-- SELECT * FROM srs_cards WHERE subject = 'Biochemistry' LIMIT 5;

-- SRS Reviews table
CREATE TABLE srs_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    card_id uuid REFERENCES srs_cards(id) NOT NULL,
    quality integer NOT NULL CHECK (quality >= 0 AND quality <= 5),
    efactor float DEFAULT 2.5,
    interval integer DEFAULT 0, -- in days
    repetition integer DEFAULT 0,
    next_review_date date NOT NULL,
    UNIQUE (user_id, card_id) -- Ensure only one review record per user per card
);

COMMENT ON TABLE srs_reviews IS 'User review data for SRS cards.';

-- Example query to test srs_reviews table:
-- SELECT * FROM srs_reviews WHERE user_id = 'your-user-id' ORDER BY next_review_date ASC LIMIT 10;

-- AI Interactions table
CREATE TABLE ai_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id), -- Allow NULL for anonymous users
    prompt text NOT NULL,
    response text NOT NULL,
    model text,
    tokens_used integer,
    cached boolean DEFAULT false,
    context_ids uuid[] -- IDs of questions, SRS cards, etc. used as context
);

COMMENT ON TABLE ai_interactions IS 'Records of interactions with AI assistant.';
COMMENT ON COLUMN ai_interactions.context_ids IS 'IDs of database items used as context for the AI query.';

-- Example query to test ai_interactions table:
-- SELECT * FROM ai_interactions WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 10;

-- Annotations table (for PDFs)
CREATE TABLE annotations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    pdf_id uuid NOT NULL, -- Reference to a PDF identifier (could be a URL or internal ID)
    page integer NOT NULL,
    rect jsonb, -- Coordinates of the annotation bounding box/shape
    text_excerpt text,
    color text, -- Hex code or predefined color name
    annotation_type text DEFAULT 'highlight' CHECK (annotation_type IN ('highlight', 'drawing', 'note'))
);

COMMENT ON TABLE annotations IS 'User annotations on PDF documents.';
COMMENT ON COLUMN annotations.pdf_id IS 'Identifier for the PDF document.';
COMMENT ON COLUMN annotations.rect IS 'JSONB containing annotation shape coordinates.';

-- Example query to test annotations table:
-- SELECT * FROM annotations WHERE user_id = 'your-user-id' AND pdf_id = 'some-pdf-id' ORDER BY page ASC;

-- Notes table
CREATE TABLE notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id) NOT NULL,
    title text,
    content jsonb NOT NULL -- Rich text content (e.g., TipTap/Quill JSON)
);

COMMENT ON TABLE notes IS 'User personal notes.';
COMMENT ON COLUMN notes.content IS 'Rich text content of the note.';

-- Example query to test notes table:
-- SELECT * FROM notes WHERE user_id = 'your-user-id' ORDER BY updated_at DESC LIMIT 5;

-- 3D Models metadata table
CREATE TABLE models_3d (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    name text NOT NULL,
    file_url text NOT NULL, -- URL to the GLTF/GLB file
    thumbnail_url text,
    regions text[], -- e.g., ['head', 'torso']
    description text,
    uploaded_by uuid REFERENCES profiles(id)
);

COMMENT ON TABLE models_3d IS 'Metadata for 3D anatomical models.';
COMMENT ON COLUMN models_3d.file_url IS 'URL to the 3D model file (GLTF/GLB).';

-- Example query to test models_3d table:
-- SELECT * FROM models_3d WHERE 'head' = ANY(regions) LIMIT 5;

-- Batches table (for groups/classes)
CREATE TABLE batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    name text NOT NULL,
    description text,
    created_by uuid REFERENCES profiles(id) NOT NULL,
    join_code text UNIQUE -- Code for students to join the batch
);

COMMENT ON TABLE batches IS 'Batches or groups for collaborative study.';
COMMENT ON COLUMN batches.join_code IS 'Unique code for joining the batch.';

-- Example query to test batches table:
-- SELECT * FROM batches WHERE created_by = 'professor-user-id' LIMIT 5;

-- Batch Members table
CREATE TABLE batch_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    batch_id uuid REFERENCES batches(id) NOT NULL,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    role text DEFAULT 'member' CHECK (role IN ('member', 'admin')), -- admin = professor who created/manages
    UNIQUE (batch_id, user_id) -- Ensure a user can only be a member of a batch once
);

COMMENT ON TABLE batch_members IS 'Members of batches.';
COMMENT ON COLUMN batch_members.role IS 'Role within the batch.';

-- Example query to test batch_members table:
-- SELECT p.username, bm.role FROM batch_members bm JOIN profiles p ON bm.user_id = p.id WHERE bm.batch_id = 'some-batch-id';

-- Batch Posts table (Announcements, resources within a batch)
CREATE TABLE batch_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    batch_id uuid REFERENCES batches(id) NOT NULL,
    created_by uuid REFERENCES profiles(id) NOT NULL, -- Should be a batch admin/professor
    title text,
    content text NOT NULL,
    pinned boolean DEFAULT false, -- Highlight important posts
    file_url text -- Optional attached file
);

COMMENT ON TABLE batch_posts IS 'Posts within batches.';

-- Example query to test batch_posts table:
-- SELECT * FROM batch_posts WHERE batch_id = 'some-batch-id' ORDER BY pinned DESC, created_at DESC LIMIT 10;

-- Import Audit table
CREATE TABLE import_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id), -- Who initiated the import
    file_name text,
    import_type text, -- e.g., 'questions', 'srs_cards'
    status text NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    details jsonb -- JSONB with summary of imported/failed rows, errors etc.
);

COMMENT ON TABLE import_audit IS 'Logs for data import operations.';
COMMENT ON COLUMN import_audit.details IS 'Summary and error details of the import process.';

-- Example query to test import_audit table:
-- SELECT * FROM import_audit ORDER BY created_at DESC LIMIT 10;

-- Indexes for performance
CREATE INDEX gin_questions_tags ON questions USING GIN (tags);
CREATE INDEX idx_questions_subject ON questions (subject);
CREATE INDEX idx_srs_next_review ON srs_reviews (next_review_date);
-- This index on annotations.pdf_id combined with user_id is good for fetching user's annotations for a specific PDF
CREATE INDEX idx_annotations_pdf_user ON annotations (pdf_id, user_id);

-- Row Level Security (RLS) Policy Comments for Supabase
-- These are examples. You will need to create the actual RLS policies in the Supabase dashboard.

-- Example RLS for profiles table:
-- Policy Name: "Enable read access for all users"
-- Target Roles: public
-- USING: (true) -- Anyone can read profiles (consider restricting sensitive fields)
-- Policy Name: "Enable update for owners"
-- Target Roles: authenticated
-- USING: (auth.uid() = id) -- Users can update their own profile

-- Example RLS for quiz_results table:
-- Policy Name: "Enable read access for owners"
-- Target Roles: authenticated
-- USING: (auth.uid() = user_id) -- Users can read their own quiz results
-- Policy Name: "Enable insert for authenticated users"
-- Target Roles: authenticated
-- WITH CHECK: (auth.uid() = user_id) -- Ensure user_id matches authenticated user on insert

-- Example RLS for srs_reviews table:
-- Policy Name: "Enable read access for owners"
-- Target Roles: authenticated
-- USING: (auth.uid() = user_id) -- Users can read their own review progress
-- Policy Name: "Enable upsert for owners"
-- Target Roles: authenticated
-- WITH CHECK: (auth.uid() = user_id) -- Ensure user_id matches authenticated user on upsert

-- Example RLS for annotations table:
-- Policy Name: "Enable read access for owners"
-- Target Roles: authenticated
-- USING: (auth.uid() = user_id) -- Users can read their own annotations
-- Policy Name: "Enable insert for owners"
-- Target Roles: authenticated
-- WITH CHECK: (auth.uid() = user_id) -- Ensure user_id matches authenticated user on insert
-- Policy Name: "Enable delete for owners"
-- Target Roles: authenticated
-- USING: (auth.uid() = user_id) -- Users can delete their own annotations

-- Note on Enabling RLS:
-- In the Supabase dashboard, navigate to the 'Authentication' section, then 'Policies'.
-- Select the table you want to enable RLS for (e.g., 'profiles', 'quiz_results', 'srs_reviews', 'annotations', etc.).
-- Toggle the 'Enable RLS' switch.
-- Then, create new policies for SELECT, INSERT, UPDATE, DELETE operations based on the examples above and your specific access control requirements.
-- Remember that by default, with RLS enabled and no policies defined, no one (not even the table owner) can access data.
-- Ensure you have a policy that allows the `service_role` key to bypass RLS for server-side operations (e.g., cron jobs, data imports). Supabase often includes a default policy for this, but verify.