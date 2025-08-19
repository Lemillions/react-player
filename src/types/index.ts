// API Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  profiles?: Profile[];
}

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  isKid: boolean;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: 'MOVIE' | 'SERIES' | 'CHANNEL';
  genre: string;
  releaseYear: number;
  duration?: number;
  posterUrl?: string;
  backdropUrl?: string;
  videoType: 'HLS' | 'DASH';
  createdAt: string;
  seasons?: Season[];
  episodes?: Episode[];
}

export interface Season {
  id: string;
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description?: string;
  duration: number;
  videoType: 'HLS' | 'DASH';
}

export interface WatchlistItem {
  id: string;
  addedAt: string;
  content: Content;
}

export interface FavoriteItem {
  id: string;
  addedAt: string;
  content: Content;
}

export interface WatchHistory {
  id: string;
  progress: number;
  watchedAt: string;
  completed: boolean;
  content: Content;
  episode?: Episode;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface ContentFilters {
  type?: 'MOVIE' | 'SERIES' | 'CHANNEL';
  genre?: string;
  search?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContentResponse {
  success: boolean;
  content: Content[];
  pagination: PaginationInfo;
}

export interface VideoInfo {
  id: string;
  title: string;
  url: string;
  type: 'hls' | 'dash';
}