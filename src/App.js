import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    summary: '',
    body: '',
    tags: '',
    language: '',
    difficulty: '',
    repo_url: ''
  });
  const [workSession, setWorkSession] = useState({
    isActive: false,
    startTime: null,
    elapsedSeconds: 0
  });

  // Load categories and items from API on mount
  useEffect(() => {
    fetchCategories();
    fetchAllItems();

    // Load work session from localStorage
    const savedSession = localStorage.getItem('workSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.isActive && session.startTime) {
          // Calculate elapsed time if session was active
          const now = Date.now();
          const elapsed = Math.floor((now - session.startTime) / 1000);
          setWorkSession({
            isActive: true,
            startTime: session.startTime,
            elapsedSeconds: elapsed
          });
        }
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('workSession');
      }
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch all items from API
  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const categoriesData = await response.json();
      
      const allItems = [];
      for (const category of categoriesData) {
        const itemsResponse = await fetch(`${API_URL}/categories/${category.slug}/items`);
        const itemsData = await itemsResponse.json();
        if (itemsData.items && itemsData.items.length > 0) {
          allItems.push(...itemsData.items.map(item => ({
            ...item,
            category: category.slug,
            categoryName: category.name
          })));
        }
      }
      setKnowledgeItems(allItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };



  // Save work session to localStorage when isActive or startTime changes (not on every second)
  useEffect(() => {
    const sessionToSave = {
      isActive: workSession.isActive,
      startTime: workSession.startTime
    };
    localStorage.setItem('workSession', JSON.stringify(sessionToSave));
  }, [workSession.isActive, workSession.startTime]);

  // Timer effect - updates every second when active
  useEffect(() => {
    let interval = null;
    if (workSession.isActive && workSession.startTime) {
      interval = setInterval(() => {
        setWorkSession(prev => ({
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000)
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // We intentionally use prev.startTime inside the callback to avoid recreating interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workSession.isActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.title) {
      alert('Please fill in at least the title and category');
      return;
    }

    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          category_id: parseInt(formData.category_id)
        }),
      });

      if (response.ok) {
        // Refresh items after successful creation
        await fetchAllItems();
        setFormData({
          category_id: '',
          title: '',
          summary: '',
          body: '',
          tags: '',
          language: '',
          difficulty: '',
          repo_url: ''
        });
      } else {
        const error = await response.json();
        alert(`Failed to create item: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create item. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_URL}/items/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchAllItems();
        } else {
          alert('Failed to delete item');
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStartWorkSession = () => {
    const startTime = Date.now();
    setWorkSession({
      isActive: true,
      startTime: startTime,
      elapsedSeconds: 0
    });
  };

  const handleStopWorkSession = () => {
    setWorkSession({
      isActive: false,
      startTime: null,
      elapsedSeconds: 0
    });
  };

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group items by category
  const groupedItems = knowledgeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="container">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📚 My Knowledge Base
      </motion.h1>

      <motion.div
        className="work-session-section"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2>⏱️ Work Session Timer</h2>
        <div className="timer-container">
          <div className={`timer-display ${workSession.isActive ? 'active' : ''}`}>
            {formatTime(workSession.elapsedSeconds)}
          </div>
          <div className="timer-controls">
            {!workSession.isActive ? (
              <motion.button
                className="start-btn"
                onClick={handleStartWorkSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Work Session
              </motion.button>
            ) : (
              <motion.button
                className="stop-btn"
                onClick={handleStopWorkSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Stop Work Session
              </motion.button>
            )}
          </div>
          {workSession.isActive && (
            <motion.div
              className="session-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              🟢 Session in progress
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="add-section"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category_id">Category *</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., React.js, Two Sum, Portfolio Website"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="summary">Summary (One-line description)</label>
            <input
              type="text"
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Brief one-line summary"
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Body (Markdown)</label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="## Problem&#10;Describe the problem...&#10;&#10;## Solution&#10;Explain your approach...&#10;&#10;```python&#10;# Code here&#10;```"
              rows="8"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="e.g., Python, JavaScript"
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="">Select difficulty...</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., array, hashmap, dynamic-programming"
            />
          </div>

          <div className="form-group">
            <label htmlFor="repo_url">Repository URL</label>
            <input
              type="url"
              id="repo_url"
              name="repo_url"
              value={formData.repo_url}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Knowledge Base
          </motion.button>
        </form>
      </motion.div>

      <div className="items-section">
        <AnimatePresence>
          {knowledgeItems.length === 0 ? (
            <motion.div
              className="category-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="empty-state">
                No items yet. Start adding to your knowledge base!
              </div>
            </motion.div>
          ) : (
            Object.keys(groupedItems).map((category) => (
              <motion.div
                key={category}
                className="category-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h3>{groupedItems[category][0]?.categoryName || category}</h3>
                <AnimatePresence>
                  {groupedItems[category].map((item) => (
                    <motion.div
                      key={item.id}
                      className="item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="item-content">
                        <div className="item-title">{item.title}</div>
                        {item.summary && (
                          <div className="item-summary">{item.summary}</div>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="item-tags">
                            {item.tags.map((tag, idx) => (
                              <span key={idx} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="item-meta">
                          {item.language && <span className="meta-badge">{item.language}</span>}
                          {item.difficulty && <span className="meta-badge difficulty">{item.difficulty}</span>}
                          {item.created_at && (
                            <span className="item-date">
                              Added {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Delete
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
