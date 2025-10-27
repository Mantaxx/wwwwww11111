import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
}

interface AuctionData {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  endTime: string;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'PENDING';
  sellerId: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Champion {
  id: string;
  name: string;
  ringNumber: string;
  bloodline: string;
  images: string[];
  pedigree: string;
}

interface Reference {
  id: string;
  breederName: string;
  location: string;
  experience: string;
  testimonial: string;
  rating: number;
  achievements: string; // JSON array of achievements
  isApproved: boolean;
  date: string;
}

interface BreederMeeting {
  id: string;
  title: string;
  description?: string;
  location: string;
  date: Date | string;
  images: string; // JSON array of image URLs
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Data state
  auctions: AuctionData[];
  champions: Champion[];
  references: Reference[];
  breederMeetings: BreederMeeting[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Currency settings
  currency: 'PLN' | 'EUR';
  ratePLNperEUR: number; // how many PLN for 1 EUR

  // Filters and search
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAuctions: (auctions: AuctionData[]) => void;
  setChampions: (champions: Champion[]) => void;
  setReferences: (references: Reference[]) => void;
  setBreederMeetings: (meetings: BreederMeeting[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: string) => void;
  setCurrency: (currency: 'PLN' | 'EUR') => void;
  setRatePLNperEUR: (rate: number) => void;

  // Computed values
  getFilteredAuctions: () => AuctionData[];
  getFilteredChampions: () => Champion[];
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        auctions: [],
        champions: [],
        references: [],
        breederMeetings: [],
        isLoading: false,
        error: null,
        searchTerm: '',
        selectedCategory: '',
        sortBy: 'newest',
        currency: 'EUR',
        ratePLNperEUR: 4.3,

        // Actions
        setUser: user => set({ user }),
        setAuthenticated: isAuthenticated => set({ isAuthenticated }),
        setAuctions: auctions => {
          set({ auctions });
        },
        setChampions: champions => set({ champions }),
        setReferences: references => set({ references }),
        setBreederMeetings: breederMeetings => set({ breederMeetings }),
        setLoading: isLoading => set({ isLoading }),
        setError: error => set({ error }),
        setSearchTerm: searchTerm => set({ searchTerm }),
        setSelectedCategory: selectedCategory => set({ selectedCategory }),
        setSortBy: sortBy => set({ sortBy }),
        setCurrency: currency => set({ currency }),
        setRatePLNperEUR: rate => set({ ratePLNperEUR: rate }),

        getFilteredAuctions: () => {
          const { auctions, searchTerm, selectedCategory, sortBy } = get();

          let filtered = auctions.filter(auction => {
            const matchesSearch =
              auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              auction.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || auction.category === selectedCategory;
            return matchesSearch && matchesCategory;
          });

          // Sort
          switch (sortBy) {
            case 'newest':
              filtered.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              break;
            case 'oldest':
              filtered.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              break;
            case 'price-low':
              filtered.sort((a, b) => a.currentPrice - b.currentPrice);
              break;
            case 'price-high':
              filtered.sort((a, b) => b.currentPrice - a.currentPrice);
              break;
            case 'ending-soon':
              filtered.sort(
                (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
              );
              break;
          }

          return filtered;
        },

        getFilteredChampions: () => {
          const { champions, searchTerm } = get();

          return champions.filter(
            champion =>
              champion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              champion.ringNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
              champion.bloodline.toLowerCase().includes(searchTerm.toLowerCase())
          );
        },
      }),
      {
        name: 'app-store',
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          searchTerm: state.searchTerm,
          selectedCategory: state.selectedCategory,
          sortBy: state.sortBy,
          currency: state.currency,
          ratePLNperEUR: state.ratePLNperEUR,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const useAuctions = () => useAppStore(state => state.auctions);
export const useChampions = () => useAppStore(state => state.champions);
export const useLoading = () => useAppStore(state => state.isLoading);
export const useError = () => useAppStore(state => state.error);

// Computed selectors
export const useFilteredAuctions = () => {
  return useAppStore(state => {
    let filtered = state.auctions.filter(auction => {
      const matchesSearch =
        auction.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        auction.description.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCategory =
        !state.selectedCategory || auction.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (state.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'ending-soon':
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        break;
    }

    return filtered;
  });
};

export const useFilteredChampions = () => useAppStore(state => state.getFilteredChampions());
