# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, Claude generates them in real-time, and they render in an iframe — all without touching disk (virtual file system).

## Commands

```bash
# Development
npm run dev          # Start dev server (Next.js, port 3000)

# Production
npm run build
npm run start

# Code quality
npm run lint         # ESLint

# Testing
npm run test         # Vitest (all tests)

# Database
npm run setup        # Install deps + generate Prisma client + migrate DB
npm run db:reset     # Force reset Prisma migrations
```

Run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, Radix UI primitives (`src/components/ui/`)
- **Database**: SQLite via Prisma 6 (schema at `prisma/schema.prisma`)
- **AI**: Anthropic Claude (claude-haiku-4-5) via Vercel AI SDK + `@ai-sdk/anthropic`
- **Preview**: Monaco Editor + Babel standalone for in-browser JSX transforms
- **Auth**: JWT cookies (7-day) + bcrypt
- **Testing**: Vitest + jsdom + Testing Library

### Key Data Flow

**Chat → Code Generation:**
1. User submits message in `MessageInput` → `ChatProvider` (`src/lib/contexts/chat-context.tsx`)
2. POST to `/api/chat/route.ts` with `{ messages, files, projectId }`
3. `streamText` (Vercel AI SDK) calls Claude with two tools: `str_replace_editor` and `file_manager`
4. Tool calls update the `VirtualFileSystem` via `useFileSystem` context
5. `PreviewFrame` re-renders the iframe using Babel-transformed JSX

**Virtual File System:**
- `VirtualFileSystem` class (`src/lib/file-system.ts`): in-memory tree, never writes to disk
- Serialized as JSON and stored in the `Project.data` DB column
- AI manipulates files through `str-replace.ts` and `file-manager.ts` tools in `src/lib/tools/`
- Every project must have `/App.jsx` as the preview entry point

**AI Provider:**
- `src/lib/provider.ts` checks `ANTHROPIC_API_KEY` env var
- If set: uses real Claude; if missing: falls back to `MockLanguageModel` (predefined responses)

**Authentication:**
- Server actions in `src/actions/` (`signUp`, `signIn`, `signOut`, `getUser`)
- Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes
- Anonymous users can use the app; work is tracked via `anon-work-tracker.ts`

### Database Schema (Prisma/SQLite)

```prisma
User    { id, email, password, projects[] }
Project { id, name, userId?, messages (JSON string), data (serialized VFS JSON) }
```

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and `vitest.config.mts`).

### Generated Code Requirements (Claude's System Prompt)

When Claude generates components, it must:
- Use Tailwind CSS only (no inline/hardcoded styles)
- Provide `/App.jsx` as the default export entry point
- Use `@/` imports for non-library files within the virtual FS
- No HTML files
