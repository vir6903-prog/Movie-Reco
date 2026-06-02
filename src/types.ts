export interface Movie {
  id: string;
  title: string;
  director?: string;
  year: number;
  genres: string[];
  imdbRating: number;
  userRating?: number; // 1-10
  watchStatus: 'watched' | 'plan-to-watch';
  review?: string;
  dateAdded: string;
}

export interface RecommendationRequest {
  history: Movie[];
  filters: {
    preferredGenres: string[];
    minImdbRating: number;
    style: 'mainstream' | 'hidden-gems' | 'classic' | 'niche-indie';
    excludedMovieIds: string[];
  };
}

export interface RecommendedMovie {
  title: string;
  year: number;
  genres: string[];
  imdbRating: number;
  matchScore: number; // 0-100
  whyYouWillLoveIt: string;
  synopsis: string;
  director: string;
}

export interface RecommendationResponse {
  recommendations: RecommendedMovie[];
  analysisParagraph: string;
}

export interface GenreStat {
  genre: string;
  count: number;
  avgUserRating: number;
}

export interface RatingCorrelationPoint {
  title: string;
  userRating: number;
  imdbRating: number;
}
