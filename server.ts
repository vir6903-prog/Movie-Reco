import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Fallback recommendations in case the GEMINI_API_KEY is not defined or is placeholder.
const FALLBACK_DATABASE = [
  {
    title: 'Whiplash',
    year: 2014,
    genres: ['Drama', 'Music'],
    imdbRating: 8.5,
    matchScore: 95,
    whyYouWillLoveIt: 'Since you enjoy high-intensity masterpieces and music, this psychological struggle between a drummer and his abusive instructor will captivate you.',
    synopsis: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    director: 'Damien Chazelle'
  },
  {
    title: 'Princess Mononoke',
    year: 1997,
    genres: ['Animation', 'Adventure', 'Fantasy', 'Anime'],
    imdbRating: 8.4,
    matchScore: 92,
    whyYouWillLoveIt: 'Matches your love for Spirited Away and premium storytelling. It features Miyazaki\'s signature stunning animation combined with a mature, complex conflict between nature and humanity.',
    synopsis: 'On a journey to find the cure for a Tatarigami\'s curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony. In this quest he also meets San, the Mononoke Hime.',
    director: 'Hayao Miyazaki'
  },
  {
    title: 'A Silent Voice',
    year: 2016,
    genres: ['Animation', 'Drama', 'Romance', 'Anime'],
    imdbRating: 8.1,
    matchScore: 91,
    whyYouWillLoveIt: 'An exceptional anime drama movie mapping themes of redemption, empathy, and emotional healing. Fits your high rating preferences.',
    synopsis: 'A young man is ostracized by his classmates after he bullies a deaf girl to the point where she moves away. Years later, he sets out on a path for redemption.',
    director: 'Naoko Yamada'
  },
  {
    title: 'Your Name.',
    year: 2016,
    genres: ['Animation', 'Drama', 'Fantasy', 'Romance', 'Anime'],
    imdbRating: 8.4,
    matchScore: 96,
    whyYouWillLoveIt: 'An exceptional modern masterpiece of Japanese animation showing stellar character bonds and gorgeous meteor-themed visuals.',
    synopsis: 'Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?',
    director: 'Makoto Shinkai'
  },
  {
    title: 'Memento',
    year: 2000,
    genres: ['Mystery', 'Thriller'],
    imdbRating: 8.4,
    matchScore: 88,
    whyYouWillLoveIt: 'Given your high ratings for Interstellar and The Dark Knight, this iconic Christopher Nolan thriller offers a mesmerizing chronological puzzle that keeps you on edge.',
    synopsis: 'A man with short-term memory loss attempts to track down his wife\'s murderer.',
    director: 'Christopher Nolan'
  },
  {
    title: 'The Truman Show',
    year: 1998,
    genres: ['Comedy', 'Drama'],
    imdbRating: 8.2,
    matchScore: 85,
    whyYouWillLoveIt: 'Pairs with your affection for Wes Anderson whimsy and smart storytelling. It is a brilliant, lighthearted but deeply existential comedic drama.',
    synopsis: 'An insurance salesman discovers his whole life is actually a reality TV show.',
    director: 'Peter Weir'
  },
  {
    title: 'Coherence',
    year: 2013,
    genres: ['Mystery', 'Sci-Fi', 'Thriller'],
    imdbRating: 7.2,
    matchScore: 82,
    whyYouWillLoveIt: 'A hidden gem that aligns perfectly with your sci-fi and thriller taste. It delivers monumental cosmic dread and relationship tension with an ultra-low budget.',
    synopsis: 'Strange things begin to happen when a group of friends gather for a dinner party on an evening when a comet is passing overhead.',
    director: 'James Ward Byrkit'
  },
  {
    title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    genres: ['Drama', 'Romance', 'Sci-Fi'],
    imdbRating: 8.3,
    matchScore: 90,
    whyYouWillLoveIt: 'An outstanding romance/sci-fi blend. It is surreal, emotional, and fits perfectly with users who enjoy deep narrative design like Interstellar and Parasite.',
    synopsis: 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.',
    director: 'Michel Gondry'
  },
  {
    title: 'Seven Samurai',
    year: 1954,
    genres: ['Action', 'Drama'],
    imdbRating: 8.6,
    matchScore: 94,
    whyYouWillLoveIt: 'A legendary masterclass in tension, action choreography, and character dynamics. This classic cinema masterpiece lays the template for all modern team-up films.',
    synopsis: 'Farmers in a Japanese village hire a band of masterless samurai to protect them against raiding bandits.',
    director: 'Akira Kurosawa'
  },
  {
    title: 'The Lobster',
    year: 2015,
    genres: ['Comedy', 'Drama', 'Romance'],
    imdbRating: 7.2,
    matchScore: 80,
    whyYouWillLoveIt: 'If you want a niche indie experience, Yorgos Lanthimos\' dark comedy offers an absurdly satirical, dystopian take on societal expectations of romantic relationships.',
    synopsis: 'In a dystopian near future, single people, according to the laws of The City, are taken to The Hotel, where they are obliged to find a romantic partner in forty-five days or are transformed into beasts and sent off into The Woods.',
    director: 'Yorgos Lanthimos'
  },
  {
    title: '12 Angry Men',
    year: 1957,
    genres: ['Crime', 'Drama'],
    imdbRating: 9.0,
    matchScore: 96,
    whyYouWillLoveIt: 'A classic drama. The tension, human behavior analysis, and pristine dialogue match your preference for high general-rating masterpieces like The Dark Knight.',
    synopsis: 'The jury in a New York City mutiny watch trial is frustrated by a single member whose skeptical caution forces them to more carefully consider the evidence history before jumping to a hasty verdict.',
    director: 'Sidney Lumet'
  },
  {
    title: 'The Night of the Hunter',
    year: 1955,
    genres: ['Crime', 'Drama', 'Thriller'],
    imdbRating: 8.0,
    matchScore: 84,
    whyYouWillLoveIt: 'A supreme classic horror-thriller hybrid. Its expressionistic shadow lighting and unforgettable performances fit your taste for smart crime and drama.',
    synopsis: 'A religious fanatic marries a gullible widow whose young children refuse to tell him where their real father hid $10,000 in stolen loot.',
    director: 'Charles Laughton'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for movie suggestions powered by Gemini
  app.post('/api/recommendations', async (req, res) => {
    try {
      const { history, filters } = req.body;
      const { preferredGenres, minImdbRating, style, excludedMovieIds } = filters || {};

      const apiKey = process.env.GEMINI_API_KEY;

      // Lazy check: Is key missing or just placeholder?
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        console.warn('GEMINI_API_KEY is missing or set to placeholder. Operating in fallback suggest mode.');
        
        // Dynamic fallback logic to emulate recommendations based on input
        const historyGenres = new Set(history?.flatMap((m: any) => m.genres || []) || []);
        
        let filteredFallbacks = FALLBACK_DATABASE.filter(f => {
          // Exclude movies matching titles already watched/written
          const titleLower = f.title.toLowerCase();
          const alreadyWatched = history?.some((h: any) => h.title.toLowerCase() === titleLower);
          if (alreadyWatched) return false;

          // Check IMDb rating threshold
          if (f.imdbRating < (minImdbRating || 0)) return false;

          return true;
        });

        // Score based on matching genres & style
        const scoredFallbacks = filteredFallbacks.map(f => {
          let score = f.matchScore;
          
          // Boost based on genre overlap with explicitly preferred genres
          if (preferredGenres && preferredGenres.length > 0) {
            const overlap = f.genres.filter((g: string) => preferredGenres.includes(g)).length;
            score += overlap * 8;
          } else {
            // Boost based on historical preferred genres
            const overlap = f.genres.filter((g: string) => historyGenres.has(g)).length;
            score += overlap * 4;
          }

          // Adjust based on requested style matches
          if (style === 'classic' && f.year < 1980) score += 10;
          if (style === 'hidden-gems' && f.imdbRating < 8.0) score += 10;
          if (style === 'mainstream' && f.imdbRating >= 8.3) score += 10;
          if (style === 'niche-indie' && f.title === 'The Lobster') score += 15;

          // Clamping score to 99 max
          return {
            ...f,
            matchScore: Math.min(Math.max(score, 65), 99)
          };
        });

        // Sort by matchScore descending
        scoredFallbacks.sort((a, b) => b.matchScore - a.matchScore);
        const selected = scoredFallbacks.slice(0, 5);

        // Generate custom static response
        let analysisParagraph = "We've matched your profile organically! You have a high appreciation for smart, visually creative story structures (especially Sci-Fi, Crime and Drama) with standard IMDb baseline reviews above 8.0.";
        if (preferredGenres && preferredGenres.length > 0) {
          analysisParagraph += ` You explicitly filtered for fields including: ${preferredGenres.join(', ')}.`;
        }

        return res.json({
          recommendations: selected,
          analysisParagraph: analysisParagraph + ' (Note: Operating in high-speed local engine mode. Connect your GEMINI_API_KEY for infinite creative suggestions!)'
        });
      }

      // Initialize GoogleGenAI SDK safely
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Construct a tailored prompt with input context
      const historyStr = history && history.length > 0 
        ? history.map((m: any) => `- "${m.title}" (${m.year}) - Genre: ${m.genres.join(', ')} | IMDb: ${m.imdbRating} | User Rating: ${m.userRating || 'No rating'}/10 | Status: ${m.watchStatus}`).join('\n')
        : 'None specified.';

      const prompt = `You are a film recommendation engine for a prestigious movie indexing app named "Movie Reco".
Analyze the user's movie history and preferences, and supply 5 excellent personalized film suggestions.

User's Watch & Rating History:
${historyStr}

Required Filtering / Guidance:
- Exclude any movies already present in the user's history above! Do not recommend them.
- Target Style: ${style || 'balanced'} style. (Classic, Mainstream, Hidden Gems, or Niche Indie).
- Preferred Genres: ${preferredGenres && preferredGenres.length > 0 ? preferredGenres.join(', ') : 'No preference, analyze history instead.'}
- Minimum IMDb Rating: ${minImdbRating || 0.0}

Format your output strictly to the following structured JSON response. Specify a high matchScore (calculated dynamically based on how well it aligns with their history and preferred genres). Build a short "analysisParagraph" (1-2 sentences) commenting on their movie taste, specifically mentioning any rating bias (e.g., if they rate much higher or lower than IMDb averages) and how it maps to genres.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                description: 'List of exactly 5 film recommendations.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'The exact title of the recommended movie.' },
                    year: { type: Type.INTEGER, description: 'The release year.' },
                    genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Relevant movie genres.' },
                    imdbRating: { type: Type.NUMBER, description: 'IMDb rating out of 10.' },
                    matchScore: { type: Type.INTEGER, description: 'How well this matches the user profile (0 to 100).' },
                    whyYouWillLoveIt: { type: Type.STRING, description: 'A personalized 1-2 sentence description explaining why this fits their profile.' },
                    synopsis: { type: Type.STRING, description: 'Brief 1-2 sentence synopsis of the film plot.' },
                    director: { type: Type.STRING, description: 'Director name.' }
                  },
                  required: ['title', 'year', 'genres', 'imdbRating', 'matchScore', 'whyYouWillLoveIt', 'synopsis', 'director']
                }
              },
              analysisParagraph: {
                type: Type.STRING,
                description: 'An insightful 1-2 sentence comment on the user taste trends, including genre peaks or comparison to global IMDb review standards.'
              }
            },
            required: ['recommendations', 'analysisParagraph']
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || '{}');
      return res.json(data);
    } catch (error: any) {
      console.error('Gemini recommendations API error:', error);
      return res.status(500).json({ error: error.message || 'Error compiling recommendations' });
    }
  });

  // Integrate Vite dev middleware or serve production dist
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Movie Reco fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
