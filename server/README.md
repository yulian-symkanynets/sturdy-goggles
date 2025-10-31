# Knowledge Base API Server

Backend API for the Personal Knowledge Base application with SQLite database and full-text search.

## Features

- **RESTful API** - CRUD operations for categories and items
- **SQLite Database** - Lightweight, file-based database with full-text search (FTS5)
- **Versioning** - Track changes to items over time
- **Tagging System** - Flexible tagging with many-to-many relationships
- **Full-Text Search** - Fast search across title, summary, and body content
- **Markdown Support** - Store rich content with Markdown formatting

## Database Schema

### Tables

- **categories** - Content categories (leetcode, algorithm, project, technology, db-backend, article, skill, other)
- **tags** - Reusable tags for organizing items
- **items** - Main content items with metadata
- **item_tags** - Many-to-many relationship between items and tags
- **item_versions** - Version history for items
- **items_fts** - Full-text search virtual table (FTS5)

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Categories

#### GET /api/categories
List all categories.

**Response:**
```json
[
  {
    "id": 1,
    "slug": "leetcode",
    "name": "🧩 LeetCode Problem",
    "description": "Problem statement, solution, complexity, tags, links"
  }
]
```

#### GET /api/categories/:slug/items
Get all items in a category with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Items

#### POST /api/items
Create a new item.

**Request Body:**
```json
{
  "title": "Two Sum",
  "category_id": 1,
  "summary": "Indices of two numbers that add to target",
  "body": "## Problem\nGiven an array...\n\n## Solution\nUse a hashmap...\n\n```python\nclass Solution:\n    def twoSum(self, nums, target):\n        ...\n```",
  "tags": ["array", "hashmap"],
  "language": "Python",
  "difficulty": "Easy",
  "repo_url": "https://github.com/you/algos"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Two Sum",
  "slug": "two-sum",
  "category_id": 1,
  "summary": "Indices of two numbers that add to target",
  "body": "...",
  "language": "Python",
  "difficulty": "Easy",
  "repo_url": "https://github.com/you/algos",
  "created_at": "2025-10-31T13:00:00.000Z",
  "updated_at": "2025-10-31T13:00:00.000Z",
  "category_name": "🧩 LeetCode Problem",
  "category_slug": "leetcode",
  "tags": [
    { "id": 1, "name": "array" },
    { "id": 2, "name": "hashmap" }
  ]
}
```

#### GET /api/items/:slug
Get a single item by slug.

#### PUT /api/items/:id
Update an item. Creates a new version in the history.

#### DELETE /api/items/:id
Delete an item.

### Search

#### GET /api/search?q=query
Full-text search across title, summary, and body.

**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Two Sum",
      "slug": "two-sum",
      "summary": "...",
      "title_snippet": "Two <mark>Sum</mark>",
      "summary_snippet": "Indices of two numbers that add to <mark>target</mark>",
      "body_snippet": "...Use a hashmap to store <mark>numbers</mark>...",
      "tags": ["array", "hashmap"],
      "category_name": "🧩 LeetCode Problem",
      "category_slug": "leetcode"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  },
  "query": "sum"
}
```

## Database Location

The SQLite database file is created at `server/db/knowledge-base.db`.

## Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **better-sqlite3** - Fast SQLite3 library
- **SQLite FTS5** - Full-text search extension
- **slugify** - URL-friendly slug generation
- **marked** - Markdown parser (for future use)
