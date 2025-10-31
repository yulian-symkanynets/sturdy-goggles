const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const dbPath = path.join(__dirname, 'knowledge-base.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initDatabase() {
  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  // Tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id INTEGER NOT NULL,
      summary TEXT,
      body TEXT,
      language TEXT,
      difficulty TEXT,
      repo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Item-Tags junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_tags (
      item_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Item versions table for history
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);

  // Create full-text search virtual table
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
      title,
      summary,
      body,
      content='items',
      content_rowid='id'
    )
  `);

  // Triggers to keep FTS in sync
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
      INSERT INTO items_fts(rowid, title, summary, body)
      VALUES (new.id, new.title, new.summary, new.body);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, title, summary, body)
      VALUES('delete', old.id, old.title, old.summary, old.body);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
      INSERT INTO items_fts(items_fts, rowid, title, summary, body)
      VALUES('delete', old.id, old.title, old.summary, old.body);
      INSERT INTO items_fts(rowid, title, summary, body)
      VALUES (new.id, new.title, new.summary, new.body);
    END
  `);

  // Insert default categories
  const categories = [
    { slug: 'leetcode', name: '🧩 LeetCode Problem', description: 'Problem statement, solution, complexity, tags, links' },
    { slug: 'algorithm', name: '📊 Algorithm', description: 'Explanation, use-cases, pseudocode, complexity' },
    { slug: 'project', name: '🚀 Pet Project', description: 'Project description, tech stack, architecture, repo link, run instructions' },
    { slug: 'technology', name: '💻 Technology', description: 'Short guides, pros/cons, example usage, snippets' },
    { slug: 'db-backend', name: '🗄️ DB & Backend', description: 'DB schema, migrations, API examples, deployment notes' },
    { slug: 'article', name: '📝 Article', description: 'Long-form posts, tutorials, retrospectives' },
    { slug: 'skill', name: '✨ Skill', description: 'General skills and competencies' },
    { slug: 'other', name: '📌 Other', description: 'Anything else you want to track' }
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (slug, name, description) VALUES (?, ?, ?)');
  const insertMany = db.transaction((cats) => {
    for (const cat of cats) {
      insertCategory.run(cat.slug, cat.name, cat.description);
    }
  });

  insertMany(categories);

  console.log('Database initialized successfully');
}

module.exports = { db, initDatabase };
