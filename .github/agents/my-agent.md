# Personal Knowledge Base (KB) — Minimal Starter

This project is a minimal knowledge-base web app for personal notes like:
- LeetCode problems (solutions, complexity, linked resources)
- Algorithms (explanations, code, complexity)
- Pet projects (description, tech stack, repo link)
- Technologies & tutorials

Stack (suggested)
- Backend: Node.js + Express
- Database: SQLite (simple) or Postgres for production
- Frontend: React (Vite) or Next.js (if you want server-side rendering)
- Search: SQLite FTS / Postgres full-text search, or vector DB for embeddings later
- Auth: optional (JWT / OAuth)

What’s included in this starter:
- DB schema to store items, tags, categories, and versions
- Express API with endpoints to manage entries, tags, and search
- Minimal server file to bootstrap the app
- Instructions for running locally

Next steps:
- I can generate the full repo with code and Dockerfile and a React UI.
- I can add authentication, image/file uploads, or semantic search (embeddings).
