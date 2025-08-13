# MedMaster AI — Study smarter, not harder

This is the Stage 1 MVP of MedMaster AI, an AI-powered learning platform for medical students and professionals.

## Quick Start

Follow these steps to get the project running locally.

1.  **Install dependencies:**
    Make sure you have `pnpm` installed.

    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Copy the `.env.example` file to `.env.local` and fill in the required values for Supabase, etc.

    ```bash
    cp .env.example .env.local
    ```

3.  **Run database migrations and seed data:**
    You'll need to run the SQL schema and seed files in your Supabase project's SQL Editor.

    ```bash
    pnpm seed
    ```
    *(Note: The seed script is a placeholder. For now, run the SQL files from the `sql/` directory manually in your Supabase dashboard.)*

4.  **Start the development server:**

    ```bash
    pnpm dev
    ```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Design Tokens

Our design system is built on a set of tokens defined in `tailwind.config.ts` and `src/app/globals.css`.

### Color Palette

| Name      | Light Mode | Dark Mode  | Usage                                  |
| --------- | ---------- | ---------- | -------------------------------------- |
| Primary   | `#1E3A8A`  | `#3B82F6`  | Main brand color, buttons, active links|
| Accent    | `#14B8A6`  | `#10B981`  | Secondary actions, highlights, success |
| Highlight | `#F59E0B`  | `#FBBF24`  | Pinned items, special callouts, warnings|
| Background| `#F8FAFC`  | `#111827`  | Page background                        |
| Foreground| `#0F172A`  | `#F8FAFC`  | Body text                              |

### Typography

-   **Headline Font:** Space Grotesk
-   **Body Font:** PT Sans

### Windsurf Notes

This project is set up to be compatible with Windsurf, an AI agent for software development. Please keep the code clean and well-structured.
Remember to set your `.env` file; it's gitignored for security. Later, we'll need to set these secrets in our deployment environment (e.g., Vercel).
The project name `medmaster` is set in `package.json`.
