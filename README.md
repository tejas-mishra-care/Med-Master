# MedMaster — Study smarter

MedMaster is an AI-powered learning platform designed to help medical students and professionals study smarter. This repository contains the codebase for Stage 1 of the MedMaster MVP.
// This is the main README file providing an overview and quick start guide for the MedMaster project.
// It includes instructions for setup, development, and deployment.

<!-- This is the project name set in package.json. Change it there if needed for your project. -->

---
## Stage 1 MVP Overview
This stage focuses on core functionalities: Daily/Weekly Quizzes, Spaced Repetition System (SRS), basic AI chat with context retrieval, PDF viewing and annotation, 3D model viewing, Batch features (professors create, students join, notice board), and a foundation for offline notes/annotations.

---
## Quick Start

Follow these steps to get the project running locally.

1.  **Install dependencies:**
    // Use pnpm for package management as specified in package.json.
    Make sure you have `pnpm` installed. This command downloads and installs all the necessary libraries and frameworks listed in `package.json`.

    
```
bash
    pnpm install
    
```
2.  **Set up environment variables:**
    Copy the `.env.example` file to `.env.local` and fill in the required values for Supabase, OpenAI, etc.
```
bash
    cp .env.example .env.local
    
```
<!-- Remember to set your .env file and configure secrets in your deployment environment (e.g., Vercel). -->

3.  **Run database schema and seed data:**
    Apply the SQL schema and seed files in your Supabase project's SQL Editor.
```
bash
    # Instructions to run schema.sql and seed.sql manually or via tool
    # e.g., pnpm supabase db push (if using Supabase CLI)
    # For now, run the SQL files from the `sql/` directory manually in your Supabase dashboard.
    
```
*(Note: The `pnpm seed` script is a placeholder for future implementation. For now, run the SQL files from the `sql/` directory manually in your Supabase dashboard.)*

4.  **Start the development server:**
```
bash
    pnpm dev
    
```
The application should now be running on [http://localhost:3000](http://localhost:3000).

## Design Tokens
The project uses a token-based design system for consistency.
Our design system is built on a set of tokens defined in `tailwind.config.ts`.

### Color Palette

| Name      | Light Mode | Dark Mode  | Usage                                  |
| --------- | ---------- | ---------- | -------------------------------------- |
| Primary   | `#1E3A8A`  | `#3B82F6`  | Main brand color, buttons, active links|
| Accent    | `#14B8A6`  | `#10B981`  | Secondary actions, highlights, success |
| Highlight | `#F59E0B`  | `#FBBF24`  | Pinned items, special callouts, warnings|
| Background| `#F8FAFC`  | `#111827`  | Page background                        |
| Foreground| `#0F172A`  | `#F8FAFC`  | Body text                              |
<!-- Other tokens (spacing, radii, etc.) to be documented here -->
| Name      | Description                                      | Default Value |
| --------- | ------------------------------------------------ | ------------- |
| space-*   | Spacing values                                   | See config    |
| rounded-* | Border radii                                     | See config    |
| duration-*| Animation and transition durations               | See config    |

## Windsurf Notes

This project is set up to be compatible with Windsurf, an AI agent for software development. Please keep the code clean and well-structured.

The project is configured to use the following tooling, which is recommended for development with Windsurf or other agents:
- **Windsurf Agent:** For AI-assisted development.
- **Prettier:** For code formatting (`pnpm format`).
- **ESLint:** For linting and code quality (`pnpm lint`).
- **Tailwind IntelliSense:** For better developer experience with Tailwind CSS.
<!-- Remember to set your .env file; it's gitignored for security. Later, we'll need to set these secrets in our deployment environment (e.g., Vercel). -->
<!-- The project name `medmaster` is set in `package.json`. Change it there if needed for your project. -->