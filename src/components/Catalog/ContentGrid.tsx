import React from 'react';
import { Content } from '../../types';
import ContentCard from './ContentCard';
import './Catalog.css';

interface ContentGridProps {
  content: Content[];
  isLoading: boolean;
  error: string | null;
  onPlay: (content: Content) => void;
  onAddToWatchlist?: (content: Content) => void;
  onAddToFavorites?: (content: Content) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ContentGrid({
  content,
  isLoading,
  error,
  onPlay,
  onAddToWatchlist,
  onAddToFavorites,
  onLoadMore,
  hasMore
}: ContentGridProps) {
  if (error) {
    return (
      <div className="error-state">
        <h3>Error loading content</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!isLoading && content.length === 0) {
    return (
      <div className="empty-state">
        <h3>No content found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="content-grid-container">
      <div className="content-grid">
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            onPlay={onPlay}
            onAddToWatchlist={onAddToWatchlist}
            onAddToFavorites={onAddToFavorites}
          />
        ))}
        
        {isLoading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="content-card skeleton">
                <div className="content-card-image skeleton-image"></div>
                <div className="content-card-info">
                  <div className="skeleton-text skeleton-title"></div>
                  <div className="skeleton-text skeleton-meta"></div>
                  <div className="skeleton-text skeleton-description"></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      {!isLoading && hasMore && onLoadMore && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={onLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}