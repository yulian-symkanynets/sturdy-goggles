const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// GET /api/categories - List all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:slug/items - List items in a category
router.get('/:slug/items', (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const category = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const items = db.prepare(`
      SELECT 
        i.id, i.title, i.slug, i.summary, i.language, i.difficulty, 
        i.repo_url, i.created_at, i.updated_at,
        GROUP_CONCAT(t.name) as tags
      FROM items i
      LEFT JOIN item_tags it ON i.id = it.item_id
      LEFT JOIN tags t ON it.tag_id = t.id
      WHERE i.category_id = ?
      GROUP BY i.id
      ORDER BY i.updated_at DESC
      LIMIT ? OFFSET ?
    `).all(category.id, limit, offset);

    // Parse tags from comma-separated string to array
    const itemsWithTags = items.map(item => ({
      ...item,
      tags: item.tags ? item.tags.split(',') : []
    }));

    const total = db.prepare('SELECT COUNT(*) as count FROM items WHERE category_id = ?').get(category.id).count;

    res.json({
      items: itemsWithTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
