# Supabase Setup Guide for MedMaster

This guide will walk you through setting up your Supabase project for MedMaster.

<!-- This document is intended for developers setting up the Supabase backend for the first time. -->

## 1. Create a New Supabase Project

1.  Go to the [Supabase website](https://supabase.com/) and log in or create a new account.
2.  Click "New Project".
3.  Choose your desired region.
4.  Give your project a name (e.g., `medmaster
5.  Set a strong database password. Keep this secure!
6.  Click "Create new project". This may take a few minutes.

<!-- Add a note about keeping the password secure -->

## 2. Enable Auth (Email)

MedMaster uses email/password authentication.

1.  In your Supabase project dashboard, navigate to "Authentication" in the left sidebar.
2.  Go to the "Settings" tab.
3.  Under "Authentication Providers", ensure "Email" is enabled. You can disable other providers if not needed for Stage 1.
4.  (Optional but recommended) Configure email templates for confirmation, password reset, etc.

<!-- Explain why email auth is needed for Stage 1 -->

## 3. Enable pgcrypto Extension

The schema uses the `pgcrypto` extension for generating UUIDs.

1.  In your Supabase project dashboard, navigate to "Database" in the left sidebar.
2.  Click on "Extensions".
3.  Search for `pgcrypto`.
4.  Click "Enable extension".

<!-- Explain why pgcrypto is needed (for UUIDs) -->

## 4. Run SQL Files (Schema and Seed)

You need to apply the database schema and seed initial data.

1.  In your local MedMaster project, locate the `sql` directory. It contains `schema.sql` and `seed.sql`.
2.  In your Supabase project dashboard, navigate to "SQL Editor" in the left sidebar.
3.  Click "+ New query".
4.  Copy the content of `sql/schema.sql` and paste it into the editor.
5.  Click "Run". Verify that the queries execute successfully. You should see tables created under the "Database" -> "Tables" section.
6.  Repeat steps 3-5 for the `sql/seed.sql` file.

<!-- Explain what each SQL file does -->
<!-- Include a placeholder for expected output or a screenshot reference -->

## 5. Add Service Role Key to Vercel Safely

The `SUPABASE_SERVICE_ROLE_KEY` is highly sensitive. **Never commit this key directly in your code or `.env` file that is committed to version control.**

1.  In your Supabase project dashboard, navigate to "Settings" -> "API".
2.  Copy the `service_role` secret key.
3.  In your Vercel project settings, navigate to "Environment Variables".
4.  Add a new environment variable:
    -   **Name:** `SUPABASE_SERVICE_ROLE_KEY`
    -   **Value:** Paste the service role secret key you copied.
    -   **Environments:** Select the environments where this key is needed (e.g., Production, Preview, Development).

<!-- **IMPORTANT:** Add a strong warning about not committing the service role key. -->

## 6. Row Level Security (RLS) Basics

RLS is crucial for security in Supabase. It restricts which rows users can access or modify.

1.  Navigate to "Authentication" -> "Policies".
2.  You will need to enable RLS for tables that contain user-specific data (e.g., `profiles`, `quiz_results`, `srs_reviews`, `annotations`).
3.  Create policies (e.g., `SELECT` policy allowing users to read their own `quiz_results` based on `user_id`).

The `sql/schema.sql` file includes comments with examples of RLS policies you will need to set up manually in the Supabase UI.

<!-- Explain the importance of RLS and how to set it up in Supabase UI. Reference comments in schema.sql -->