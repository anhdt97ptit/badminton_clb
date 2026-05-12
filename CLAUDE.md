# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier

npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply migrations to the database

docker compose up -d # Start local PostgreSQL (port 5432)
```

Requires `DATABASE_URL` environment variable (e.g. `postgresql://postgres:postgres@localhost:5432/badminton_clb`).

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Drizzle ORM · PostgreSQL · Tailwind CSS v4 · shadcn/ui · Zod v4 · React Hook Form · Sonner

### Key layers

- `db/schema.ts` — single source of truth for the DB schema (tables: `users`, `matches`, `match_players`, `match_results`; enum: `team` A/B)
- `db/index.ts` — exports a singleton `db` (Drizzle over `pg` Pool) and the raw `pool`
- `server/services/` — server-only service functions that call `db` directly; import these from Server Components or Route Handlers only
- `src/lib/validations/` — Zod schemas; `memberSchema`, `matchSchema`; inferred types replace manual interfaces
- `src/app/` — Next.js App Router pages (`/`, `/history`, `/members`)
- `src/components/` — client components; `ui/` contains shadcn primitives, top-level files are feature components
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Form & validation conventions

- All forms use **React Hook Form** (`useForm`) with **`@hookform/resolvers/zod`** as the resolver — no manual `safeParse` in form submit handlers
- Zod schemas live in `src/lib/validations/`; pass them to `zodResolver(schema)` in `useForm`
- Types are inferred with `z.infer<typeof schema>` — do not duplicate manual interfaces for validated data
- Path alias: `@/lib/validations` (or `@/lib/validations/member`, etc.)
- Use `schema.safeParse(data)` only at server boundaries (Route Handlers); prefer `zodResolver` on the client

### Toast / feedback conventions

- Use **Sonner** (`import { toast } from 'sonner'`) for all user-facing notifications
- Place `<Toaster />` once in the root layout (`src/app/layout.tsx`)
- Call `toast.success(...)`, `toast.error(...)`, `toast.promise(...)` from event handlers and async actions; never use `alert()` or inline error state for transient feedback

### Data flow note

Most pages currently use **hardcoded sample data** (inline arrays in `page.tsx`). The DB layer and services exist but are not yet wired up to the UI. When connecting real data, call service functions from Server Components and pass results as props to Client Components.

### UI conventions

- Dark/light theme via `next-themes` (`ThemeProvider` in layout)
- Vietnamese UI strings throughout
- Mobile-first responsive layouts; many components have separate mobile/desktop JSX branches
- shadcn components live in `src/components/ui/`; add new ones with `npx shadcn add <component>`
