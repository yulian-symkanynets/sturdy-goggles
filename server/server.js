const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/init');

// Initialize database
initDatabase();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/items', require('./routes/items'));
app.use('/api/search', require('./routes/search'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Knowledge Base API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET  /api/categories`);
  console.log(`  - GET  /api/categories/:slug/items`);
  console.log(`  - POST /api/items`);
  console.log(`  - GET  /api/items/:slug`);
  console.log(`  - PUT  /api/items/:id`);
  console.log(`  - DELETE /api/items/:id`);
  console.log(`  - GET  /api/search?q=query`);
});

module.exports = app;
