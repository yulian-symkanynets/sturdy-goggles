const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const { db } = require('../db/init');

// Helper function to get or create tags
function getOrCreateTags(tagNames) {
  const tagIds = [];
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
  const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');

  for (const tagName of tagNames) {
    insertTag.run(tagName);
    const tag = getTag.get(tagName);
    tagIds.push(tag.id);
  }

  return tagIds;
}

// Helper function to get item with tags
function getItemWithTags(slug) {
  const item = db.prepare(`
    SELECT 
      i.id, i.title, i.slug, i.category_id, i.summary, i.body, 
      i.language, i.difficulty, i.repo_url, i.created_at, i.updated_at,
      c.name as category_name, c.slug as category_slug
    FROM items i
    JOIN categories c ON i.category_id = c.id
    WHERE i.slug = ?
  `).get(slug);

  if (!item) return null;

  const tags = db.prepare(`
    SELECT t.id, t.name
    FROM tags t
    JOIN item_tags it ON t.id = it.tag_id
    WHERE it.item_id = ?
  `).all(item.id);

  return { ...item, tags };
}

// POST /api/items - Create a new item
router.post('/', (req, res) => {
  try {
    const { title, category_id, summary, body, tags = [], language, difficulty, repo_url } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ error: 'Title and category_id are required' });
    }

    // Generate slug from title
    let slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug exists and make it unique if needed
    let slugExists = db.prepare('SELECT id FROM items WHERE slug = ?').get(slug);
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
      slugExists = db.prepare('SELECT id FROM items WHERE slug = ?').get(slug);
      counter++;
    }

    // Insert item
    const insertItem = db.prepare(`
      INSERT INTO items (title, slug, category_id, summary, body, language, difficulty, repo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertItem.run(title, slug, category_id, summary, body, language, difficulty, repo_url);
    const itemId = result.lastInsertRowid;

    // Insert tags
    if (tags.length > 0) {
      const tagIds = getOrCreateTags(tags);
      const insertItemTag = db.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)');
      const insertMany = db.transaction((itemId, tagIds) => {
        for (const tagId of tagIds) {
          insertItemTag.run(itemId, tagId);
        }
      });
      insertMany(itemId, tagIds);
    }

    // Create initial version
    const insertVersion = db.prepare(`
      INSERT INTO item_versions (item_id, title, body, note)
      VALUES (?, ?, ?, ?)
    `);
    insertVersion.run(itemId, title, body, 'Initial version');

    const newItem = getItemWithTags(slug);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/items/:slug - Get a single item by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const item = getItemWithTags(slug);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/items/:id - Update an item
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, body, tags = [], language, difficulty, repo_url } = req.body;

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update slug if title changed
    let slug = existingItem.slug;
    if (title && title !== existingItem.title) {
      slug = slugify(title, { lower: true, strict: true });
      let slugExists = db.prepare('SELECT id FROM items WHERE slug = ? AND id != ?').get(slug, id);
      let counter = 1;
      while (slugExists) {
        slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
        slugExists = db.prepare('SELECT id FROM items WHERE slug = ? AND id != ?').get(slug, id);
        counter++;
      }
    }

    // Update item
    const updateItem = db.prepare(`
      UPDATE items 
      SET title = COALESCE(?, title),
          slug = ?,
          summary = COALESCE(?, summary),
          body = COALESCE(?, body),
          language = COALESCE(?, language),
          difficulty = COALESCE(?, difficulty),
          repo_url = COALESCE(?, repo_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateItem.run(title, slug, summary, body, language, difficulty, repo_url, id);

    // Update tags
    db.prepare('DELETE FROM item_tags WHERE item_id = ?').run(id);
    if (tags.length > 0) {
      const tagIds = getOrCreateTags(tags);
      const insertItemTag = db.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)');
      const insertMany = db.transaction((itemId, tagIds) => {
        for (const tagId of tagIds) {
          insertItemTag.run(itemId, tagId);
        }
      });
      insertMany(id, tagIds);
    }

    // Create version entry
    const insertVersion = db.prepare(`
      INSERT INTO item_versions (item_id, title, body, note)
      VALUES (?, ?, ?, ?)
    `);
    insertVersion.run(id, title || existingItem.title, body || existingItem.body, 'Updated');

    const updatedItem = getItemWithTags(slug);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
