import React, { useState, useEffect } from 'react';
import { Movie, RecommendedMovie, RecommendationResponse } from '../types';
import { AVAILABLE_GENRES } from '../data/initialMovies';
import { Sparkles, Film, Plus, Check, Sliders, Play, RotateCcw, Award, Clapperboard, Loader2 } from 'lucide-react';

interface RecommendationFeedProps {
  history: Movie[];
  onAddMovie: (movie: Omit<Movie, 'id' | 'dateAdded'>) => void;
}

const FUNNY_LOADER_PHRASES = [
  'Analyzing your ratings profile...',
  'Cross-examining IMDb ratings and genre tags...',
  'Consulting Christopher Nolan\'s chalkboards...',
  'Sifting through Quentin Tarantino\'s archive...',
  'Querying Studio Ghibli atmospheres...',
  'Drafting personalized taste metrics...',
  'Readying premium recommendations...'
];

export default function RecommendationFeed({ history, onAddMovie }: RecommendationFeedProps) {
  const [style, setStyle] = useState<'mainstream' | 'hidden-gems' | 'classic' | 'niche-indie'>('mainstream');
  const [minImdbRating, setMinImdbRating] = useState(7.5);
  const [selectedPreferredGenres, setSelectedPreferredGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple state to handle live quick rating inside recommendation cards
  const [ratingInputId, setRatingInputId] = useState<string | null>(null);
  const [quickRating, setQuickRating] = useState<number>(8);
  const [quickReview, setQuickReview] = useState<string>('');

  // Settle loading sentences carousel
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % FUNNY_LOADER_PHRASES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const togglePreferredGenre = (genre: string) => {
    if (selectedPreferredGenres.includes(genre)) {
      setSelectedPreferredGenres(selectedPreferredGenres.filter((g) => g !== genre));
    } else {
      setSelectedPreferredGenres([...selectedPreferredGenres, genre]);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Filter out movies currently present in history to avoid duplication
    const excludedTitles = history.map(m => m.title.toLowerCase());

    const payload = {
      history,
      filters: {
        preferredGenres: selectedPreferredGenres,
        minImdbRating,
        style,
        excludedMovieIds: [], // We filter directly by title/year in the server
      }
    };

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to load movie predictions compiled from metadata.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while communicating with Movie Reco recommendations server.');
    } finally {
      setLoading(false);
    }
  };

  // Perform initial load when history is populated
  useEffect(() => {
    if (!result && !loading && !error) {
      generateRecommendations();
    }
  }, []);

  const handleAddWatchlist = (rec: RecommendedMovie) => {
    onAddMovie({
      title: rec.title,
      year: rec.year,
      genres: rec.genres,
      imdbRating: rec.imdbRating,
      watchStatus: 'plan-to-watch',
    });
    // Remove recommended movie from active list to avoid duplicate action
    if (result) {
      setResult({
        ...result,
        recommendations: result.recommendations.filter(r => r.title !== rec.title),
      });
    }
  };

  const handleQuickRateSubmit = (rec: RecommendedMovie) => {
    onAddMovie({
      title: rec.title,
      year: rec.year,
      genres: rec.genres,
      imdbRating: rec.imdbRating,
      watchStatus: 'watched',
      userRating: quickRating,
      review: quickReview.trim() || undefined,
    });
    // Close panel
    setRatingInputId(null);
    setQuickRating(8);
    setQuickReview('');
    // Remove from recommended movie active list
    if (result) {
      setResult({
        ...result,
        recommendations: result.recommendations.filter(r => r.title !== rec.title),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. FILTER CONTROLS HEADER */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">Recommendation Fine-Tuning</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Style Selector */}
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-xs font-semibold text-slate-400 font-display">Cinematic Style</label>
            <select
              value={style}
              onChange={(e: any) => setStyle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="mainstream">Mainstream Hits (Highly Rated Masterpieces)</option>
              <option value="hidden-gems">Hidden Gems (Audience Favorites / Underdog Films)</option>
              <option value="classic">Classic Cinema (Golden Eras & Old Masterpieces)</option>
              <option value="niche-indie">Niche / Indie (Absurdist, Quirky Art-house)</option>
            </select>
          </div>

          {/* Min IMDb Limit */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-display">
              <label className="font-semibold text-slate-400">Min IMDb Threshold</label>
              <span className="font-mono text-purple-400 font-black">⭐ {minImdbRating.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="9.0"
              step="0.1"
              value={minImdbRating}
              onChange={(e) => setMinImdbRating(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-black/40 rounded-lg appearance-none mt-2"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex items-end">
            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="w-full bg-purple-500/10 border border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500 hover:to-rose-500 hover:text-white hover:border-transparent text-purple-300 text-xs font-bold py-2 px-4 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 h-9 font-display shadow-lg shadow-purple-500/5 hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 font-black" />
              Regenerate Recs
            </button>
          </div>
        </div>

        {/* Togglable Genre Preferences */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <label className="text-xs font-semibold text-slate-400 block font-display">
            Target Focus Genres <span className="text-slate-500 font-normal font-sans">(Optional: overrides overall history bias)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto w-full p-1.5 bg-black/30 border border-white/10 rounded-lg">
            {AVAILABLE_GENRES.map((g) => {
              const isSelected = selectedPreferredGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => togglePreferredGenre(g)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer font-medium font-mono transition ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold'
                      : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/15'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="glass-panel p-16 rounded-2xl space-y-4 text-center border-white/10">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-slate-300 font-mono tracking-wider">
              {FUNNY_LOADER_PHRASES[phraseIndex]}
            </h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Compiling film graphs</p>
          </div>
        </div>
      )}

      {/* 3. ERROR STATE */}
      {error && !loading && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center space-y-2">
          <p className="text-xs text-rose-300">Oops! {error}</p>
          <button
            onClick={generateRecommendations}
            className="text-[10px] bg-gradient-to-r from-purple-500 to-rose-500 text-white font-bold px-3 py-1 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 4. RESULTS VIEW */}
      {result && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* Flavor Profile Statement */}
          <div className="bg-gradient-to-r from-purple-500/15 to-transparent p-4 rounded-xl border border-purple-500/10 backdrop-blur-md">
            <span className="text-[9px] font-black tracking-widest uppercase text-purple-400 block mb-1 font-mono">
              Taste Analysis Comment
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-light">
              "{result.analysisParagraph}"
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Top Pick Suggestions ({result.recommendations.length})
            </h4>

            {result.recommendations.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 text-center text-xs text-slate-400">
                No new suggestions found fitting those thresholds. Try lowering your IMDb rating slider!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {result.recommendations.map((rec, idx) => {
                  const isRatingThis = ratingInputId === `${rec.title}-${rec.year}`;
                  return (
                    <div
                      key={idx}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/15 p-5 rounded-2xl transition-all duration-300 group flex flex-col md:flex-row gap-5 relative overflow-hidden transition-glass shadow-lg"
                    >
                      {/* Left: Score Badge Graphic */}
                      <div className="shrink-0 flex md:flex-col items-center justify-between md:justify-center p-3 bg-black/30 border border-white/10 rounded-xl md:w-28 text-center gap-1.5">
                        <div className="text-center md:mx-auto">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Match</span>
                          <span className="text-xl font-bold font-mono text-purple-400">
                            {rec.matchScore}%
                          </span>
                        </div>
                        <div className="w-px h-6 md:w-10 md:h-px bg-white/10" />
                        <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                          ⭐ {rec.imdbRating.toFixed(1)}
                        </span>
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors font-display">
                              {rec.title}
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">({rec.year})</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] text-slate-300 bg-black/40 border border-white/5 px-2 py-0.5 rounded-full font-mono">
                              By {rec.director}
                            </span>
                            {rec.genres.map((g) => (
                              <span
                                key={g}
                                className="text-[10px] bg-white/5 text-slate-400 border border-white/5 px-1.5 py-0.5 rounded font-mono"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Synopsis & Personalized Fit */}
                        <div className="space-y-1.5 text-xs text-slate-300 font-light border-l border-white/10 pl-3">
                          <p className="text-slate-400 italic">"{rec.synopsis}"</p>
                          <p className="text-slate-200">
                            <strong className="text-purple-400 font-semibold font-display">Recommended to you because:</strong> {rec.whyYouWillLoveIt}
                          </p>
                        </div>

                        {/* Quick Rating Input Sheet */}
                        {isRatingThis ? (
                          <div className="bg-black/50 border border-purple-500/20 p-3.5 rounded-xl space-y-3 animate-fade-in mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-white font-display">Quick rate of {rec.title}:</span>
                              <span className="text-xs font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded font-mono">
                                ★ {quickRating}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              step="1"
                              value={quickRating}
                              onChange={(e) => setQuickRating(Number(e.target.value))}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-2"
                            />
                            <input
                              type="text"
                              placeholder="Optional short review..."
                              value={quickReview}
                              onChange={(e) => setQuickReview(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                            />
                            <div className="flex justify-end gap-2 text-[10px] font-bold">
                              <button
                                onClick={() => setRatingInputId(null)}
                                className="bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded cursor-pointer transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleQuickRateSubmit(rec)}
                                className="bg-gradient-to-r from-purple-500 to-rose-500 text-white px-3 py-1 rounded cursor-pointer shadow-lg shadow-purple-500/10 font-display"
                              >
                                Log Film
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Action Buttons Row */
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => handleAddWatchlist(rec)}
                              className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/15 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 font-display"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add to Watchlist
                            </button>
                            <button
                              onClick={() => {
                                setRatingInputId(`${rec.title}-${rec.year}`);
                              }}
                              className="bg-purple-500/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-rose-500 text-purple-300 hover:text-white border border-purple-500/20 hover:border-transparent px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 font-display shadow-lg shadow-purple-500/5"
                            >
                              <Clapperboard className="w-3.5 h-3.5" />
                              Log & Rate This
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
