---
name: "Personal-KB"
description: "A personal knowledge page for storing LeetCode problems, algorithms, pet projects, technologies, and implementation notes (database + backend examples)."
---

# Personal Knowledge Base (KB)

This Personal KB stores and organizes practical developer knowledge: solved LeetCode problems, algorithm explanations, pet-project notes, technology guides, and code snippets for backends and databases. It's designed to be the canonical place for your study notes and project documentation.

## Structure / Content Types
- Categories
  - leetcode — problem statement, solution, complexity, tags, links
  - algorithm — explanation, use-cases, pseudocode, complexity
  - petproject — project description, tech stack, architecture, repo link, run instructions
  - technology — short guides, pros/cons, example usage, snippets
  - db-backend — DB schema, migrations, API examples, deployment notes
  - article — long-form posts, tutorials, retrospectives

- Each item includes:
  - title, slug (friendly URL)
  - category
  - summary (one-line)
  - body (Markdown: explainer, code blocks, diagrams)
  - tags (searchable keywords)
  - metadata: language, difficulty (if applicable), repo_url, created_at, updated_at
  - optional: versions/history, attachments (images, SQL dumps)

## How to author entries
- Use Markdown for the body. Include:
  - Problem/Goal
  - Approach / Thought process
  - Implementation (code block with language)
  - Complexity (time/space)
  - References / links
  - Optional: test cases, sample input/output
- Example frontmatter (if storing as files):
  ```
  ---
  title: "Two Sum"
  slug: "leetcode-two-sum"
  category: "leetcode"
  tags: ["array","hashmap","easy"]
  language: "Python"
  difficulty: "Easy"
  summary: "Find indices of two numbers that add up to target."
  ---
  ```

## Recommended Database Schema (conceptual)
- categories(id, slug, name, description)
- tags(id, name)
- items(id, title, slug, category_id, summary, body, language, difficulty, repo_url, created_at, updated_at)
- item_tags(item_id, tag_id)
- item_versions(id, item_id, title, body, note, created_at)
- FTS index/table for full-text search (SQLite FTS5 or Postgres tsvector)

## Minimal API contract (REST)
- GET /api/categories — list categories
- GET /api/categories/:slug/items — list items in category
- POST /api/items — create item { title, category_id, summary, body, tags[], language, difficulty, repo_url }
- GET /api/items/:slug — read item (includes tags)
- PUT /api/items/:id — update item
- DELETE /api/items/:id — delete item
- GET /api/search?q=... — full-text search (title/summary/body)

Example request body for creating a LeetCode entry:
```json
{
  "title": "Two Sum",
  "category_id": 1,
  "summary": "Indices of two numbers that add to target",
  "body": "## Problem\nGiven an array...\n\n## Solution\nUse a hashmap...\n\n```python\nclass Solution:\n    def twoSum(self, nums, target):\n        ...\n```",
  "tags": ["array","hashmap"],
  "language": "Python",
  "difficulty": "Easy",
  "repo_url": "https://github.com/you/algos"
}
```

## UI ideas
- Home: category cards, recent/featured items
- Category page: paginated list with summary and tags
- Item page: render Markdown, highlight code blocks, show metadata and related items by tags
- Create/Edit: Markdown editor (monaco or simple textarea) + tag input + preview
- Search: live search with highlighted snippets and ranking
- Optional: bookmarking / personal progress (read, practicing, solved)

## Local search and semantic search roadmap
- Phase 1: SQLite FTS / Postgres full-text search (fast to set up)
- Phase 2: Add embeddings + vector DB (Pinecone, Weaviate) for semantic retrieval across notes and code
- Phase 3: Re-ranker and contextual answer generator (local LLM or API) to synthesize steps from multiple items

## Backend + DB Implementation Notes (practical)
- Start simple: Node.js + Express + SQLite (better-sqlite3) or Prisma + Postgres for more advanced needs.
- Keep Markdown bodies as text in DB and render them on frontend with a safe sanitizer.
- Use slugified titles for friendly URLs.
- Versioning: Save edits as item_versions for rollback/audit.
- Attachments: store files on disk or object storage (S3) and keep reference URLs in DB.

## Example entry template (Markdown)
````markdown
---
title: "Dijkstra's Algorithm"
slug: "dijkstras-algorithm"
category: "algorithm"
tags: ["graphs","shortest-path","greedy"]
language: "pseudocode"
summary: "Find shortest paths from a source to all nodes in a weighted graph with non-negative weights."
---

## Overview
Dijkstra's algorithm finds the shortest path from a single source to all other vertices in a graph with non-negative weights.

## Pseudocode
```text
function Dijkstra(Graph, source):
  dist[source] := 0
  for each vertex v in Graph:
    if v != source: dist[v] := infinity
  create priority queue Q with all vertices
  while Q not empty:
    u := extract-min(Q)
    for each neighbor v of u:
      alt := dist[u] + weight(u, v)
      if alt < dist[v]:
        dist[v] := alt
        decrease-key(Q, v, alt)
return dist
```

## Complexity
- Time: O((V + E) log V) using binary heap; O(E + V log V) with Fibonacci heap for dense graphs.
- Space: O(V)

## Notes and variations
- Works only with non-negative edge weights.
- For negative weights, use Bellman-Ford.

## References
- https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
