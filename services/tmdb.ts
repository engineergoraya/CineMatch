import { supabase } from "@/integrations/supabase/client";

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface TMDBDetails extends TMDBMovie {
  genres: { id: number; name: string }[];
  videos?: {
    results: TMDBVideo[];
  };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export const getImageUrl = (path: string | null) => 
  path ? `${TMDB_IMAGE_BASE}${path}` : '/placeholder.svg';

export const getBackdropUrl = (path: string | null) => 
  path ? `${TMDB_BACKDROP_BASE}${path}` : '/placeholder.svg';

class TMDBService {
  private async callProxy(endpoint: string, params: Record<string, string> = {}) {
    const queryParams = new URLSearchParams({
      endpoint,
      ...params,
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb-proxy?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error || JSON.stringify(errorData)}`;
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('TMDB API Success:', endpoint, data.results?.length || 0, 'results');
      return data;
    } catch (error) {
      console.error('TMDB API Error:', endpoint, error);
      throw error;
    }
  }

  async discover(params: {
    mediaType: 'movie' | 'tv';
    genre?: string;
    region?: string;
    sortBy?: string;
    page?: number;
  }): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const queryParams: Record<string, string> = {
      page: String(params.page || 1),
      sort_by: params.sortBy || 'popularity.desc',
    };

    if (params.genre && params.genre !== 'all') queryParams.with_genres = params.genre;
    if (params.region && params.region !== 'all') queryParams.region = params.region;

    return this.callProxy(`/discover/${params.mediaType}`, queryParams);
  }

  async trending(mediaType: 'movie' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'week') {
    return this.callProxy(`/trending/${mediaType}/${timeWindow}`);
  }

  async topRated(mediaType: 'movie' | 'tv' = 'movie', page = 1) {
    return this.callProxy(`/${mediaType}/top_rated`, { page: String(page) });
  }

  async search(query: string, mediaType: 'movie' | 'tv' = 'movie', page = 1) {
    return this.callProxy(`/search/${mediaType}`, { 
      query, 
      page: String(page) 
    });
  }

  async getDetails(id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBDetails> {
    return this.callProxy(`/${mediaType}/${id}`, {
      append_to_response: 'videos,credits',
    });
  }

  async getGenres(mediaType: 'movie' | 'tv' = 'movie') {
    return this.callProxy(`/genre/${mediaType}/list`);
  }

  async getSimilar(id: number, mediaType: 'movie' | 'tv' = 'movie', page = 1) {
    return this.callProxy(`/${mediaType}/${id}/similar`, { page: String(page) });
  }

  async getRecommendations(id: number, mediaType: 'movie' | 'tv' = 'movie', page = 1) {
    return this.callProxy(`/${mediaType}/${id}/recommendations`, { page: String(page) });
  }

  async multiSearch(query: string, page = 1) {
    return this.callProxy(`/search/multi`, { 
      query, 
      page: String(page) 
    });
  }

  async getNowPlaying(page = 1) {
    return this.callProxy(`/movie/now_playing`, { page: String(page) });
  }

  async getPopular(mediaType: 'movie' | 'tv' = 'movie', page = 1) {
    return this.callProxy(`/${mediaType}/popular`, { page: String(page) });
  }

  async getUpcoming(page = 1) {
    return this.callProxy(`/movie/upcoming`, { page: String(page) });
  }
}

export const tmdbService = new TMDBService();