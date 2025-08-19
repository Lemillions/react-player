import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MdArrowDropDown } from 'react-icons/md';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Layout({ children, onNavigate, currentPage }: LayoutProps) {
  const { state, logout, setCurrentProfile } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('auth');
  };

  const handleProfileChange = () => {
    setCurrentProfile(null);
    onNavigate('profiles');
  };

  return (
    <div className="app-layout">
      {state.isAuthenticated && (
        <header className="app-header">
          <div className="header-content">
            <div className="logo" onClick={() => onNavigate('catalog')}>
              <h1>StreamPlatform</h1>
            </div>

            <nav className="main-nav">
              <button
                className={currentPage === 'catalog' ? 'nav-button active' : 'nav-button'}
                onClick={() => onNavigate('catalog')}
              >
                Browse
              </button>
              <button
                className={currentPage === 'watchlist' ? 'nav-button active' : 'nav-button'}
                onClick={() => onNavigate('watchlist')}
              >
                My List
              </button>
              {state.user?.role === 'ADMIN' && (
                <button
                  className={currentPage === 'admin' ? 'nav-button active' : 'nav-button'}
                  onClick={() => onNavigate('admin')}
                >
                  Admin
                </button>
              )}
            </nav>

            <div className="user-menu">
              {state.currentProfile && (
                <div className="current-profile">
                  <span className="profile-avatar">
                    {state.currentProfile.avatar ? (
                      <img src={state.currentProfile.avatar} alt={state.currentProfile.name} />
                    ) : (
                      state.currentProfile.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="profile-name">{state.currentProfile.name}</span>
                </div>
              )}
              
              <div className="user-dropdown">
                <button className="user-button">
                  {state.user?.name} <MdArrowDropDown />
                </button>
                <div className="dropdown-menu">
                  <button onClick={handleProfileChange}>Switch Profile</button>
                  <button onClick={() => onNavigate('profiles')}>Manage Profiles</button>
                  <hr />
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={state.isAuthenticated ? 'app-main with-header' : 'app-main'}>
        {children}
      </main>
    </div>
  );
}