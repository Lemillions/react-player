import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { Profile } from '../../types';
import './Auth.css';

interface ProfileSelectorProps {
  onProfileSelected: (profile: Profile | null) => void;
}

export default function ProfileSelector({ onProfileSelected }: ProfileSelectorProps) {
  const { state } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await userAPI.getProfiles();
        if (response.success && response.data) {
          setProfiles(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (state.isAuthenticated) {
      fetchProfiles();
    }
  }, [state.isAuthenticated]);

  const handleProfileSelect = (profile: Profile) => {
    onProfileSelected(profile);
  };

  const handleSkipProfile = () => {
    onProfileSelected(null);
  };

  const handleCreateProfile = async () => {
    const name = prompt('Enter profile name:');
    if (name && name.trim()) {
      try {
        const response = await userAPI.createProfile({ name: name.trim() });
        if (response.success && response.data) {
          setProfiles([...profiles, response.data]);
        }
      } catch (error) {
        console.error('Failed to create profile:', error);
        alert('Failed to create profile');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="profile-selector">
        <h2>Loading profiles...</h2>
      </div>
    );
  }

  return (
    <div className="profile-selector">
      <h2>Who's watching?</h2>
      
      <div className="profiles-grid">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="profile-card"
            onClick={() => handleProfileSelect(profile)}
          >
            <div className="profile-avatar">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="profile-name">{profile.name}</div>
          </div>
        ))}
        
        {profiles.length < 5 && (
          <div
            className="profile-card add-profile-card"
            onClick={handleCreateProfile}
          >
            <div>+</div>
            <div style={{ fontSize: '0.9rem' }}>Add Profile</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          className="link-button"
          onClick={handleSkipProfile}
        >
          Continue without profile
        </button>
      </div>
    </div>
  );
}