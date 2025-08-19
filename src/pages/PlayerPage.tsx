import React, { useEffect, useState } from 'react';
import { useVideoUrl } from '../hooks/useContent';
import { analyticsAPI } from '../services/api';
import { Content, Episode } from '../types';
import VideoPlayer from '../components/Player';

interface PlayerPageProps {
  content: Content;
  episode?: Episode;
  onBack: () => void;
}

export default function PlayerPage({ content, episode, onBack }: PlayerPageProps) {
  const { videoInfo, isLoading, error } = useVideoUrl(
    episode ? undefined : content.id,
    episode?.id
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Track video play event
    if (videoInfo && !isLoading) {
      analyticsAPI.trackVideoEvent({
        event: 'play',
        contentId: content.id,
        episodeId: episode?.id,
        timestamp: Date.now()
      });
    }
  }, [videoInfo, isLoading, content.id, episode?.id]);

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
    analyticsAPI.trackVideoEvent({
      event: playing ? 'play' : 'pause',
      contentId: content.id,
      episodeId: episode?.id,
      timestamp: Date.now()
    });
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    // Record progress every 30 seconds or on significant changes
    if (Math.abs(newProgress - progress) > 0.05) {
      analyticsAPI.trackVideoEvent({
        event: 'seek',
        contentId: content.id,
        episodeId: episode?.id,
        timestamp: Date.now(),
        metadata: { progress: newProgress }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="player-loading">
        <h2>Loading video...</h2>
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  if (error || !videoInfo) {
    return (
      <div className="player-error">
        <h2>Unable to load video</h2>
        <p>{error || 'Video not found'}</p>
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  const title = episode 
    ? `${content.title} - ${episode.title}` 
    : content.title;

  return (
    <div className="player-page">
      <div className="player-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h1>{title}</h1>
      </div>

      <div className="player-container">
        <VideoPlayer
          url={videoInfo.url}
          type={videoInfo.type}
        />
      </div>

      <div className="player-info">
        <h2>{content.title}</h2>
        {episode && <h3>{episode.title}</h3>}
        <div className="player-meta">
          <span>{content.type}</span>
          <span>{content.genre}</span>
          <span>{content.releaseYear}</span>
        </div>
        {content.description && (
          <p className="player-description">{content.description}</p>
        )}
      </div>
    </div>
  );
}