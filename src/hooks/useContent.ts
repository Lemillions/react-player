import { useState, useEffect } from 'react';
import { Content, ContentFilters, PaginationInfo } from '../types';
import { contentAPI } from '../services/api';

export function useContent(initialFilters: ContentFilters = {}) {
  const [content, setContent] = useState<Content[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<ContentFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async (newFilters?: ContentFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filtersToUse = newFilters || filters;
      const response = await contentAPI.getContent(filtersToUse);
      
      if (response.success) {
        setContent(response.content);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch content');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: ContentFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchContent(updatedFilters);
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPageFilters = { ...filters, page: pagination.page + 1 };
      setFilters(nextPageFilters);
      fetchContent(nextPageFilters);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    loadMore,
    refresh: fetchContent
  };
}

export function useContentDetails(contentId: string) {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContentDetails = async () => {
    if (!contentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await contentAPI.getContentById(contentId);
      if (response.success && response.data) {
        setContent(response.data);
      } else {
        setError('Content not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContentDetails();
  }, [contentId]);

  return {
    content,
    isLoading,
    error,
    refresh: fetchContentDetails
  };
}

export function useVideoUrl(contentId?: string, episodeId?: string) {
  const [videoInfo, setVideoInfo] = useState<{ url: string; type: 'hls' | 'dash' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoUrl = async () => {
    if (!contentId && !episodeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      if (episodeId) {
        response = await contentAPI.getEpisodeVideoUrl(episodeId);
      } else if (contentId) {
        response = await contentAPI.getVideoUrl(contentId);
      } else {
        throw new Error('Either contentId or episodeId is required');
      }
      
      if (response.success && response.data) {
        setVideoInfo({
          url: response.data.url,
          type: response.data.type
        });
      } else {
        setError('Video not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoUrl();
  }, [contentId, episodeId]);

  return {
    videoInfo,
    isLoading,
    error,
    refresh: fetchVideoUrl
  };
}