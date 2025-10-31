# My Knowledge Base 📚

A full-stack web application for managing your personal knowledge base with a powerful backend API and SQLite database. Track LeetCode problems, algorithms, pet projects, technologies, database schemas, articles, and more with full-text search, tagging, and version history!

## Features

✨ **Smooth Animations** - Built with Framer Motion for delightful transitions and interactions
🎨 **Beautiful Design** - Modern gradient UI with clean, minimalist interface
📂 **Rich Categories** - 8 specialized categories for different types of knowledge
💾 **Persistent Backend** - SQLite database with full-text search (FTS5)
🏷️ **Flexible Tagging** - Tag items for easy organization and discovery
🔍 **Full-Text Search** - Fast search across titles, summaries, and content
📝 **Markdown Support** - Write detailed content with Markdown formatting
⏱️ **Work Timer** - Track study/work sessions
📚 **Version History** - Track changes to your knowledge items over time
🗑️ **Easy Management** - Add, update, and delete items with CRUD API
📱 **Responsive** - Works seamlessly on desktop and mobile devices

## Categories

- 💻 **Technology** - Programming languages, frameworks, tools, pros/cons, example usage
- 🧩 **LeetCode Problem** - Problem statement, solution, complexity analysis, tags
- 🚀 **Pet Project** - Project description, tech stack, architecture, repo link
- 📊 **Algorithm** - Explanation, use-cases, pseudocode, complexity
- 🗄️ **DB & Backend** - Database schemas, migrations, API examples, deployment notes
- 📝 **Article** - Long-form posts, tutorials, retrospectives
- ✨ **Skill** - General skills and competencies
- 📌 **Other** - Anything else you want to track

## Architecture

- **Frontend**: React + Framer Motion
- **Backend**: Node.js + Express
- **Database**: SQLite with FTS5 full-text search
- **API**: RESTful endpoints for categories, items, and search

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yulian-symkanynets/sturdy-goggles.git
cd sturdy-goggles
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

You need to run both the backend and frontend:

1. **Start the backend server** (in one terminal):
```bash
cd server
npm start
```

The API will start on `http://localhost:5000`

2. **Start the frontend** (in another terminal):
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

For development with auto-reload on the backend:
```bash
cd server
npm run dev
```

## Data Model

Each knowledge item includes:

- **title** - Item title
- **slug** - URL-friendly identifier (auto-generated)
- **category_id** - Associated category
- **summary** - One-line description
- **body** - Full content in Markdown format
- **tags** - Searchable keywords (array)
- **language** - Programming language (if applicable)
- **difficulty** - Easy/Medium/Hard (if applicable)
- **repo_url** - Link to repository or project
- **created_at** / **updated_at** - Timestamps
- **Version history** - All changes tracked automatically

## Usage

### Adding Items

1. **Select a category** - Choose from 8 specialized categories
2. **Enter details**:
   - Title (required) and category (required)
   - Summary - brief one-line description
   - Body - full content with Markdown support
   - Tags - comma-separated keywords
   - Language and difficulty (for coding problems)
   - Repository URL (for projects)
3. **Submit** - Item is saved to database with auto-generated slug

### Viewing Items

- Items are automatically organized by category
- Each item shows:
  - Title and summary
  - Tags with color coding
  - Metadata badges (language, difficulty)
  - Creation date

### Searching

Use the search API to find items across all content:
```bash
curl "http://localhost:5000/api/search?q=algorithm"
```

### Work Sessions

- Click "Start Work Session" to begin tracking time
- Timer persists across page refreshes
- Click "Stop Work Session" to end and reset

## API Documentation

See `server/README.md` for complete API documentation including:

- `GET /api/categories` - List categories
- `GET /api/categories/:slug/items` - Items by category
- `POST /api/items` - Create item
- `GET /api/items/:slug` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/search?q=query` - Full-text search

## Technologies Used

### Frontend
- **React 19** - UI framework
- **Framer Motion** - Animation library
- **CSS3** - Modern styling with gradients

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **better-sqlite3** - Fast SQLite database
- **SQLite FTS5** - Full-text search
- **slugify** - URL slug generation
- **CORS** - Cross-origin resource sharing

### Database Schema

- **categories** - Content categories
- **tags** - Reusable tags
- **items** - Main content
- **item_tags** - Tag relationships
- **item_versions** - Version history
- **items_fts** - Full-text search index

## Screenshots

![Empty State](https://github.com/user-attachments/assets/1d8bc1a8-4f79-425c-a4de-29704bc70cef)
*Clean, simple interface ready for your knowledge items*

![With Items](https://github.com/user-attachments/assets/811bf657-5afa-4477-a9cd-37e8135a1fcd)
*Items organized by category with smooth animations*

## License

MIT

## Author

Created with ❤️ by yulian-symkanynets