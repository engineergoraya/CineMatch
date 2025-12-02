import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TMDBMovie, TMDBDetails, tmdbService, getBackdropUrl } from "@/services/tmdb";
import { Star, Calendar, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel } from "@/components/Carousel";

interface MovieModalProps {
  movieId: number | null;
  mediaType: 'movie' | 'tv';
  onClose: () => void;
}

export const MovieModal = ({ movieId, mediaType, onClose }: MovieModalProps) => {
  const [details, setDetails] = useState<TMDBDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [similar, setSimilar] = useState<TMDBMovie[]>([]);
  const [showTrailer, setShowTrailer] = useState(true);

  useEffect(() => {
    if (!movieId) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setShowTrailer(true);
      try {
        const [detailsData, similarData] = await Promise.all([
          tmdbService.getDetails(movieId, mediaType),
          tmdbService.getSimilar(movieId, mediaType),
        ]);
        setDetails(detailsData);
        setSimilar(similarData.results.slice(0, 12));
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId, mediaType]);

  if (!movieId) return null;

  const trailer = details?.videos?.results.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  const title = details?.title || details?.name || '';
  const date = details?.release_date || details?.first_air_date || '';
  const year = date ? new Date(date).getFullYear() : '';

  const handleSimilarClick = (id: number) => {
    // Close and reopen with new ID
    onClose();
    setTimeout(() => {
      // Trigger parent to open new modal
      window.dispatchEvent(new CustomEvent('openMovie', { detail: { id, mediaType } }));
    }, 100);
  };

  return (
    <Dialog open={!!movieId} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-cinema-dark border-border/50 max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="w-full aspect-video" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : details ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </Button>

            {trailer && showTrailer ? (
              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTrailer(false)}
                  className="absolute top-4 left-4 bg-black/50 hover:bg-black/70"
                >
                  Show Backdrop
                </Button>
              </div>
            ) : (
              <div 
                className="aspect-video w-full bg-cover bg-center relative group/backdrop cursor-pointer"
                style={{ backgroundImage: `url(${getBackdropUrl(details.backdrop_path)})` }}
                onClick={() => trailer && setShowTrailer(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-black/50 to-transparent" />
                {trailer && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/backdrop:opacity-100 transition-opacity">
                    <Button size="lg" className="gradient-primary">
                      <Play className="w-6 h-6 mr-2 fill-current" />
                      Watch Trailer
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-accent font-semibold">
                      {details.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-secondary rounded-full text-xs font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed">{details.overview}</p>

              {details.credits?.cast && details.credits.cast.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Cast</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {details.credits.cast.slice(0, 10).map((actor) => (
                      <div key={actor.id} className="flex-shrink-0 text-center w-24">
                        <div className="w-24 h-24 rounded-full bg-secondary mb-2 overflow-hidden">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <span className="text-2xl">{actor.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium line-clamp-2">{actor.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {actor.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {similar.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg mb-3 px-6">Similar Titles</h3>
                  <Carousel
                    title=""
                    movies={similar}
                    onMovieClick={handleSimilarClick}
                  />
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};