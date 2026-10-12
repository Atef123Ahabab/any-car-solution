import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import '../Styles/styles/SearchHistory.css';

const SearchHistory = ({ userId, onSearchSelect }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (userId && showHistory) {
      fetchSearchHistory();
    }
  }, [userId, showHistory]);

  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/search-history/${userId}?limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setSearchHistory(data.searchHistory);
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemClick = (historyItem) => {
    if (onSearchSelect) {
      onSearchSelect({
        query: historyItem.searchQuery,
        filters: historyItem.searchFilters
      });
    }
    setShowHistory(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!userId) return null;

  return (
    <div className="search-history-container">
      <button 
        className="history-toggle-btn"
        onClick={() => setShowHistory(!showHistory)}
      >
        📋 Search History
      </button>

      {showHistory && (
        <div className="search-history-dropdown">
          <div className="history-header">
            <h4>Recent Searches</h4>
            <button 
              className="close-history-btn"
              onClick={() => setShowHistory(false)}
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="history-loading">Loading...</div>
          ) : searchHistory.length === 0 ? (
            <div className="no-history">
              <p>No search history yet</p>
            </div>
          ) : (
            <div className="history-list">
              {searchHistory.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <div className="history-query">
                    {item.searchQuery || 'Location search'}
                  </div>
                  <div className="history-details">
                    {item.searchFilters?.location && (
                      <span className="filter-tag">📍 {item.searchFilters.location}</span>
                    )}
                    {item.searchFilters?.carType && (
                      <span className="filter-tag">🚗 {item.searchFilters.carType}</span>
                    )}
                    <span className="results-count">{item.resultsCount} results</span>
                  </div>
                  <div className="history-date">
                    {formatDate(item.searchTimestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
