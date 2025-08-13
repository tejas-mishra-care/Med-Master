-- seed.sql

-- This file contains sample data to populate the database for development and testing.
-- It includes data for profiles, questions, daily quizzes, batches, and 3D models.

-- Note: Replace placeholder UUIDs with actual user UUIDs from your Supabase auth.users table
-- You can find these in the Supabase dashboard -> Authentication -> Users

-- Profiles
INSERT INTO profiles (id, username, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'student_user', 'student'),
    ('00000000-0000-0000-0000-000000000002', 'professor_user', 'professor'); -- Example professor profile

-- Questions (Sample MCQs)
-- Note: These are simple text questions for UI testing. Images are not included in this seed.
-- The 'options' column is a JSONB type storing key-value pairs for multiple-choice options (A, B, C, D).
-- The 'correct_option' is the key from the 'options' JSONB that corresponds to the correct answer.
INSERT INTO questions (subject, question_text, options, correct_option, tags, created_by) VALUES
    ('Anatomy', 'Which bone is the longest in the human body?', '{"A": "Femur", "B": "Tibia", "C": "Humerus", "D": "Fibula"}', 'A', '{"bones", "skeletal_system"}', '00000000-0000-0000-0000-000000000002'),
    ('Physiology', 'What is the primary function of the alveoli in the lungs?', '{"A": "Filter air", "B": "Gas exchange", "C": "Produce mucus", "D": "Warm inhaled air"}', 'B', '{"respiratory_system", "gas_exchange"}', '00000000-0000-0000-0000-000000000002'),
    ('Biochemistry', 'Which molecule is the main energy currency of the cell?', '{"A": "DNA", "B": "RNA", "C": "ATP", "D": "Glucose"}', 'C', '{"metabolism", "energy"}', '00000000-0000-0000-0000-000000000002'),
    ('Anatomy', 'The deltoid muscle is located in which part of the body?', '{"A": "Leg", "B": "Arm", "C": "Back", "D": "Neck"}', 'B', '{"muscles", "upper_limb"}', '00000000-0000-0000-0000-000000000002'),
    ('Physiology', 'What is the average resting heart rate for an adult?', '{"A": "40-60 bpm", "B": "60-100 bpm", "C": "100-120 bpm", "D": "120-140 bpm"}', 'B', '{"cardiovascular_system", "heart_rate"}', '00000000-0000-0000-0000-000000000002'),
    ('Biochemistry', 'Which vitamin is essential for blood clotting?', '{"A": "Vitamin A", "B": "Vitamin C", "C": "Vitamin D", "D": "Vitamin K"}', 'D', '{"vitamins", "coagulation"}', '00000000-0000-0000-0000-000000000002'),
    ('Anatomy', 'The radius and ulna are bones of the:', '{"A": "Upper arm", "B": "Forearm", "C": "Hand", "D": "Wrist"}', 'B', '{"bones", "upper_limb"}', '00000000-0000-0000-0000-000000000002'), -- Another anatomy question
    ('Physiology', 'Where is bile produced?', '{"A": "Gallbladder", "B": "Pancreas", "C": "Liver", "D": "Small intestine"}', 'C', '{"digestive_system", "liver"}', '00000000-0000-0000-0000-000000000002'),
    ('Biochemistry', 'What is the primary substrate for glycolysis?', '{"A": "Fatty acids", "B": "Amino acids", "C": "Glucose", "D": "Ketone bodies"}', 'C', '{"metabolism", "glycolysis"}', '00000000-0000-0000-0000-000000000002'),
    ('Anatomy', 'Which structure connects muscle to bone?', '{"A": "Ligament", "B": "Tendon", "C": "Cartilage", "D": "Fascia"}', 'B', '{"musculoskeletal_system", "connective_tissue"}', '00000000-0000-0000-0000-000000000002'); -- Final anatomy question

-- Daily Quiz (references the first 5 questions inserted)
-- Note: This assumes the order of insertion matches the desired quiz questions.
-- In a real scenario, you'd likely select questions dynamically.
-- The 'question_ids' column is a JSONB array storing the IDs of the questions included in this daily quiz.
INSERT INTO daily_quiz (quiz_date, question_ids) VALUES
    (CURRENT_DATE, (SELECT jsonb_agg(id) FROM (SELECT id FROM questions ORDER BY created_at LIMIT 5) as subquery));


-- Sample Batch
-- The 'join_code' is a unique identifier for students to join this batch.
INSERT INTO batches (name, join_code, created_by) VALUES
    ('Medical Students 2025', 'MED2025', '00000000-0000-0000-0000-000000000002');

-- Sample 3D Model Metadata
-- This table stores metadata about available 3D models. The actual model files are hosted externally (e.g., S3).
-- The 'metadata' column is a JSONB field that can store various properties like regions, thumbnail URLs, etc.
INSERT INTO models_3d (name, file_url, metadata) VALUES
    ('Human Skull', 'https://example.com/models/skull.glb', '{"regions": ["cranium", "mandible"], "thumbnail_url": "https://example.com/thumbnails/skull.png"}');