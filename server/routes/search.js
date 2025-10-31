const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// GET /api/search?q=query - Full-text search across items
router.get('/', (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const offset = (page - 1) * limit;

    // Perform full-text search using FTS5
    const results = db.prepare(`
      SELECT 
        i.id, i.title, i.slug, i.summary, i.language, i.difficulty, 
        i.repo_url, i.created_at, i.updated_at,
        c.name as category_name, c.slug as category_slug,
        GROUP_CONCAT(t.name) as tags
      FROM items_fts
      JOIN items i ON items_fts.rowid = i.id
      JOIN categories c ON i.category_id = c.id
      LEFT JOIN item_tags it ON i.id = it.item_id
      LEFT JOIN tags t ON it.tag_id = t.id
      WHERE items_fts MATCH ?
      GROUP BY i.id
      ORDER BY rank
      LIMIT ? OFFSET ?
    `).all(q, limit, offset);

    // Parse tags from comma-separated string to array
    const resultsWithTags = results.map(result => ({
      ...result,
      tags: result.tags ? result.tags.split(',') : []
    }));

    // Get total count
    const total = db.prepare(`
      SELECT COUNT(*) as count
      FROM items_fts
      WHERE items_fts MATCH ?
    `).get(q).count;

    res.json({
      results: resultsWithTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      query: q
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
