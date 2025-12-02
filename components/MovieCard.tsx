import { TMDBMovie, getImageUrl } from "@/services/tmdb";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MovieCardProps {
  movie: TMDBMovie;
  onClick: () => void;
}

export const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  const title = movie.title || movie.name || 'Untitled';
  const date = movie.release_date || movie.first_air_date || '';
  const year = date ? new Date(date).getFullYear() : '';
  const rating = movie.vote_average.toFixed(1);

  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer card-hover bg-card border-border/50"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{year}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-accent font-semibold">{rating}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};