'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Search, TrendingUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'auction' | 'bloodline' | 'seller';
  category?: string;
}

interface QuickSearchProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export default function QuickSearch({
  placeholder = 'Szukaj aukcji, linii krwi, sprzedawców...',
  className = '',
  showSuggestions = true,
}: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 2) {
      // Pobierz sugestie z API
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(
            `/api/auctions/search-suggestions?q=${encodeURIComponent(query)}`
          );
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions.slice(0, 5));
            setIsOpen(true);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setIsOpen(false);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    // Sprawdź czy jesteśmy w przeglądarce
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    setSelectedIndex(-1);

    // Przekieruj do odpowiedniej strony
    if (suggestion.type === 'auction') {
      router.push(`/auctions/${suggestion.id}`);
    } else if (suggestion.type === 'bloodline') {
      router.push(`/search?bloodline=${encodeURIComponent(suggestion.title)}`);
    } else if (suggestion.type === 'seller') {
      router.push(`/search?seller=${encodeURIComponent(suggestion.title)}`);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'auction':
        return <TrendingUp className="w-4 h-4" />;
      case 'bloodline':
        return <Search className="w-4 h-4" />;
      case 'seller':
        return <Clock className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case 'auction':
        return 'Aukcja';
      case 'bloodline':
        return 'Linia krwi';
      case 'seller':
        return 'Sprzedawca';
      default:
        return 'Wynik';
    }
  };

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          placeholder={placeholder}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearQuery}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Wyczyść"
              aria-label="Wyczyść wyszukiwanie"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-gray-400">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getSuggestionLabel(suggestion.type)}
                        {suggestion.category && ` • ${suggestion.category}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {query && (
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 text-gray-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Szukaj &quot;{query}&quot;
                        </p>
                        <p className="text-xs text-gray-500">Wszystkie wyniki</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
