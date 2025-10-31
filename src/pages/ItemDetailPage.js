import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ItemDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [slug]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`${API_URL}/items/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      } else {
        console.error('Item not found');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_URL}/items/${item.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          navigate('/');
        } else {
          alert('Failed to delete item');
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="item-detail-page">
      <div className="detail-header">
        <Link to={`/category/${item.category_slug}`} className="back-link">
          ← Back to {item.category_name}
        </Link>
        
        <div className="detail-actions">
          <button onClick={copyLink} className="action-btn copy-btn">
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button onClick={handleDelete} className="action-btn delete-btn">
            🗑️ Delete
          </button>
        </div>
      </div>

      <motion.div
        className="detail-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="detail-title">{item.title}</h1>

        {item.summary && (
          <div className="detail-summary">
            <strong>Summary:</strong> {item.summary}
          </div>
        )}

        <div className="detail-metadata">
          <div className="metadata-row">
            {item.category_name && (
              <span className="metadata-item">
                <strong>Category:</strong> {item.category_name}
              </span>
            )}
            {item.language && (
              <span className="metadata-item">
                <strong>Language:</strong> 
                <span className="meta-badge">{item.language}</span>
              </span>
            )}
            {item.difficulty && (
              <span className="metadata-item">
                <strong>Difficulty:</strong> 
                <span className="meta-badge difficulty">{item.difficulty}</span>
              </span>
            )}
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="metadata-row">
              <strong>Tags:</strong>
              <div className="item-tags">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag.name || tag}</span>
                ))}
              </div>
            </div>
          )}

          {item.repo_url && (
            <div className="metadata-row">
              <strong>Repository:</strong> 
              <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="repo-link">
                {item.repo_url}
              </a>
            </div>
          )}

          <div className="metadata-row timestamps">
            <span className="timestamp">
              <strong>Created:</strong> {new Date(item.created_at).toLocaleString()}
            </span>
            <span className="timestamp">
              <strong>Updated:</strong> {new Date(item.updated_at).toLocaleString()}
            </span>
          </div>
        </div>

        {item.body && (
          <div className="detail-body">
            <h2>Details</h2>
            <div className="markdown-content">
              <ReactMarkdown>{item.body}</ReactMarkdown>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ItemDetailPage;
