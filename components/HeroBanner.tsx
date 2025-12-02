import { useEffect, useState } from "react";
import { TMDBMovie, tmdbService, getBackdropUrl } from "@/services/tmdb";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";

interface HeroBannerProps {
  onPlayClick: (id: number) => void;
}

export const HeroBanner = ({ onPlayClick }: HeroBannerProps) => {
  const [featured, setFeatured] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await tmdbService.trending('movie', 'week');
        const movies = data.results || [];
        if (movies.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, movies.length));
          setFeatured(movies[randomIndex]);
        }
      } catch (error) {
        console.error('Failed to load featured movie:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  if (loading || !featured) {
    return (
      <div className="relative w-full h-[70vh] bg-gradient-to-b from-cinema-dark via-black/50 to-cinema-dark animate-pulse" />
    );
  }

  const title = featured.title || featured.name || 'Untitled';

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${getBackdropUrl(featured.backdrop_path)})` }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark via-cinema-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cinema-dark to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 h-full flex flex-col justify-center max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl animate-fade-in">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3 drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {featured.overview}
        </p>
        <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button
            size="lg"
            onClick={() => onPlayClick(featured.id)}
            className="gradient-primary hover:opacity-90 transition-opacity"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Watch Trailer
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onPlayClick(featured.id)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
          >
            <Info className="w-5 h-5 mr-2" />
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
};