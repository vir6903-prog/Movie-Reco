import React, { useState, useEffect } from 'react';
import { Movie } from './types';
import { INITIAL_MOVIES } from './data/initialMovies';
import MovieForm from './components/MovieForm';
import HistoryList from './components/HistoryList';
import RecommendationFeed from './components/RecommendationFeed';
import AnalyticsView from './components/AnalyticsView';
import { Film, Sparkles, BarChart3, HelpCircle, Star, Tv, RotateCcw, Clapperboard, Compass } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'hub' | 'recs' | 'analytics'>('hub');
  const [showLogForm, setShowLogForm] = useState(false);

  // Load from local storage or set default values
  useEffect(() => {
    const saved = localStorage.getItem('movie_reco_movies');
    if (saved) {
      try {
        setMovies(JSON.parse(saved));
      } catch (e) {
        console.error('Error reading localStorage movies:', e);
        setMovies(INITIAL_MOVIES);
      }
    } else {
      setMovies(INITIAL_MOVIES);
      localStorage.setItem('movie_reco_movies', JSON.stringify(INITIAL_MOVIES));
    }
  }, []);

  const saveMovies = (updated: Movie[]) => {
    setMovies(updated);
    localStorage.setItem('movie_reco_movies', JSON.stringify(updated));
  };

  const handleAddMovie = (newMovie: Omit<Movie, 'id' | 'dateAdded'>) => {
    const movie: Movie = {
      ...newMovie,
      id: 'm_' + Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    const updated = [movie, ...movies];
    saveMovies(updated);
  };

  const handleDeleteMovie = (id: string) => {
    const updated = movies.filter((m) => m.id !== id);
    saveMovies(updated);
  };

  const handleUpdateMovie = (id: string, updatedFields: Partial<Movie>) => {
    const updated = movies.map((m) => {
      if (m.id === id) {
        return { ...m, ...updatedFields };
      }
      return m;
    });
    saveMovies(updated);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset your film history to preloaded movies? This will overwrite your currently logged edits.')) {
      saveMovies(INITIAL_MOVIES);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[10%] w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* TOP HEADER CONTROLS */}
      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 to-rose-500 text-slate-50 rounded-xl shadow-lg shadow-purple-500/20 rotate-[-3deg] transition-transform hover:rotate-0">
              <Clapperboard className="w-5 h-5 font-black text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white font-display flex items-center gap-1">
                Movie <span className="text-purple-400">Reco</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block uppercase font-mono">
                Intelligent Taste Mapper
              </span>
            </div>
          </div>

          {/* Tab Navigation links */}
          <div className="flex bg-white/10 border border-white/10 p-1 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hub'
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow-lg shadow-purple-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              My Film Hub
            </button>
            <button
              onClick={() => setActiveTab('recs')}
              className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recs'
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow-lg shadow-purple-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Recommendations
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow-lg shadow-purple-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Taste Analytics
            </button>
          </div>

          {/* Reset button element */}
          <button
            onClick={handleResetDefaults}
            title="Reset history to pristine template movies"
            className="text-[10px] text-slate-400 hover:text-white font-mono transition flex items-center gap-1 underline decoration-dotted capitalize"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset Defaults
          </button>
        </div>
      </header>

      {/* CORE CONTENT */}
      <main className="relative max-w-6xl mx-auto px-4 py-6 md:py-8">
        
        {/* VIEWPORTS */}
        {activeTab === 'hub' && (
          <div className="space-y-6 animate-fade-in lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0 relative z-10">
            {/* Left side: Search & Log entries list */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-display">Film Database</h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Manage your watch histories, watchlist, review tags and score benchmarks.
                  </p>
                </div>

                <button
                  onClick={() => setShowLogForm(!showLogForm)}
                  className="bg-purple-500/15 text-purple-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-rose-500 hover:text-white transition-all border border-purple-500/30 font-bold text-xs py-1.5 px-3.5 rounded-lg cursor-pointer font-display shadow-lg shadow-purple-500/5 hover:scale-105"
                >
                  {showLogForm ? 'Close Log Sheet' : '+ Log Film'}
                </button>
              </div>

              {/* Collapsible log film form sheets */}
              {showLogForm && (
                <div className="animate-fade-in pb-2">
                  <MovieForm onAddMovie={handleAddMovie} onClose={() => setShowLogForm(false)} />
                </div>
              )}

              <HistoryList
                movies={movies}
                onDeleteMovie={handleDeleteMovie}
                onUpdateMovie={handleUpdateMovie}
              />
            </div>

            {/* Right side helper widget / short analytical banner */}
            <div className="lg:col-span-4 space-y-5">
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-display flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Quick Insight
                </h4>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  The movie rating history compiled in your <strong>Film Hub</strong> acts directly as the contextual footprint for our AI. 
                </p>
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-light">Total Watched & Rated:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {movies.filter((m) => m.watchStatus === 'watched').length} films
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-light">Planned watch list:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {movies.filter((m) => m.watchStatus === 'plan-to-watch').length} films
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('recs')}
                  className="w-full bg-purple-500/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-rose-500 hover:text-white border border-purple-500/20 text-purple-300 text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer self-stretch font-display shadow-md"
                >
                  Trigger AI Suggestions →
                </button>
              </div>

              {/* Adding a sleek aesthetic quote bubble for movie fans */}
              <div className="glass-panel-light p-5 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 italic leading-relaxed font-light">
                  "Cinema is a matter of what's in the frame and what's out."
                </p>
                <span className="text-[10px] text-slate-500 block mt-2 font-mono">— Martin Scorsese</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recs' && (
          <div className="space-y-5 animate-fade-in relative z-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Personal Suggestions
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Tailored movie curation analyzing your history trends, and cross-matching genres & rating indices.
              </p>
            </div>

            <RecommendationFeed
              history={movies}
              onAddMovie={handleAddMovie}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-5 animate-fade-in relative z-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-400" />
                Taste & IMDb Correlation Analysis
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Visualizing preferred categories, standard IMDb deviations, and identifying your critical outliers.
              </p>
            </div>

            <AnalyticsView movies={movies} />
          </div>
        )}
      </main>

      {/* COMPACT CLEAN FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 mt-12 py-6 text-center text-xs text-slate-500 font-light select-none">
        <p className="font-light">© {new Date().getFullYear()} Movie Reco Hub. Crafted with React, Tailwind and server-side Gemini AI.</p>
        <div className="flex justify-center items-center gap-2 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Engine Synchronized</span>
        </div>
      </footer>
    </div>
  );
}
