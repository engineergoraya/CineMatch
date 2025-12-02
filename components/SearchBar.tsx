import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Film, Tv, User } from "lucide-react";
import { tmdbService, getImageUrl } from "@/services/tmdb";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface SearchBarProps {
  onResultClick: (id: number, mediaType: 'movie' | 'tv') => void;
}

export const SearchBar = ({ onResultClick }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const data = await tmdbService.multiSearch(query);
        setResults(data.results.slice(0, 8));
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.media_type === 'person') return;
    onResultClick(result.id, result.media_type);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'tv': return <Tv className="w-4 h-4" />;
      case 'person': return <User className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const getTitle = (result: SearchResult) => {
    return result.title || result.name || 'Untitled';
  };

  const getYear = (result: SearchResult) => {
    const date = result.release_date || result.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  const getImage = (result: SearchResult) => {
    if (result.media_type === 'person') {
      return result.profile_path ? `https://image.tmdb.org/t/p/w92${result.profile_path}` : '/placeholder.svg';
    }
    return getImageUrl(result.poster_path);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="Search movies, TV shows, actors..."
          className="pl-10 bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:bg-black/80 transition-colors"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-cinema-dark/98 backdrop-blur-lg border border-border/50 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.media_type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  disabled={result.media_type === 'person'}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left",
                    result.media_type === 'person' && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <img
                    src={getImage(result)}
                    alt={getTitle(result)}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getTitle(result)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getIcon(result.media_type)}
                      <span className="capitalize">{result.media_type}</span>
                      {getYear(result) && <span>• {getYear(result)}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};