import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ItemDetailPage from './pages/ItemDetailPage';
import AddItemPage from './pages/AddItemPage';
import WorkTimer from './components/WorkTimer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <WorkTimer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/item/:slug" element={<ItemDetailPage />} />
          <Route path="/add" element={<AddItemPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
