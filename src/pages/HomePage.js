import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRecentItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchRecentItems = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const categoriesData = await response.json();
      
      const allItems = [];
      for (const category of categoriesData.slice(0, 3)) {
        const itemsResponse = await fetch(`${API_URL}/categories/${category.slug}/items?limit=3`);
        const itemsData = await itemsResponse.json();
        if (itemsData.items && itemsData.items.length > 0) {
          allItems.push(...itemsData.items.map(item => ({
            ...item,
            category: category.slug,
            categoryName: category.name
          })));
        }
      }
      setRecentItems(allItems.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch recent items:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="home-page">
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-icon">📚</div>
        <h1>My Knowledge Base</h1>
        <p className="hero-subtitle">Your personal repository for coding problems, algorithms, and tech notes</p>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search your knowledge base..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {isSearching && searchResults.length > 0 && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {searchResults.map(item => (
              <Link
                key={item.id}
                to={`/item/${item.slug}`}
                className="search-result-item"
              >
                <div className="search-result-title">{item.title}</div>
                <div className="search-result-summary">{item.summary}</div>
                <div className="search-result-category">{item.category_name}</div>
              </Link>
            ))}
          </motion.div>
        )}
      </motion.div>

      <div className="categories-grid">
        <h2>Categories</h2>
        <div className="category-cards">
          {categories.map(category => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={`/category/${category.slug}`} className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {recentItems.length > 0 && (
        <div className="recent-items">
          <h2>Recent Items</h2>
          <div className="items-grid">
            {recentItems.map(item => (
              <motion.div
                key={item.id}
                className="item-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link to={`/item/${item.slug}`} className="item-card-link">
                  <div className="item-card-header">
                    <h3>{item.title}</h3>
                    <span className="item-category-badge">{item.categoryName}</span>
                  </div>
                  {item.summary && <p className="item-card-summary">{item.summary}</p>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="item-tags">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="item-card-meta">
                    {item.language && <span className="meta-badge">{item.language}</span>}
                    {item.difficulty && <span className="meta-badge difficulty">{item.difficulty}</span>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="cta-section">
        <Link to="/add" className="cta-button">
          + Add New Item
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
