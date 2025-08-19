import React, { useState, useEffect } from 'react';
import { ContentFilters } from '../../types';
import { contentAPI } from '../../services/api';
import { MdSearch } from 'react-icons/md';
import './Catalog.css';

interface ContentFiltersProps {
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
}

export default function ContentFiltersComponent({ filters, onFiltersChange }: ContentFiltersProps) {
  const [genres, setGenres] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [genresResponse, yearsResponse] = await Promise.all([
          contentAPI.getGenres(),
          contentAPI.getYears()
        ]);

        if (genresResponse.success && genresResponse.data) {
          setGenres(genresResponse.data);
        }
        
        if (yearsResponse.success && yearsResponse.data) {
          setYears(yearsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchTerm.trim() || undefined });
  };

  const handleFilterChange = (key: keyof ContentFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  return (
    <div className="content-filters">
      <div className="search-section">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search for movies, series, or channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <MdSearch />
          </button>
        </form>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="type-filter">Type</label>
          <select
            id="type-filter"
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="MOVIE">Movies</option>
            <option value="SERIES">Series</option>
            <option value="CHANNEL">Channels</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="genre-filter">Genre</label>
          <select
            id="genre-filter"
            value={filters.genre || 'all'}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={filters.year || 'all'}
            onChange={(e) => handleFilterChange('year', e.target.value === 'all' ? undefined : Number(e.target.value))}
            className="filter-select"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button onClick={clearFilters} className="clear-filters-button">
          Clear Filters
        </button>
      </div>
    </div>
  );
}