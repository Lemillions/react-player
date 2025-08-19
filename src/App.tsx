import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import AuthPage from './pages/AuthPage';
import CatalogPage from './pages/CatalogPage';
import PlayerPage from './pages/PlayerPage';
import ProfileSelector from './components/Auth/ProfileSelector';
import { Content, Episode, Profile } from './types';
import './App.css';

function AppContent() {
  const { state, setCurrentProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState('catalog');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Handle authentication state changes
  useEffect(() => {
    if (!state.isAuthenticated) {
      setCurrentPage('auth');
      setShowProfileSelector(false);
    } else if (state.profiles.length > 0 && !state.currentProfile) {
      setShowProfileSelector(true);
    } else {
      setShowProfileSelector(false);
      if (currentPage === 'auth') {
        setCurrentPage('catalog');
      }
    }
  }, [state.isAuthenticated, state.profiles.length, state.currentProfile, currentPage]);

  const handleNavigate = (page: string) => {
    if (page === 'profiles') {
      setShowProfileSelector(true);
    } else {
      setCurrentPage(page);
      setShowProfileSelector(false);
    }
  };

  const handlePlayContent = (content: Content, episode?: Episode) => {
    setSelectedContent(content);
    setSelectedEpisode(episode || null);
    setCurrentPage('player');
  };

  const handleBackFromPlayer = () => {
    setSelectedContent(null);
    setSelectedEpisode(null);
    setCurrentPage('catalog');
  };

  const handleProfileSelected = (profile: Profile | null) => {
    setCurrentProfile(profile);
    setShowProfileSelector(false);
    if (currentPage === 'auth') {
      setCurrentPage('catalog');
    }
  };

  // Show authentication page if not authenticated
  if (!state.isAuthenticated) {
    return <AuthPage />;
  }

  // Show profile selector if needed
  if (showProfileSelector) {
    return <ProfileSelector onProfileSelected={handleProfileSelected} />;
  }

  // Show player page
  if (currentPage === 'player' && selectedContent) {
    return (
      <PlayerPage
        content={selectedContent}
        episode={selectedEpisode || undefined}
        onBack={handleBackFromPlayer}
      />
    );
  }

  // Show main app with layout
  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'catalog' && (
        <CatalogPage onPlayContent={handlePlayContent} />
      )}
      {currentPage === 'watchlist' && (
        <div className="page-content">
          <div className="page-header">
            <h1>My Watchlist</h1>
            <p>Your saved content for later</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>Watchlist feature coming soon!</p>
            <button 
              onClick={() => handleNavigate('catalog')}
              style={{ 
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Browse Content
            </button>
          </div>
        </div>
      )}
      {currentPage === 'admin' && state.user?.role === 'ADMIN' && (
        <div className="page-content">
          <div className="page-header">
            <h1>Admin Dashboard</h1>
            <p>Manage content and users</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>Admin panel coming soon!</p>
            <p>This will include content management, user analytics, and system monitoring.</p>
          </div>
        </div>
      )}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
