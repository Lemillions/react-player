import axios, { AxiosResponse } from 'axios';
import {
  User,
  Content,
  Profile,
  WatchlistItem,
  FavoriteItem,
  WatchHistory,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ContentFilters,
  ContentResponse,
  VideoInfo,
  ApiResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/me');
    return response.data;
  },

  resetPassword: async (email: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};

// Content API
export const contentAPI = {
  getContent: async (filters: ContentFilters = {}): Promise<ContentResponse> => {
    const response: AxiosResponse<ContentResponse> = await api.get('/content', { params: filters });
    return response.data;
  },

  getContentById: async (id: string): Promise<ApiResponse<Content>> => {
    const response: AxiosResponse<ApiResponse<Content>> = await api.get(`/content/${id}`);
    return response.data;
  },

  getVideoUrl: async (id: string): Promise<ApiResponse<VideoInfo>> => {
    const response: AxiosResponse<ApiResponse<VideoInfo>> = await api.get(`/content/${id}/video`);
    return response.data;
  },

  getEpisodeVideoUrl: async (episodeId: string): Promise<ApiResponse<VideoInfo>> => {
    const response: AxiosResponse<ApiResponse<VideoInfo>> = await api.get(`/content/episode/${episodeId}/video`);
    return response.data;
  },

  getGenres: async (): Promise<ApiResponse<string[]>> => {
    const response: AxiosResponse<ApiResponse<string[]>> = await api.get('/content/metadata/genres');
    return response.data;
  },

  getYears: async (): Promise<ApiResponse<number[]>> => {
    const response: AxiosResponse<ApiResponse<number[]>> = await api.get('/content/metadata/years');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfiles: async (): Promise<ApiResponse<Profile[]>> => {
    const response: AxiosResponse<ApiResponse<Profile[]>> = await api.get('/user/profiles');
    return response.data;
  },

  createProfile: async (data: { name: string; isKid?: boolean; avatar?: string }): Promise<ApiResponse<Profile>> => {
    const response: AxiosResponse<ApiResponse<Profile>> = await api.post('/user/profiles', data);
    return response.data;
  },

  deleteProfile: async (profileId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/user/profiles/${profileId}`);
    return response.data;
  },

  getWatchlist: async (profileId?: string): Promise<ApiResponse<WatchlistItem[]>> => {
    const response: AxiosResponse<ApiResponse<WatchlistItem[]>> = await api.get('/user/watchlist', {
      params: { profileId }
    });
    return response.data;
  },

  addToWatchlist: async (contentId: string, profileId?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/user/watchlist', {
      contentId,
      profileId
    });
    return response.data;
  },

  removeFromWatchlist: async (itemId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/user/watchlist/${itemId}`);
    return response.data;
  },

  getFavorites: async (profileId?: string): Promise<ApiResponse<FavoriteItem[]>> => {
    const response: AxiosResponse<ApiResponse<FavoriteItem[]>> = await api.get('/user/favorites', {
      params: { profileId }
    });
    return response.data;
  },

  addToFavorites: async (contentId: string, profileId?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/user/favorites', {
      contentId,
      profileId
    });
    return response.data;
  },

  removeFromFavorites: async (itemId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/user/favorites/${itemId}`);
    return response.data;
  },

  recordWatchProgress: async (data: {
    contentId: string;
    progress: number;
    episodeId?: string;
    profileId?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/user/watch-progress', data);
    return response.data;
  },

  getWatchHistory: async (profileId?: string, limit?: number): Promise<ApiResponse<WatchHistory[]>> => {
    const response: AxiosResponse<ApiResponse<WatchHistory[]>> = await api.get('/user/watch-history', {
      params: { profileId, limit }
    });
    return response.data;
  },

  getRecommendations: async (profileId?: string, limit?: number): Promise<ApiResponse<Content[]>> => {
    const response: AxiosResponse<ApiResponse<Content[]>> = await api.get('/user/recommendations', {
      params: { profileId, limit }
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  trackVideoEvent: async (data: {
    event: 'play' | 'pause' | 'seek' | 'complete' | 'error';
    contentId: string;
    episodeId?: string;
    timestamp?: number;
    duration?: number;
    metadata?: any;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/analytics/video-event', data);
    return response.data;
  },

  trackEngagement: async (event: string, metadata?: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/analytics/engagement', {
      event,
      metadata
    });
    return response.data;
  },
};

export default api;