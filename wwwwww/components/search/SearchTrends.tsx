'use client';

import { motion } from 'framer-motion';
import { Clock, Search, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Trend {
  id: string;
  term: string;
  type: 'bloodline' | 'category' | 'seller' | 'general';
  popularity: number;
  change: number;
}

interface PopularSearch {
  id: string;
  term: string;
  count: number;
  type: 'bloodline' | 'category' | 'seller' | 'general';
}

export default function SearchTrends() {
  const [activeTab, setActiveTab] = useState<'trending' | 'popular'>('trending');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendsData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/search/trends');
        if (response.ok) {
          const data = await response.json();
          setTrends(data.trends || []);
          setPopularSearches(data.popularSearches || []);
        }
      } catch (error) {
        console.error('Error fetching trends data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'bloodline':
        return <Star className="w-4 h-4" />;
      case 'category':
        return <Search className="w-4 h-4" />;
      case 'seller':
        return <Clock className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendLabel = (type: string) => {
    switch (type) {
      case 'bloodline':
        return 'Linia krwi';
      case 'category':
        return 'Kategoria';
      case 'seller':
        return 'Sprzedawca';
      default:
        return 'Ogólne';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Trendy wyszukiwań</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'trending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Trendy
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'popular'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Popularne
          </button>
        </div>
      </div>

      {activeTab === 'trending' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Ładowanie trendów...</p>
            </div>
          ) : trends.length > 0 ? (
            trends.map((trend, index) => (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-gray-400">{getTrendIcon(trend.type)}</div>
                  <div>
                    <Link
                      href={`/search?q=${encodeURIComponent(trend.term)}`}
                      className="font-medium text-gray-900 hover:text-slate-600 transition-colors"
                    >
                      {trend.term}
                    </Link>
                    <p className="text-xs text-gray-500">{getTrendLabel(trend.type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{trend.popularity}%</span>
                    <span className={`text-xs font-medium ${getTrendColor(trend.change)}`}>
                      {trend.change > 0 ? '+' : ''}
                      {trend.change}%
                    </span>
                  </div>
                  <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-1 bg-slate-500 rounded-full transition-all duration-300 progress-bar"
                      data-width={`${trend.popularity}%`}
                      ref={el => {
                        if (el) {
                          el.style.setProperty('--progress-width', `${trend.popularity}%`);
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Brak dostępnych trendów</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'popular' && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Ładowanie popularnych wyszukiwań...</p>
            </div>
          ) : popularSearches.length > 0 ? (
            popularSearches.map((search, index) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-gray-400">{getTrendIcon(search.type)}</div>
                  <div>
                    <Link
                      href={`/search?q=${encodeURIComponent(search.term)}`}
                      className="font-medium text-gray-900 hover:text-slate-600 transition-colors"
                    >
                      {search.term}
                    </Link>
                    <p className="text-xs text-gray-500">{getTrendLabel(search.type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {search.count.toLocaleString()}
                  </span>
                  <p className="text-xs text-gray-500">wyszukiwań</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Brak dostępnych popularnych wyszukiwań</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="font-medium">Zobacz wszystkie trendy</span>
        </Link>
      </div>
    </div>
  );
}
