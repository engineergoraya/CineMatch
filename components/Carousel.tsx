import { useEffect, useState, useRef } from "react";
import { TMDBMovie } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
  title: string;
  movies: TMDBMovie[];
  onMovieClick: (id: number) => void;
  loading?: boolean;
}

export const Carousel = ({ title, movies, onMovieClick, loading }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="mb-12 animate-pulse">
        <h2 className="text-2xl font-bold mb-4 px-6 bg-muted/20 h-8 w-48 rounded" />
        <div className="flex gap-4 px-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[200px] aspect-[2/3] bg-muted/20 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="mb-12 group/carousel">
      <h2 className="text-2xl font-bold mb-4 px-6">{title}</h2>
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 backdrop-blur-sm h-full rounded-none opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              className="min-w-[180px] md:min-w-[200px] flex-shrink-0 transform transition-transform duration-300 hover:scale-110 hover:z-10"
            >
              <MovieCard movie={movie} onClick={() => onMovieClick(movie.id)} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 backdrop-blur-sm h-full rounded-none opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}
      </div>
    </div>
  );
};