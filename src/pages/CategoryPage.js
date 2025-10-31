import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({
    language: '',
    difficulty: '',
    tag: '',
    search: ''
  });
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    fetchCategoryAndItems();
  }, [slug]);

  useEffect(() => {
    applyFilters();
  }, [items, filters]);

  const fetchCategoryAndItems = async () => {
    try {
      // Get category info
      const categoriesResponse = await fetch(`${API_URL}/categories`);
      const categories = await categoriesResponse.json();
      const currentCategory = categories.find(c => c.slug === slug);
      setCategory(currentCategory);

      // Get items in category
      const itemsResponse = await fetch(`${API_URL}/categories/${slug}/items?limit=100`);
      const data = await itemsResponse.json();
      setItems(data.items || []);

      // Extract unique languages and tags
      const languages = [...new Set(data.items.map(item => item.language).filter(Boolean))];
      const allTags = [...new Set(data.items.flatMap(item => item.tags || []))];
      setAvailableLanguages(languages);
      setAvailableTags(allTags);
    } catch (error) {
      console.error('Failed to fetch category items:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (filters.language) {
      filtered = filtered.filter(item => item.language === filters.language);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(item => item.difficulty === filters.difficulty);
    }

    if (filters.tag) {
      filtered = filtered.filter(item => 
        item.tags && item.tags.includes(filters.tag)
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        (item.summary && item.summary.toLowerCase().includes(searchLower))
      );
    }

    setFilteredItems(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      language: '',
      difficulty: '',
      tag: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  if (!category) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="category-page">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {category.name}
        </motion.h1>
        <p className="category-description">{category.description}</p>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search in this category..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>

          {availableLanguages.length > 0 && (
            <div className="filter-group">
              <label>Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="filter-select"
              >
                <option value="">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="filter-select"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {availableTags.length > 0 && (
            <div className="filter-group">
              <label>Tag</label>
              <select
                value={filters.tag}
                onChange={(e) => handleFilterChange('tag', e.target.value)}
                className="filter-select"
              >
                <option value="">All Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All Filters
          </button>
        )}
      </div>

      <div className="items-count">
        Showing {filteredItems.length} of {items.length} items
      </div>

      <div className="items-list">
        <AnimatePresence>
          {filteredItems.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No items found matching your filters.
            </motion.div>
          ) : (
            filteredItems.map(item => (
              <motion.div
                key={item.id}
                className="item-list-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                <Link to={`/item/${item.slug}`} className="item-list-link">
                  <div className="item-list-header">
                    <h3>{item.title}</h3>
                    <div className="item-list-meta-right">
                      {item.language && <span className="meta-badge">{item.language}</span>}
                      {item.difficulty && <span className="meta-badge difficulty">{item.difficulty}</span>}
                    </div>
                  </div>
                  {item.summary && <p className="item-list-summary">{item.summary}</p>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="item-tags">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="item-list-footer">
                    <span className="item-date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {item.repo_url && (
                      <span className="repo-indicator">🔗 Has Repo</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CategoryPage;
