import React, { useState } from 'react';
import { Movie } from '../types';
import { AVAILABLE_GENRES } from '../data/initialMovies';
import { Film, Calendar, Star, Compass, Tag, Plus, Check, Eye } from 'lucide-react';

interface MovieFormProps {
  onAddMovie: (movie: Omit<Movie, 'id' | 'dateAdded'>) => void;
  onClose?: () => void;
}

export default function MovieForm({ onAddMovie, onClose }: MovieFormProps) {
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [imdbRating, setImdbRating] = useState(8.0);
  const [userRating, setUserRating] = useState<number>(8);
  const [watchStatus, setWatchStatus] = useState<'watched' | 'plan-to-watch'>('watched');
  const [review, setReview] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState('');

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddMovie({
      title: title.trim(),
      director: director.trim() || undefined,
      year: Number(year) || new Date().getFullYear(),
      genres: selectedGenres.length > 0 ? selectedGenres : ['Drama'],
      imdbRating: Number(imdbRating) || 5.0,
      userRating: watchStatus === 'watched' ? Number(userRating) : undefined,
      watchStatus,
      review: watchStatus === 'watched' ? review.trim() : undefined,
    });

    // Reset Form
    setTitle('');
    setDirector('');
    setYear(new Date().getFullYear());
    setImdbRating(8.0);
    setUserRating(8);
    setWatchStatus('watched');
    setReview('');
    setSelectedGenres([]);
    if (onClose) onClose();
  };

  const filteredGenres = AVAILABLE_GENRES.filter((g) =>
    g.toLowerCase().includes(genreSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 glass-panel p-5 rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Film className="w-5 h-4 text-purple-400" />
          Log a New Film
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block font-display">Movie Title</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Inception"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Director */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block font-display">Director</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Christopher Nolan"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Year */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block font-display">Release Year</label>
          <div className="relative">
            <input
              type="number"
              min="1880"
              max={new Date().getFullYear() + 2}
              required
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Genres Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 block font-display">
          Genres <span className="text-slate-500 font-light font-sans">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-black/30 rounded-xl border border-white/10">
          {AVAILABLE_GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`text-xs px-2.5 py-1 rounded-full transition flex items-center gap-1 border cursor-pointer font-mono ${
                  isSelected
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-medium'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/15'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3 text-purple-400" /> : <Plus className="w-3 h-3" />}
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Watch Status */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 block font-display">Watch Status</label>
          <div className="flex bg-black/40 rounded-xl border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setWatchStatus('watched')}
              className={`flex-1 py-1.5 text-xs text-center rounded-lg font-bold transition cursor-pointer flex justify-center items-center gap-1 font-display ${
                watchStatus === 'watched'
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow-md shadow-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Watched
            </button>
            <button
              type="button"
              onClick={() => setWatchStatus('plan-to-watch')}
              className={`flex-1 py-1.5 text-xs text-center rounded-lg font-bold transition cursor-pointer flex justify-center items-center gap-1 font-display ${
                watchStatus === 'plan-to-watch'
                  ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Watchlist
            </button>
          </div>
        </div>

        {/* IMDb Rating Slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-400 font-display">IMDb Rating</label>
            <span className="text-xs font-mono font-bold text-purple-300 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded">
              ⭐ {imdbRating.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.1"
            value={imdbRating}
            onChange={(e) => setImdbRating(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-black/40 rounded-lg appearance-none"
          />
        </div>
      </div>

      {watchStatus === 'watched' && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* User Rating Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-rose-400 flex items-center gap-1 font-display">
                Your Rating
              </label>
              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 rounded-full">
                👑 {userRating} / 10
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={userRating}
                onChange={(e) => setUserRating(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-black/40 rounded-lg appearance-none"
              />
              <span className="text-[10px] shrink-0 select-none text-slate-500 font-mono uppercase">Standard Deviation</span>
            </div>
          </div>

          {/* Quick Review */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block font-display">Personal Review / Notes</label>
            <textarea
              rows={2}
              placeholder="What made this movie special or missing logic? (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-400 hover:to-rose-400 text-white text-xs font-bold font-display py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/25 transition duration-200 focus:outline-none transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4 font-black" />
        {watchStatus === 'watched' ? 'Add To Watch History' : 'Add To Watchlist'}
      </button>
    </form>
  );
}
