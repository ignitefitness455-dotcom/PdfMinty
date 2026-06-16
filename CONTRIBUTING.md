# Contributing
Welcome to the PDFMinty developer community! This section covers how you can build and extend our offline-first PDF suite.

## Running the Project Locally
To run the project on your machine, follow these steps:
1. **Install dependencies:**  
   `npm install`
2. **Start the dev server:**  
   `npm run dev`  
   This starts the Vite server on `localhost:3000` (or another available port).

## Code Quality Commands
Before submitting PRs, ensure you adhere to our strict formatting and testing standards. Run these commands:
- **Testing:** `npm run test` (or `npm run test:ui` for the Vitest UI).
- **Linting:** `npm run lint` (or `npm run lint:fix` to auto-fix).
- **Typechecking:** `npm run typecheck` (ensures TypeScript validations pass).
- **Formatting:** `npm run format:check` to check Prettier, or `npm run format` to write.

## Developer Conventions
### The Tool Workspace Architecture
You will notice we have many diverse PDF tools (e.g., merge, split, compress, watermark). **You should NOT build new UI layout pages from scratch for each tool.**

Instead, we use a shared logic and visual container:
- **`src/components/ToolWorkspace.tsx`**: This is the shared logic for all tools. It automatically handles Drag-and-Drop, error boundaries, file processing orchestration, and displaying proper status overlays.
- When creating a new feature, you must **extend** `ToolWorkspace.tsx` rather than duplicating page-level logic in multiple directories. New tools should plug directly into the `executePdfWorker` configuration with minimal frontend overhead.
