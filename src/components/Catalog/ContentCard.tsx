import React from 'react';
import { Content } from '../../types';
import './Catalog.css';

interface ContentCardProps {
  content: Content;
  onPlay: (content: Content) => void;
  onAddToWatchlist?: (content: Content) => void;
  onAddToFavorites?: (content: Content) => void;
}

export default function ContentCard({
  content,
  onPlay,
  onAddToWatchlist,
  onAddToFavorites
}: ContentCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MOVIE': return '🎬';
      case 'SERIES': return '📺';
      case 'CHANNEL': return '📻';
      default: return '📽️';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="content-card">
      <div className="content-card-image">
        {content.posterUrl ? (
          <img
            src={content.posterUrl}
            alt={content.title}
            loading="lazy"
          />
        ) : (
          <div className="placeholder-image">
            <span className="type-icon">{getTypeIcon(content.type)}</span>
          </div>
        )}
        
        <div className="content-overlay">
          <button
            className="play-button"
            onClick={() => onPlay(content)}
            title="Play"
          >
            ▶️
          </button>
          
          <div className="action-buttons">
            {onAddToWatchlist && (
              <button
                className="action-button"
                onClick={() => onAddToWatchlist(content)}
                title="Add to Watchlist"
              >
                ➕
              </button>
            )}
            
            {onAddToFavorites && (
              <button
                className="action-button"
                onClick={() => onAddToFavorites(content)}
                title="Add to Favorites"
              >
                ❤️
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="content-card-info">
        <h3 className="content-title" title={content.title}>
          {content.title}
        </h3>
        
        <div className="content-meta">
          <span className="content-type">
            {getTypeIcon(content.type)} {content.type}
          </span>
          <span className="content-year">{content.releaseYear}</span>
          {content.duration && (
            <span className="content-duration">{formatDuration(content.duration)}</span>
          )}
        </div>
        
        <div className="content-genre">{content.genre}</div>
        
        {content.description && (
          <p className="content-description" title={content.description}>
            {content.description.length > 100
              ? `${content.description.substring(0, 100)}...`
              : content.description
            }
          </p>
        )}
      </div>
    </div>
  );
}