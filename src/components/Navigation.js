import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navigation.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          📚 Knowledge Base
        </Link>

        <button 
          className={`burger-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                className="nav-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMenu}
              />
              <motion.div
                className="nav-menu"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
              >
                <div className="nav-menu-header">
                  <h2>Menu</h2>
                  <button className="close-btn" onClick={closeMenu}>✕</button>
                </div>

                <div className="nav-menu-content">
                  <div className="nav-section">
                    <h3>Main</h3>
                    <Link 
                      to="/" 
                      className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      <span className="nav-icon">🏠</span>
                      Home
                    </Link>
                    <Link 
                      to="/add" 
                      className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      <span className="nav-icon">➕</span>
                      Add New Item
                    </Link>
                  </div>

                  <div className="nav-section">
                    <h3>Categories</h3>
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className={`nav-link ${location.pathname === `/category/${category.slug}` ? 'active' : ''}`}
                        onClick={closeMenu}
                      >
                        <span className="nav-icon">{category.name.split(' ')[0]}</span>
                        {category.name.split(' ').slice(1).join(' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navigation;
