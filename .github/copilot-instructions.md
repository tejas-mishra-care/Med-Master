## MedMaster — Copilot instructions (concise)

Purpose: help an AI coding agent be immediately productive in this repository by documenting the big-picture architecture, developer workflows, project-specific patterns, and concrete edit/run examples.

- Project type: Next.js (App Router) + TypeScript frontend with Supabase backend and OpenAI integration. See `package.json` and `next.config.js`.
- Key directories/files to read first:
  - `package.json` — scripts, deps (Next 14, React 18, Supabase, three.js, OpenAI hints)
  - `README.md` — quickstart (uses `pnpm`), stage overview, tokens
  - `next.config.js` — App Router, transpilePackages, images, and TypeScript/eslint build settings
  - `lib/openai.ts` — OpenAI wrapper: in-memory cache + rate limiter + model usage (edit here to change model/behaviour)
  - `lib/supabaseClient.ts` — `getBrowserSupabase()` and `getServerSupabase()` helpers and typed examples
  - `sql/schema.sql` and `sql/seed.sql` — DB schema and seeds (seed script currently not implemented)
  - `features/anatomy3d/` and `public/draco/` — 3D assets and viewer (three.js, draco decoders)
  - `src/app/` — Next App Router entrypoints; `src/app/page.tsx` redirects to `/dashboard`

Architecture notes (what matters to edits):
- Single Next monorepo-style app: frontend pages/components in `src/app` and `components/`. Server code lives in Next server components and API routes (search `src/app/api` or `server` directory).
- Supabase is the primary persistence/auth/data store. Client code should use `getBrowserSupabase()`. Server-only actions that require service privileges should call `getServerSupabase()` and must not leak service role keys to client bundles.
- OpenAI usage is wrapped in `lib/openai.ts`. It currently uses an in-memory Map for caching and per-user rate limiting — replace with Redis or a durable store for production.

Developer workflows & commands (concrete):
- Install deps (recommended in README): `pnpm install` (package.json scripts will work with `npm`/`pnpm`).
- Start dev server: `pnpm dev` or `npm run dev` (runs `next dev`, default port 3000).
- Build: `pnpm build` / `npm run build` (runs `next build`). Note: `next.config.js` sets `typescript.ignoreBuildErrors = true` and `eslint.ignoreDuringBuilds = true` — CI or agents should still run `pnpm typecheck` and `pnpm lint` locally.
- Tests: `npm test` / `pnpm test` (Jest). Playwright tests exist under `tests/e2e` and devDeps include `@playwright/test`.
- Formatting/linting: `pnpm format` (`prettier`), `pnpm lint` (`next lint`).
- DB seed: `npm run seed` prints a placeholder; run SQL in `sql/` manually in Supabase dashboard or use Supabase CLI if you wire it up.

Project-specific conventions and patterns:
- Environment: copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`. See `.env.example`.
- Service keys: never commit `SUPABASE_SERVICE_ROLE_KEY`. `getServerSupabase()` expects service role on server — keep usage restricted to API routes or server components.
- OpenAI: `lib/openai.ts` composes messages and calls `openai.chat.completions.create({ model: 'gpt-4o-mini' })`. If changing model or SDK surface, update this file + any tests.
- 3D assets: `public/draco/` holds draco decoders used by three.js loaders; keep those paths and `next.config.js.transpilePackages` in mind when changing three.js versions.
- Type-safety: `lib/types.ts` and `lib/supabaseClient.ts` expect a generated `Database` type. When altering DB schema, regenerate types or update usages.

Integration points and gotchas:
- Supabase: RLS may be enabled. Many helper functions use `.from('profiles')` etc.; ensure RLS policies align with server/client usage.
- Next config: images remotePatterns include placeholders and S3 — update when adding external image hosts.
- Build settings intentionally suppress TypeScript/Eslint build errors; run `pnpm typecheck` and `pnpm lint` before large changes.
- Seeds: `sql/seed.sql` is authoritative; `package.json` `seed` script is a placeholder.

Examples (do this when changing behavior):
- To change the OpenAI model/limits: update `lib/openai.ts` model string, adjust `RATE_LIMIT_PER_MINUTE`, and update tests that assert usage.
- To add a server-only Supabase helper: add export to `lib/supabaseClient.ts` and call from `src/app/api/...` server route. Use `getServerSupabase()` there.
- To add 3D model: drop `.glb` into `models/3D anatomy/`, add necessary loader usage in `features/anatomy3d/components/AnatomyViewer.tsx`.

If you modify globals or environment-sensitive config, run these checks locally before pushing:
1. `pnpm install`
2. `pnpm dev` (validate UI loads at http://localhost:3000)
3. `pnpm typecheck` and `pnpm lint`
4. `npm test` (unit) and optionally `npx playwright test` for e2e

If anything in this file is unclear or you want deeper examples (e.g., sample API route that uses `getServerSupabase()`), tell me which area and I will add a focused snippet.
