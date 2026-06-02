import React from 'react';
import { Movie } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Award, BarChart3, TrendingUp, Sparkles, AlertCircle, Heart, Frown, Filter } from 'lucide-react';

interface AnalyticsViewProps {
  movies: Movie[];
}

export default function AnalyticsView({ movies }: AnalyticsViewProps) {
  const watchedMovies = movies.filter((m) => m.watchStatus === 'watched');

  if (watchedMovies.length === 0) {
    return (
      <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-display">No Rated Movies Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Add or rate some films in the <strong>Film Hub</strong> first. Your visual ratings comparison and genre taste maps will compile automatically here!
          </p>
        </div>
      </div>
    );
  }

  // 1. STATS CALCULATIONS
  const totalWatched = watchedMovies.length;
  const avgImdb = watchedMovies.reduce((acc, m) => acc + m.imdbRating, 0) / totalWatched;
  const ratedWithUserScore = watchedMovies.filter((m) => m.userRating !== undefined);
  const totalRated = ratedWithUserScore.length;
  const avgUser = totalRated > 0 
    ? ratedWithUserScore.reduce((acc, m) => acc + (m.userRating || 0), 0) / totalRated 
    : 0;

  // Rating bias (User Rating - IMDb Rating of corresponding films)
  const biasList = ratedWithUserScore.map((m) => (m.userRating || 0) - m.imdbRating);
  const avgBias = biasList.length > 0 ? biasList.reduce((acc, val) => acc + val, 0) / biasList.length : 0;

  let biasTitle = 'Balanced Spectator';
  let biasDescription = 'Your ratings closely mirror average public sentiment across IMDb.';
  let biasBadgeColor = 'bg-white/5 border-white/10 text-slate-300';

  if (avgBias > 0.4) {
    biasTitle = 'Generous Connoisseur';
    biasDescription = `You rate films +${avgBias.toFixed(1)} points higher than standard IMDb averages. You easily find artistic beauty!`;
    biasBadgeColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  } else if (avgBias < -0.4) {
    biasTitle = 'Discerning Critic';
    biasDescription = `You are strict, rating films ${avgBias.toFixed(1)} points lower than official IMDb averages. You demand top-tier cinematic craft.`;
    biasBadgeColor = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  }

  // 2. GENRES ANALYSIS
  const genreCounts: { [key: string]: { count: number; userTotal: number; userCount: number; imdbTotal: number } } = {};
  
  watchedMovies.forEach((m) => {
    m.genres.forEach((g) => {
      if (!genreCounts[g]) {
        genreCounts[g] = { count: 0, userTotal: 0, userCount: 0, imdbTotal: 0 };
      }
      genreCounts[g].count += 1;
      genreCounts[g].imdbTotal += m.imdbRating;
      if (m.userRating !== undefined) {
        genreCounts[g].userTotal += m.userRating;
        genreCounts[g].userCount += 1;
      }
    });
  });

  // Convert to array for Recharts
  const genreData = Object.keys(genreCounts).map((g) => {
    const stats = genreCounts[g];
    return {
      genre: g,
      count: stats.count,
      avgImdbRating: parseFloat((stats.imdbTotal / stats.count).toFixed(1)),
      avgUserRating: stats.userCount > 0 ? parseFloat((stats.userTotal / stats.userCount).toFixed(1)) : 0,
    };
  });

  // Sort by count descending for Preferred genres
  const sortedByPreference = [...genreData].sort((a, b) => b.count - a.count).slice(0, 8);

  // 3. FIND GREATEST DIVERGENCES
  // Guilty Pleasure: Rated highly by user but moderately on IMDb
  const userDivergences = ratedWithUserScore.map((m) => ({
    title: m.title,
    year: m.year,
    diff: (m.userRating || 0) - m.imdbRating,
    userRating: m.userRating,
    imdbRating: m.imdbRating,
  }));

  const guiltyPleasures = [...userDivergences]
    .filter((d) => d.diff > 0)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 2);

  const overratedFilms = [...userDivergences]
    .filter((d) => d.diff < 0)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 2);

  // Individual Film Comparison Data for Recharts (limit to recent 7 films to avoid clutter)
  const recentRated = [...ratedWithUserScore]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 7)
    .map((m) => ({
      name: m.title.length > 12 ? m.title.substring(0, 10) + '..' : m.title,
      'Your Rating': m.userRating,
      'IMDb Rating': m.imdbRating,
    }));

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Watched */}
        <div className="glass-panel-light p-4 rounded-xl border border-white/10 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold font-display">Films Watched</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">{totalWatched}</span>
            <span className="text-xs text-slate-500 font-mono">logged</span>
          </div>
        </div>

        {/* User Avg Rating */}
        <div className="glass-panel-light p-4 rounded-xl border border-white/10 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold font-display">Your Avg Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-400">★ {avgUser.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-mono">/ 10</span>
          </div>
        </div>

        {/* IMDb Avg Rating */}
        <div className="glass-panel-light p-4 rounded-xl border border-white/10 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold font-display">Average IMDb Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">⭐ {avgImdb.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-mono">benchmark</span>
          </div>
        </div>

        {/* Preferance Bias */}
        <div className="glass-panel-light p-4 rounded-xl border border-white/10 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold font-display">Your Rating Bias</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-bold font-mono ${avgBias >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {avgBias >= 0 ? '+' : ''}
              {avgBias.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-semibold truncate font-display">
              {avgBias >= 0 ? 'Generous' : 'Critical'}
            </span>
          </div>
        </div>
      </div>

      {/* Bias Profiler Banner */}
      <div className={`p-4 rounded-xl border backdrop-blur-xl ${biasBadgeColor} flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md`}>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold tracking-wider uppercase font-display">Archetype: {biasTitle}</h4>
          </div>
          <p className="text-xs text-slate-300 font-light leading-relaxed">{biasDescription}</p>
        </div>
        <div className="shrink-0 text-xl font-display text-white/10 font-bold tracking-widest select-none">
          MOVIE RECO ANALYSIS
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Preferred Genres Count */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Your Preferred Genres (Volume)
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            A breakdown of your logged film library representation across different movie categories.
          </p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sortedByPreference}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="genre" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="url(#colorGenreCount)" radius={[0, 4, 4, 0]} maxBarSize={15}>
                  <LabelList dataKey="count" position="right" fill="#94a3b8" fontSize={9} offset={8} />
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="colorGenreCount" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#f472b6" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Rating Divergence Comparison (User vs IMDb by Genre) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            Avg Ratings: You vs IMDb by Genre
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compare your average rating in each genre to the standard IMDb rating of those films.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedByPreference}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="genre" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: 10 }} />
                <Bar dataKey="avgUserRating" name="Your Avg Score" fill="#a855f7" radius={[3, 3, 0, 0]} maxBarSize={12} />
                <Bar dataKey="avgImdbRating" name="IMDb Avg Bench" fill="#f472b6" radius={[3, 3, 0, 0]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Divergent Films Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        
        {/* Guilty Pleasures */}
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-rose-500" />
            <h5 className="text-xs font-bold text-rose-300 tracking-wider uppercase font-display">Your Hidden Pleasures</h5>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            These are the films you rated substantially HIGHER than the global IMDb review consensus:
          </p>
          {guiltyPleasures.length > 0 ? (
            <div className="space-y-2">
              {guiltyPleasures.map((f, i) => (
                <div key={i} className="flex justify-between items-center bg-black/35 p-2.5 rounded-lg border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-100">{f.title} <span className="text-slate-500 font-mono">({f.year})</span></p>
                    <p className="text-[10px] text-slate-400 font-mono">Divergence: +{f.diff.toFixed(1)} points</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-purple-300 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">👑 {f.userRating}</span>
                    <span className="text-slate-500">v</span>
                    <span className="text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">⭐ {f.imdbRating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-600 italic">No positive divergences compiled (ratings align perfectly).</p>
          )}
        </div>

        {/* Overrated in your eyes */}
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <Frown className="w-4 h-4 text-purple-400" />
            <h5 className="text-xs font-bold text-purple-300 tracking-wider uppercase font-display">Critical Divergence</h5>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            These are the films you rated substantially LOWER than the traditional public reviews:
          </p>
          {overratedFilms.length > 0 ? (
            <div className="space-y-2">
              {overratedFilms.map((f, i) => (
                <div key={i} className="flex justify-between items-center bg-black/35 p-2.5 rounded-lg border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-100">{f.title} <span className="text-slate-500 font-mono">({f.year})</span></p>
                    <p className="text-[10px] text-slate-400 font-mono">Divergence: {f.diff.toFixed(1)} points</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-purple-300 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">👑 {f.userRating}</span>
                    <span className="text-slate-500">v</span>
                    <span className="text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">⭐ {f.imdbRating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-600 italic">No critical divergences compiled (ratings align perfectly).</p>
          )}
        </div>

      </div>
    </div>
  );
}
