import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const categoryLabels = {
  technology: '💻 Technology',
  leetcode: '🧩 LeetCode Problem',
  project: '🚀 Pet Project',
  skill: '✨ Skill',
  other: '📝 Other'
};

function App() {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: ''
  });

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('knowledgeItems');
    if (savedItems) {
      try {
        setKnowledgeItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Failed to parse saved items:', error);
        // Clear corrupted data
        localStorage.removeItem('knowledgeItems');
      }
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('knowledgeItems', JSON.stringify(knowledgeItems));
  }, [knowledgeItems]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title) {
      return;
    }

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      date: new Date().toLocaleDateString()
    };

    setKnowledgeItems([...knowledgeItems, newItem]);
    setFormData({ category: '', title: '', description: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        className="add-section"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category...</option>
              <option value="technology">💻 Technology</option>
              <option value="leetcode">🧩 LeetCode Problem</option>
              <option value="project">🚀 Pet Project</option>
              <option value="skill">✨ Skill</option>
              <option value="other">📝 Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
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
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add details, notes, or links..."
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
                <h3>{categoryLabels[category]}</h3>
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
                        {item.description && (
                          <div className="item-description">{item.description}</div>
                        )}
                        <div className="item-date">Added on {item.date}</div>
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
