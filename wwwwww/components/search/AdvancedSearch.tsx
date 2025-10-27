'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SearchFilters {
  query: string;
  category: string;
  bloodline: string;
  priceMin: number;
  priceMax: number;
  ageMin: number;
  ageMax: number;
  sex: string;
  location: string;
  sellerRating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  startingPrice: number;
  buyNowPrice?: number;
  endTime: Date;
  status: 'active' | 'ending' | 'ended';
  category: string;
  bloodline: string;
  age: number;
  sex: 'male' | 'female';
  location: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    salesCount: number;
  };
  images: string[];
  bids: number;
  watchers: number;
  views: number;
}

const categories = [
  { value: '', label: 'Wszystkie kategorie' },
  { value: 'Champions', label: 'Championy' },
  { value: 'Young Birds', label: 'Młode gołębie' },
  { value: 'Supplements', label: 'Suplementy' },
  { value: 'Accessories', label: 'Akcesoria' },
];

const bloodlines = [
  { value: '', label: 'Wszystkie linie krwi' },
  { value: 'Janssen', label: 'Janssen' },
  { value: 'Sion', label: 'Sion' },
  { value: 'Bricoux', label: 'Bricoux' },
  { value: 'Van Loon', label: 'Van Loon' },
];

const sortOptions = [
  { value: 'endTime', label: 'Czas zakończenia' },
  { value: 'currentPrice', label: 'Cena' },
  { value: 'bids', label: 'Liczba ofert' },
  { value: 'views', label: 'Popularność' },
  { value: 'createdAt', label: 'Data dodania' },
];

export default function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    bloodline: '',
    priceMin: 0,
    priceMax: 100000,
    ageMin: 0,
    ageMax: 10,
    sex: '',
    location: '',
    sellerRating: 0,
    sortBy: 'endTime',
    sortOrder: 'asc',
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = useCallback(async () => {
    setIsLoading(true);

    try {
      // Buduj parametry zapytania
      const params = new URLSearchParams();

      if (filters.query) params.append('search', filters.query);
      if (filters.category) params.append('category', filters.category);
      if (filters.bloodline) params.append('bloodline', filters.bloodline);
      if (filters.priceMin) params.append('minPrice', filters.priceMin.toString());
      if (filters.priceMax) params.append('maxPrice', filters.priceMax.toString());
      if (filters.location) params.append('location', filters.location);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      // Wyślij zapytanie do API
      const response = await fetch(`/api/auctions?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();

        // Przekształć dane z API na format SearchResult
        const transformedResults: SearchResult[] = data.auctions.map(
          (auction: {
            id: string;
            title: string;
            description: string;
            currentPrice: number;
            startingPrice: number;
            buyNowPrice?: number;
            endTime: string;
            status: string;
            category: string;
            pigeon?: {
              bloodline?: string;
              age?: number;
              gender?: string;
            };
            seller: { id: string; firstName?: string; lastName?: string };
            images?: string[];
            assets?: Array<{ type: string; url: string }>;
            _count?: { bids?: number; watchlist?: number };
          }) => ({
            id: auction.id,
            title: auction.title,
            description: auction.description,
            currentPrice: auction.currentPrice,
            startingPrice: auction.startingPrice,
            buyNowPrice: auction.buyNowPrice,
            endTime: new Date(auction.endTime),
            status: auction.status.toLowerCase(),
            category: auction.category,
            bloodline: auction.pigeon?.bloodline || '',
            age: auction.pigeon?.age || 0,
            sex: auction.pigeon?.gender || 'male',
            location: '',
            seller: {
              id: auction.seller.id,
              name:
                `${auction.seller.firstName || ''} ${auction.seller.lastName || ''}`.trim() ||
                auction.seller.id,
              rating: 0, // Brak systemu ocen
              salesCount: 0, // Brak danych o sprzedaży
            },
            images:
              auction.assets
                ?.filter((a: { type: string; url: string }) => a.type === 'IMAGE')
                .map(a => a.url) || [],
            bids: auction._count?.bids || 0,
            watchers: auction._count?.watchlist || 0,
            views: 0,
          })
        );

        setResults(transformedResults);
      } else {
        console.error('Error fetching search results');
        setResults([]);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      bloodline: '',
      priceMin: 0,
      priceMax: 100000,
      ageMin: 0,
      ageMax: 10,
      sex: '',
      location: '',
      sellerRating: 0,
      sortBy: 'endTime',
      sortOrder: 'asc',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktywna';
      case 'ending':
        return 'Kończy się';
      case 'ended':
        return 'Zakończona';
      default:
        return status;
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [filters, handleSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wyszukiwanie aukcji</h1>
          <p className="text-gray-600">Znajdź idealnego gołębia pocztowego lub akcesoria</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar z filtrami */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filtry</h2>
                <button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isFiltersOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {(isFiltersOpen || (isClient && window.innerWidth >= 1024)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* Wyszukiwanie tekstowe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Szukaj</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={filters.query}
                          onChange={e => handleFilterChange('query', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          placeholder="Nazwa, opis..."
                        />
                      </div>
                    </div>

                    {/* Kategoria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategoria
                      </label>
                      <select
                        value={filters.category}
                        onChange={e => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                        aria-label="Wybierz kategorię"
                        title="Wybierz kategorię"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Linia krwi */}
                    {filters.category === 'Pigeon' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Linia krwi
                        </label>
                        <select
                          value={filters.bloodline}
                          onChange={e => handleFilterChange('bloodline', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          aria-label="Wybierz linię krwi"
                          title="Wybierz linię krwi"
                        >
                          {bloodlines.map(bloodline => (
                            <option key={bloodline.value} value={bloodline.value}>
                              {bloodline.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Przedział cenowy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cena (zł)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={filters.priceMin}
                          onChange={e =>
                            handleFilterChange('priceMin', parseInt(e.target.value) || 0)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={filters.priceMax}
                          onChange={e =>
                            handleFilterChange('priceMax', parseInt(e.target.value) || 100000)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    {/* Wiek (tylko dla gołębi) */}
                    {filters.category === 'Pigeon' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wiek (lata)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={filters.ageMin}
                            onChange={e =>
                              handleFilterChange('ageMin', parseInt(e.target.value) || 0)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Min"
                          />
                          <input
                            type="number"
                            value={filters.ageMax}
                            onChange={e =>
                              handleFilterChange('ageMax', parseInt(e.target.value) || 10)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    )}

                    {/* Płeć (tylko dla gołębi) */}
                    {filters.category === 'Pigeon' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Płeć</label>
                        <select
                          value={filters.sex}
                          onChange={e => handleFilterChange('sex', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          aria-label="Wybierz płeć"
                          title="Wybierz płeć"
                        >
                          <option value="">Wszystkie</option>
                          <option value="male">Samiec</option>
                          <option value="female">Samica</option>
                        </select>
                      </div>
                    )}

                    {/* Lokalizacja */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokalizacja
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={filters.location}
                          onChange={e => handleFilterChange('location', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          placeholder="Miasto, region..."
                        />
                      </div>
                    </div>

                    {/* Ocena sprzedawcy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min. ocena sprzedawcy
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={filters.sellerRating}
                          onChange={e =>
                            handleFilterChange('sellerRating', parseFloat(e.target.value))
                          }
                          className="flex-1"
                          aria-label="Minimalna ocena sprzedawcy"
                          title="Minimalna ocena sprzedawcy"
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {filters.sellerRating.toFixed(1)}★
                        </span>
                      </div>
                    </div>

                    {/* Sortowanie */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sortuj według
                      </label>
                      <div className="space-y-2">
                        <select
                          value={filters.sortBy}
                          onChange={e => handleFilterChange('sortBy', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          aria-label="Wybierz kryterium sortowania"
                          title="Wybierz kryterium sortowania"
                        >
                          {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={filters.sortOrder}
                          onChange={e =>
                            handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          aria-label="Wybierz kolejność sortowania"
                          title="Wybierz kolejność sortowania"
                        >
                          <option value="asc">Rosnąco</option>
                          <option value="desc">Malejąco</option>
                        </select>
                      </div>
                    </div>

                    {/* Przyciski */}
                    <div className="flex gap-2">
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Wyczyść
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? 'Szukam...' : 'Szukaj'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Wyniki wyszukiwania */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Znaleziono {results.length} wyników
                </h2>
                <p className="text-sm text-gray-600">
                  {filters.query && `dla zapytania "${filters.query}"`}
                </p>
              </div>
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtry
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Wyszukuję...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map(result => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0" />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{result.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}
                          >
                            {getStatusText(result.status)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{result.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>{result.currentPrice.toLocaleString()} zł</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{result.bids} ofert</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{result.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Star className="w-4 h-4" />
                            <span>
                              {result.seller.rating} ({result.seller.salesCount})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Sprzedawca: {result.seller.name}
                          </div>
                          <button className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors">
                            Zobacz szczegóły
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {results.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Brak wyników</h3>
                    <p className="text-gray-600">Spróbuj zmienić kryteria wyszukiwania</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
