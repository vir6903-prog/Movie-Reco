import React, { useState } from 'react';
import { Movie } from '../types';
import { Film, Search, Star, Trash2, Edit2, CheckCircle2, Bookmark, Calendar, X, Save, Edit3, MessageCircle, Filter } from 'lucide-react';
import { AVAILABLE_GENRES } from '../data/initialMovies';

interface HistoryListProps {
  movies: Movie[];
  onDeleteMovie: (id: string) => void;
  onUpdateMovie: (id: string, updated: Partial<Movie>) => void;
}

export default function HistoryList({ movies, onDeleteMovie, onUpdateMovie }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'watched' | 'plan-to-watch'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(8);
  const [editReview, setEditReview] = useState('');

  // Settle moving from Watchlist to Watched state inline
  const [watchedPromoId, setWatchedPromoId] = useState<string | null>(null);
  const [promoRating, setPromoRating] = useState<number>(8);
  const [promoReview, setPromoReview] = useState<string>('');

  const startEditing = (movie: Movie) => {
    setEditingId(movie.id);
    setEditRating(movie.userRating || 8);
    setEditReview(movie.review || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateMovie(id, {
      userRating: editRating,
      review: editReview.trim() || undefined,
    });
    setEditingId(null);
  };

  const handlePromoteToWatched = (id: string) => {
    onUpdateMovie(id, {
      watchStatus: 'watched',
      userRating: promoRating,
      review: promoReview.trim() || undefined,
    });
    setWatchedPromoId(null);
    setPromoRating(8);
    setPromoReview('');
  };

  // Filter & Search movies
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.director && m.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.genres.some((g) => g.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.review && m.review.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filter === 'all' ||
      (filter === 'watched' && m.watchStatus === 'watched') ||
      (filter === 'plan-to-watch' && m.watchStatus === 'plan-to-watch');

    const matchesGenre =
      selectedGenre === 'all' ||
      m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());

    return matchesSearch && matchesStatus && matchesGenre;
  });

  return (
    <div className="space-y-4">
      {/* Search, Genre Select, and Filters Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center glass-panel-light p-4 rounded-xl border border-white/10 bg-white/5">
        
        {/* Left Section: Search and Genre filter */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Search by title, director, genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Genre select custom dropdown */}
          <div className="relative w-full sm:w-48 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
            </span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer font-sans"
            >
              <option value="all" className="bg-[#0f172a] text-slate-100">All Genres</option>
              {AVAILABLE_GENRES.map((g) => {
                const totalCount = movies.filter((m) =>
                  m.genres.some((genre) => genre.toLowerCase() === g.toLowerCase())
                ).length;
                return (
                  <option key={g} value={g} className="bg-[#0f172a] text-slate-100">
                    {g} ({totalCount})
                  </option>
                );
              })}
            </select>
            {/* Custom arrow icon */}
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <span className="text-slate-400 text-[9px]">▼</span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Tab Selectors */}
        <div className="flex bg-black/30 p-1 rounded-lg border border-white/10 w-full lg:w-auto backdrop-blur-md self-center">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 lg:flex-none text-[11px] font-bold px-4 py-1.5 rounded transition cursor-pointer font-display whitespace-nowrap ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({selectedGenre === 'all' ? movies.length : movies.filter(m => m.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase())).length})
          </button>
          <button
            onClick={() => setFilter('watched')}
            className={`flex-1 lg:flex-none text-[11px] font-bold px-4 py-1.5 rounded transition cursor-pointer font-display whitespace-nowrap ${
              filter === 'watched'
                ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watched ({
              movies.filter((m) => m.watchStatus === 'watched' && (selectedGenre === 'all' || m.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase()))).length
            })
          </button>
          <button
            onClick={() => setFilter('plan-to-watch')}
            className={`flex-1 lg:flex-none text-[11px] font-bold px-4 py-1.5 rounded transition cursor-pointer font-display whitespace-nowrap ${
              filter === 'plan-to-watch'
                ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow shadow-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watchlist ({
              movies.filter((m) => m.watchStatus === 'plan-to-watch' && (selectedGenre === 'all' || m.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase()))).length
            })
          </button>
        </div>
      </div>

      {/* Movies List representation */}
      {filteredMovies.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md p-12 text-center text-xs text-slate-400 border border-white/10 rounded-2xl">
          No filmed entries match your search parameters. Use the form above to expand your list!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredMovies.map((movie) => {
            const isEditing = editingId === movie.id;
            const isConfiguringWatched = watchedPromoId === movie.id;

            return (
              <div
                key={movie.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/15 rounded-xl p-4 transition-all duration-300 shadow-lg flex flex-col md:flex-row md:items-start justify-between gap-4 transition-glass"
              >
                {/* Left Side: Thumbnail metadata info */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h4 className="text-sm font-bold text-white font-display">{movie.title}</h4>
                    <span className="text-xs text-slate-500 font-mono">({movie.year})</span>
                    {movie.director && (
                      <span className="text-xs text-slate-400 font-sans italic">
                        directed by <span className="font-medium text-purple-300">{movie.director}</span>
                      </span>
                    )}
                    
                    {/* Watched vs Watchlist pill indicator */}
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                        movie.watchStatus === 'watched'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      }`}
                    >
                      {movie.watchStatus === 'watched' ? 'Watched' : 'Watchlist'}
                    </span>
                  </div>

                  {/* Genres layout */}
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.map((g) => (
                      <span
                        key={g}
                        className="text-[9px] bg-black/40 text-slate-300 px-1.5 py-0.5 border border-white/5 rounded font-mono"
                      >
                        {g}
                      </span>
                    ))}
                    <div className="text-[9px] text-slate-500 ml-1.5 flex items-center gap-1 font-mono">
                      <Calendar className="w-2.5 h-2.5" />
                      Added {movie.dateAdded}
                    </div>
                  </div>

                  {/* IMDb and User Ratings Score Layout */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="bg-black/30 px-2.5 py-1 border border-white/10 rounded-lg text-slate-200 font-semibold font-mono flex items-center gap-1">
                      <span className="text-slate-500 text-[10px]">IMDb Rating</span>
                      <span className="text-purple-400 font-bold">⭐ {movie.imdbRating.toFixed(1)}</span>
                    </div>

                    {movie.watchStatus === 'watched' && movie.userRating !== undefined && (
                      <div className="bg-rose-500/10 px-2.5 py-1 border border-rose-500/20 rounded-lg text-rose-300 font-mono font-bold flex items-center gap-1">
                        <span className="text-slate-500 text-[10px] font-medium">Your Score</span>
                        👑 {movie.userRating} <span className="text-rose-600/60 font-normal">/ 10</span>
                      </div>
                    )}
                  </div>

                  {/* Film reviews rendering */}
                  {movie.watchStatus === 'watched' && movie.review && !isEditing && (
                    <div className="bg-black/25 p-3 rounded-lg border border-white/5 font-light text-slate-300 text-xs italic flex items-start gap-1.5 max-w-2xl leading-relaxed">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <p>"{movie.review}"</p>
                    </div>
                  )}

                  {/* 1. EDIT RATING/REVIEW MODE */}
                  {isEditing && (
                    <div className="bg-black/45 border border-purple-500/20 p-3.5 rounded-lg space-y-3 max-w-xl animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white font-display">Edit Rating:</span>
                        <span className="text-xs font-bold font-mono text-purple-300 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">
                          ★ {editRating} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={editRating}
                        onChange={(e) => setEditRating(Number(e.target.value))}
                        className="w-full accent-rose-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Update review notes..."
                        value={editReview}
                        onChange={(e) => setEditReview(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex gap-2 justify-end text-[10px] font-bold">
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded cursor-pointer transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(movie.id)}
                          className="bg-gradient-to-r from-purple-500 to-rose-500 text-white px-3 py-1 rounded cursor-pointer transition flex items-center gap-1 shadow-lg shadow-purple-500/10"
                        >
                          <Save className="w-3 h-3" /> Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. UPGRADE WATCHLIST TO WATCHED MODE PANEL */}
                  {isConfiguringWatched && (
                    <div className="bg-black/45 border border-purple-500/20 p-3.5 rounded-lg space-y-3 max-w-xl animate-fade-in">
                      <span className="text-xs font-bold text-purple-300 block pb-1 border-b border-white/5 font-display">
                        🎬 How was "{movie.title}"? Log it as watched!
                      </span>
                      <div className="flex justify-between items-center text-xs font-display">
                        <label className="text-slate-400 font-semibold">Assign Your Star Score:</label>
                        <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/15 border border-rose-500/20 px-1.5 py-0.5 rounded">
                          ★ {promoRating} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={promoRating}
                        onChange={(e) => setPromoRating(Number(e.target.value))}
                        className="w-full accent-rose-500 h-1.5 bg-white/10 rounded appearance-none cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Write a quick review..."
                        value={promoReview}
                        onChange={(e) => setPromoReview(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex gap-2 justify-end text-[10px] font-bold">
                        <button
                          onClick={() => setWatchedPromoId(null)}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded cursor-pointer transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePromoteToWatched(movie.id)}
                          className="bg-gradient-to-r from-purple-500 to-rose-500 text-white px-3 py-1 rounded cursor-pointer flex items-center gap-1 shadow-lg shadow-purple-500/10"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Upgrade & Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Actions Panel (Delete, Edit, or Upgrade) */}
                <div className="flex md:flex-col items-center gap-2 border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0 self-stretch justify-end">
                  {movie.watchStatus === 'plan-to-watch' && !isConfiguringWatched && (
                    <button
                      onClick={() => setWatchedPromoId(movie.id)}
                      className="bg-purple-500/20 hover:bg-gradient-to-r hover:from-purple-500 hover:to-rose-500 text-purple-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm border border-purple-500/25 font-mono"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark Watched
                    </button>
                  )}

                  {movie.watchStatus === 'watched' && !isEditing && (
                    <button
                      onClick={() => startEditing(movie)}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 border border-white/10 font-display"
                    >
                      <Edit2 className="w-3 h-3 text-purple-400" />
                      Edit Review
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteMovie(movie.id)}
                    className="bg-red-500/10 hover:bg-red-600/20 hover:text-white text-red-400 p-1.5 rounded-lg text-xs transition cursor-pointer border border-red-500/20"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
