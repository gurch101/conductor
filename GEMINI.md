# GEMINI.md - Conductor.ai Instructional Context

This document provides essential context, architectural patterns, and development guidelines for the Conductor.ai project.

## Project Overview

**Conductor.ai** is an AI agent team orchestration platform. It allows users to design, deploy, and monitor multi-agent workflows using a visual canvas.

### Core Technologies
- **Runtime:** Bun (v1.2+)
- **Frontend:** React 19 (TypeScript), Tailwind CSS (v4), React Flow (for the orchestration canvas), Lucide React (icons).
- **Backend:** Bun.serve with the modern `routes` API and `HTMLBundle` support.
- **ORM:** Drizzle ORM (using `drizzle-orm/bun-sqlite`)
- **Database:** SQLite (via `bun:sqlite`)
- **Testing:** Bun Test with Happy DOM for component testing.

### Architecture
- **Monolithic SPA:** The Bun server serves both the API and the React frontend.
- **Bundling:** Uses Bun's built-in bundler. `src/index.ts` imports `index.html` as an `HTMLBundle`, which automatically manages frontend assets and HMR.
- **Data Layer:** 
  - `src/db/schema.ts`: Defines the Drizzle schema.
  - `src/db/index.ts`: Initializes the Bun SQLite database, applies migrations, and exports the `db` instance.
  - `src/repositories/`: Drizzle-based database operations using the schema.
  - `src/services/`: High-level business logic.
- **API Pattern:** RESTful routes defined in `src/index.ts` using the `routes` object.

## Building and Running

### Development
```bash
bun dev
```
Starts the Bun server with Hot Module Replacement (HMR) enabled. The server runs at `http://localhost:3000`.

### Database Management (Drizzle Kit)
- **Push Changes:** `bun run db:push` (Sync schema directly to DB in development)
- **Generate Migrations:** `bun run db:generate` (Create SQL migrations from schema)
- **Apply Migrations:** `bun run db:migrate` (Apply generated migrations to DB)
- **Studio:** `bun run db:studio` (Visual DB explorer)

### Production Build
```bash
bun run build
```
Executes `build.ts`, which uses `Bun.build` with the `bun-plugin-tailwind` to generate a minified production bundle in the `dist/` directory.

### Running Production
```bash
bun start
```
Runs the server in production mode (`NODE_ENV=production`).

### Testing
```bash
bun test           # Run all tests
bun run test:coverage # Run tests with coverage report
```

### Linting & Formatting
```bash
bun run lint
bun run format
```

## Development Conventions

### 1. Server Routing (Bun 1.2+)
Always use the `routes` API in `Bun.serve`. 
- **API Routes:** Define specific paths under `/api/`.
- **Catch-all API:** Use `'/api/*'` to return a 404 for unknown endpoints.
- **SPA Routing:** Use `'/*': index` (where `index` is an imported `index.html`) to support frontend routing and asset serving.
- **Testing:** Export `appOptions` from `src/index.ts`. In tests, start an ephemeral server using `serve({ ...appOptions, port: 0 })` and use real `fetch` calls for API integration tests.

### 2. Database & Logic
- Follow the **Repository/Service** pattern. Do not put SQL logic in the route handlers.
- Use `src/types.ts` for shared interfaces between frontend and backend.
- Database initialization happens in `src/db/schema.ts`.

### 3. Frontend
- Use **Vanilla CSS** or Tailwind utility classes.
- Prefer functional components with hooks.
- Asset imports in `index.html` (like `<script src="./frontend.tsx">`) are automatically handled by Bun's `HTMLBundle`.

### 4. Git & Commits
- This project uses **Husky** for pre-push hooks.
- Pre-push hooks run: `lint`, `format`, and `test:coverage`.
- Ensure all tests pass and coverage remains high (80% threshold for lines/statements) before pushing.
- Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `refactor:`).

## Documentation
- Extensive documentation is located in the `website/` directory (Docusaurus-based).
- API reference is generated from JSDoc and located in `website/docs/reference/`.
