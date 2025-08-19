import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../hooks/useContent';
import { userAPI } from '../services/api';
import { Content } from '../types';
import ContentFilters from '../components/Catalog/ContentFilters';
import ContentGrid from '../components/Catalog/ContentGrid';
import '../components/Catalog/Catalog.css';

interface CatalogPageProps {
  onPlayContent: (content: Content) => void;
}

export default function CatalogPage({ onPlayContent }: CatalogPageProps) {
  const { state } = useAuth();
  const { content, pagination, filters, isLoading, error, updateFilters, loadMore } = useContent();
  const [actionMessage, setActionMessage] = useState<string>('');

  const handlePlay = (content: Content) => {
    onPlayContent(content);
  };

  const handleAddToWatchlist = async (content: Content) => {
    try {
      await userAPI.addToWatchlist(content.id, state.currentProfile?.id);
      setActionMessage(`"${content.title}" added to watchlist!`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error: any) {
      setActionMessage(error.response?.data?.message || 'Failed to add to watchlist');
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const handleAddToFavorites = async (content: Content) => {
    try {
      await userAPI.addToFavorites(content.id, state.currentProfile?.id);
      setActionMessage(`"${content.title}" added to favorites!`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error: any) {
      setActionMessage(error.response?.data?.message || 'Failed to add to favorites');
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const hasMore = pagination.page < pagination.totalPages;

  return (
    <div className="catalog-page">
      <div className="page-header">
        <h1>Browse Content</h1>
        <p>Discover movies, series, and channels</p>
      </div>

      {actionMessage && (
        <div className="action-message">
          {actionMessage}
          <button onClick={() => setActionMessage('')}>×</button>
        </div>
      )}

      <ContentFilters
        filters={filters}
        onFiltersChange={updateFilters}
      />

      <div className="results-info">
        {!isLoading && content.length > 0 && (
          <p>
            Showing {content.length} of {pagination.total} results
            {filters.search && ` for "${filters.search}"`}
          </p>
        )}
      </div>

      <ContentGrid
        content={content}
        isLoading={isLoading}
        error={error}
        onPlay={handlePlay}
        onAddToWatchlist={state.isAuthenticated ? handleAddToWatchlist : undefined}
        onAddToFavorites={state.isAuthenticated ? handleAddToFavorites : undefined}
        onLoadMore={hasMore ? loadMore : undefined}
        hasMore={hasMore}
      />
    </div>
  );
}