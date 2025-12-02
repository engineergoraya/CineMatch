import { useState, useEffect } from "react";
import { Film, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/HeroBanner";
import { Carousel } from "@/components/Carousel";
import { SearchBar } from "@/components/SearchBar";
import { MovieModal } from "@/components/MovieModal";
import { TMDBMovie, tmdbService } from "@/services/tmdb";

const Index = () => {
  const [selectedMovie, setSelectedMovie] = useState<{ id: number; mediaType: 'movie' | 'tv' } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Carousel data
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<TMDBMovie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<TMDBMovie[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<TMDBMovie[]>([]);
  const [animeMovies, setAnimeMovies] = useState<TMDBMovie[]>([]);
  const [bollywoodMovies, setBollywoodMovies] = useState<TMDBMovie[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Load all carousels
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [
          trending,
          trendingTVData,
          topRated,
          topRatedTVData,
          nowPlayingData,
          popular,
          upcoming,
          anime,
          bollywood,
        ] = await Promise.all([
          tmdbService.trending('movie', 'week'),
          tmdbService.trending('tv', 'week'),
          tmdbService.topRated('movie'),
          tmdbService.topRated('tv'),
          tmdbService.getNowPlaying(),
          tmdbService.getPopular('movie'),
          tmdbService.getUpcoming(),
          tmdbService.discover({ mediaType: 'movie', genre: '16' }), // Animation genre
          tmdbService.discover({ mediaType: 'movie', region: 'IN' }), // India region
        ]);

        setTrendingMovies(trending.results || []);
        setTrendingTV(trendingTVData.results || []);
        setTopRatedMovies(topRated.results || []);
        setTopRatedTV(topRatedTVData.results || []);
        setNowPlaying(nowPlayingData.results || []);
        setPopularMovies(popular.results || []);
        setUpcomingMovies(upcoming.results || []);
        setAnimeMovies(anime.results || []);
        setBollywoodMovies(bollywood.results || []);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for custom event to open movie modal (from similar titles)
  useEffect(() => {
    const handleOpenMovie = (e: Event) => {
      const event = e as CustomEvent;
      setSelectedMovie({ id: event.detail.id, mediaType: event.detail.mediaType });
    };

    window.addEventListener('openMovie', handleOpenMovie);
    return () => window.removeEventListener('openMovie', handleOpenMovie);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMovieClick = (id: number, mediaType: 'movie' | 'tv' = 'movie') => {
    setSelectedMovie({ id, mediaType });
  };

  return (
    <div className="min-h-screen bg-cinema-dark">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-cinema-dark via-cinema-dark/95 to-transparent">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-primary" />
            <h1 className="cinema-title text-2xl text-gradient hidden sm:block">CineMatch</h1>
          </div>
          
          <SearchBar onResultClick={handleMovieClick} />
        </div>
      </header>

      {/* Hero Banner */}
      <div className="pt-16">
        <HeroBanner onPlayClick={(id) => handleMovieClick(id, 'movie')} />
      </div>

      {/* Carousels */}
      <div className="relative -mt-24 z-10 pb-12">
        <Carousel
          title="Trending Movies"
          movies={trendingMovies}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
        
        <Carousel
          title="Trending TV Shows"
          movies={trendingTV}
          onMovieClick={(id) => handleMovieClick(id, 'tv')}
          loading={loading}
        />
        
        <Carousel
          title="Now Playing in Theaters"
          movies={nowPlaying}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
        
        <Carousel
          title="Top Rated Movies"
          movies={topRatedMovies}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
        
        <Carousel
          title="Top Rated TV Shows"
          movies={topRatedTV}
          onMovieClick={(id) => handleMovieClick(id, 'tv')}
          loading={loading}
        />
        
        <Carousel
          title="Popular Movies"
          movies={popularMovies}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
        
        <Carousel
          title="Coming Soon"
          movies={upcomingMovies}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
        
        <Carousel
          title="Anime Picks"
          movies={animeMovies}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
        
        <Carousel
          title="Bollywood Picks"
          movies={bollywoodMovies}
          onMovieClick={(id) => handleMovieClick(id, 'movie')}
          loading={loading}
        />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 z-40 rounded-full gradient-primary shadow-glow animate-fade-in"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      {/* Movie Modal */}
      <MovieModal
        movieId={selectedMovie?.id || null}
        mediaType={selectedMovie?.mediaType || 'movie'}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
};

export default Index;