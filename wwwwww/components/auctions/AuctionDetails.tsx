'use client';

import { FullscreenImageModal } from '@/components/ui/FullscreenImageModal';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileVerification } from '@/hooks/useProfileVerification';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Eye, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AuctionDetailsProps {
  auctionId: string;
}

interface Bid {
  id: string;
  amount: number;
  bidder: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isWinning: boolean;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
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
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    rating: number;
    salesCount: number;
  };
  images: string[];
  videos?: string[];
  documents?: string[];
  bids: Bid[];
  watchersCount: number;
  viewsCount: number;
}

// Funkcja do pobierania aukcji z API
const getAuctionById = async (id: string): Promise<Auction | null> => {
  try {
    const response = await fetch(`/api/auctions/${id}`);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Aukcja nie jest jeszcze zatwierdzona przez administratora');
      }
      if (response.status === 404) {
        throw new Error('Aukcja nie została znaleziona');
      }
      throw new Error('Błąd podczas pobierania aukcji');
    }

    const auction = await response.json();
    if (!auction) return null;

    // const now = new Date() // unused
    const end = new Date(auction.endTime);

    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      buyNowPrice: auction.buyNowPrice,
      endTime: end,
      status: auction.status.toLowerCase(),
      category: auction.category,
      bloodline: auction.pigeon?.bloodline || '',
      age: 0, // Domyślny wiek
      sex: auction.pigeon?.gender || 'male',
      location: 'Brak lokalizacji', // Domyślna lokalizacja
      seller: {
        id: auction.seller.id,
        firstName: auction.seller.firstName,
        lastName: auction.seller.lastName,
        email: auction.seller.email,
        phoneNumber: auction.seller.phoneNumber,
        avatar: auction.seller.image || null,
        rating: 0, // Brak systemu ocen
        salesCount: 0, // Brak danych o sprzedaży
      },
      images:
        auction.assets
          ?.filter((a: { type: string; url: string }) => a.type === 'IMAGE')
          .map((a: { url: string }) => a.url) || [],
      videos:
        auction.assets
          ?.filter((a: { type: string; url: string }) => a.type === 'VIDEO')
          .map((a: { url: string }) => a.url) || [],
      documents:
        auction.assets
          ?.filter((a: { type: string; url: string }) => a.type === 'DOCUMENT')
          .map((a: { url: string }) => a.url) || [],
      bids:
        auction.bids?.map(
          (
            bid: {
              id: string;
              amount: number;
              bidder: { id: string; firstName?: string; lastName?: string };
              createdAt: string;
            },
            index: number
          ) => ({
            id: bid.id,
            amount: bid.amount,
            bidder: {
              id: bid.bidder.id,
              name:
                `${bid.bidder.firstName || ''} ${bid.bidder.lastName || ''}`.trim() ||
                bid.bidder.id,
            },
            timestamp: new Date(bid.createdAt),
            isWinning: index === 0,
          })
        ) || [],
      watchersCount: auction._count?.watchlist || 0,
      viewsCount: 0,
    };
  } catch (error) {
    console.error('Error fetching auction:', error);
    return null;
  }
};

export default function AuctionDetails({ auctionId }: AuctionDetailsProps) {
  const { user } = useAuth();
  const { canBid, missingFields } = useProfileVerification();
  const currencyStore = useAppStore();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [isPedigreeFullscreen, setIsPedigreeFullscreen] = useState(false);

  // Funkcje do obsługi pełnoekranowego widoku
  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenOpen(true);
    setIsPedigreeFullscreen(false);
  };

  const openFullscreenPedigree = () => {
    setIsPedigreeFullscreen(true);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    setIsPedigreeFullscreen(false);
  };

  // Ładowanie aukcji
  useEffect(() => {
    const loadAuction = async () => {
      try {
        const loadedAuction = await getAuctionById(auctionId);
        setAuction(loadedAuction);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd podczas ładowania aukcji');
        setAuction(null);
      }
    };
    loadAuction();
  }, [auctionId]);

  // Timer effect
  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const now = new Date();
      const endTime = auction.endTime;
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Aukcja zakończona');
        setAuction(prev => (prev ? { ...prev, status: 'ended' } : null));

        // Sprawdź czy użytkownik wygrał licytację
        const winningBid = auction.bids.find(bid => bid.isWinning);
        if (winningBid && user?.displayName === winningBid.bidder.name) {
          const successData = {
            type: 'auction_won',
            auctionId: auction.id,
            auctionTitle: auction.title,
            price: winningBid.amount,
            seller: {
              name: `${auction.seller.firstName} ${auction.seller.lastName}`,
              id: auction.seller.id,
              rating: 0, // Brak systemu ocen
              salesCount: 0, // Brak danych o sprzedaży
              avatar: null, // Brak awatara
              location: auction.location || 'Brak lokalizacji',
              phone: auction.seller.phoneNumber || 'Brak numeru telefonu',
              email: auction.seller.email,
            },
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem('auctionSuccess', JSON.stringify(successData));
          setTimeout(() => {
            window.location.href = '/auctions/success';
          }, 2000);
        }

        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
        if (minutes <= 1) {
          setAuction(prev => (prev ? { ...prev, status: 'ending' } : null));
        }
      } else {
        setTimeLeft(`${seconds}s`);
        setAuction(prev => (prev ? { ...prev, status: 'ending' } : null));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction?.endTime, auction, user?.displayName]);

  if (!auction && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aukcja niedostępna</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/auctions" className="btn-primary">
            Powrót do aukcji
          </a>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <UnifiedCard variant="glass" className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-4">Ładowanie...</h1>
            <p className="text-white/70 mb-6">Pobieranie danych aukcji...</p>
          </UnifiedCard>
        </div>
      </UnifiedLayout>
    );
  }

  const handleBid = async () => {
    if (!canBid) {
      alert(
        `Aby licytować, musisz uzupełnić profil i zweryfikować numer telefonu. Brakujące pola: ${missingFields.join(', ')}`
      );
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (!bidAmount || bidValue <= auction.currentPrice) {
      alert(`Oferta musi być wyższa od aktualnej ceny ${formatPrice(auction.currentPrice)}`);
      return;
    }

    setIsBidding(true);

    try {
      const response = await fetch(`/api/auctions/${auction.id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bidValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Odśwież dane aukcji
        const auctionResponse = await fetch(`/api/auctions/${auction.id}`);
        if (auctionResponse.ok) {
          const updatedAuctionData = await auctionResponse.json();
          setAuction(updatedAuctionData);
        }

        setBidAmount('');
        alert(`Licytacja ${formatPrice(bidValue)} została złożona!`);
      } else {
        // Obsługa błędów z serwera
        if (data.missingFields) {
          alert(`${data.message}\nBrakujące pola: ${data.missingFields.join(', ')}`);
        } else {
          alert(data.error || 'Błąd podczas składania licytacji');
        }
      }
    } catch (error) {
      console.error('Błąd podczas składania licytacji:', error);
      alert('Wystąpił błąd podczas składania licytacji');
    } finally {
      setIsBidding(false);
    }
  };

  const handleBuyNow = () => {
    // Przekierowanie do strony podsumowującej zakup
    const successData = {
      type: 'buy_now',
      auctionId: auction.id,
      auctionTitle: auction.title,
      price: auction.buyNowPrice,
      seller: {
        name: `${auction.seller.firstName} ${auction.seller.lastName}`,
        id: auction.seller.id,
        rating: 0, // Brak systemu ocen
        salesCount: 0, // Brak danych o sprzedaży
        avatar: null, // Brak awatara
        location: auction.location || 'Brak lokalizacji',
        phone: auction.seller.phoneNumber || 'Brak numeru telefonu',
        email: auction.seller.email,
      },
      timestamp: new Date().toISOString(),
    };

    // Zapisanie danych do localStorage dla strony sukcesu
    localStorage.setItem('auctionSuccess', JSON.stringify(successData));

    // Przekierowanie do strony sukcesu
    window.location.href = '/auctions/success';
  };

  const minBidAmount = auction.currentPrice + 100;
  const formatPrice = (value: number) => {
    if (currencyStore.currency === 'EUR') {
      const eur = Math.round(value / currencyStore.ratePLNperEUR);
      return `${eur.toLocaleString('pl-PL')} EUR`;
    }
    return `${value.toLocaleString('pl-PL')} PLN`;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Główna zawartość */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria zdjęć */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:border-white/80 transition-colors"
            >
              <div
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-900 cursor-pointer group"
                onClick={() => auction.images && auction.images[0] && openFullscreen(0)}
              >
                {auction.images && auction.images[0] ? (
                  <>
                    <Image
                      src={auction.images[0]}
                      alt={auction.title}
                      fill
                      className="object-contain transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      onError={e => {
                        console.error('Image failed to load:', auction.images[0]);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Overlay z ikoną powiększenia */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-3">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p>Brak zdjęcia</p>
                    </div>
                  </div>
                )}
                {auction.status === 'ending' && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Kończy się wkrótce!
                  </div>
                )}
              </div>

              {auction.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {auction.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-white/50 transition-all"
                      onClick={() => openFullscreen(index + 1)}
                    >
                      <Image
                        src={image}
                        alt={`${auction.title} ${index + 2}`}
                        fill
                        className="object-contain transition-transform group-hover:scale-110"
                        sizes="200px"
                      />
                      {/* Overlay z ikoną powiększenia */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Szczegóły aukcji */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card hover:border-white/80 transition-colors"
            >
              <h1 className="text-2xl font-bold text-white mb-4">{auction.title}</h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="w-4 h-4" />
                  {auction.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Calendar className="w-4 h-4" />
                  {auction.age} lat
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Users className="w-4 h-4" />
                  {auction.sex === 'male' ? 'Samiec' : 'Samica'}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Eye className="w-4 h-4" />
                  {auction.viewsCount} wyświetleń
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-white/80 leading-relaxed">{auction.description}</p>
              </div>
            </motion.div>

            {/* Rodowód */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card hover:border-white/80 transition-colors"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Rodowód</h2>
              <div
                className="relative w-full h-96 border border-white/30 rounded-md overflow-hidden bg-gray-900 cursor-pointer group"
                onClick={() =>
                  auction.documents && auction.documents[0] && openFullscreenPedigree()
                }
              >
                {auction.documents && auction.documents.length > 0 ? (
                  <>
                    <Image
                      src={auction.documents[0]}
                      alt={`${auction.title} pedigree`}
                      fill
                      className="object-contain transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    {/* Overlay z ikoną powiększenia */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-3">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-lg mb-2">Brak rodowodu</p>
                      <p className="text-sm">Rodowód nie został jeszcze dodany</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Historia licytacji */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card hover:border-white/80 transition-colors"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Historia licytacji</h2>

              <div className="space-y-3">
                {auction.bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      bid.isWinning ? 'bg-green-50 border border-green-200' : 'bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{bid.bidder.name}</p>
                        <p className="text-sm text-white/60">
                          {format(bid.timestamp, 'dd.MM.yyyy HH:mm', { locale: pl })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{bid.amount.toLocaleString()} zł</p>
                      {bid.isWinning && (
                        <p className="text-sm text-green-400 font-medium">Wygrywa</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Prawa kolumna */}
          <div className="space-y-6">
            {/* Panel licytacji + Odliczanie */}
            {auction.status !== 'ended' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="card hover:border-white/80 transition-colors"
              >
                {/* Countdown */}
                <div className="text-center mb-6">
                  <div className="text-sm text-white/80">Pozostało czasu</div>
                  <div
                    className={`text-2xl font-bold ${auction.status === 'ending' ? 'text-red-400' : 'text-white'}`}
                  >
                    {timeLeft || '—'}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">Złóż ofertę</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="bid-amount-input"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Twoja oferta (min. {formatPrice(minBidAmount)})
                    </label>
                    <input
                      id="bid-amount-input"
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      min={minBidAmount}
                      step="50"
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white/10 text-white placeholder-white/40"
                      placeholder="Wprowadź kwotę oferty"
                      title="Wprowadź kwotę swojej oferty"
                      aria-describedby="bid-amount-help"
                    />
                  </div>

                  <button
                    onClick={handleBid}
                    disabled={!bidAmount || parseFloat(bidAmount) < minBidAmount || isBidding}
                    className="w-full bg-slate-600 text-white py-3 px-4 rounded-md font-medium hover:bg-slate-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {isBidding ? 'Licytuję...' : 'Złóż ofertę'}
                  </button>

                  {auction.buyNowPrice && (
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
                    >
                      Kup teraz za {formatPrice(auction.buyNowPrice)}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Oferty */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="card hover:border-white/80 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Oferty</h3>
              <div className="space-y-4">
                {auction.bids.slice(0, 5).map(bid => (
                  <div key={bid.id} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400"></span>
                    <div className="flex-1">
                      <div className="text-xs text-white/60">
                        {format(bid.timestamp, 'dd MMM • HH:mm', { locale: pl })}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-white">{formatPrice(bid.amount)}</span>
                        <span className="text-white/60"> od {bid.bidder.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full bg-white/10 text-white/80 py-2 px-4 rounded-md text-sm font-medium hover:bg-white/20 transition-colors">
                Pokaż wszystkie oferty
              </button>
            </motion.div>

            {/* Breeder/Supplier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card hover:border-white/80 transition-colors"
            >
              <h4 className="text-sm font-semibold text-white">Breeder(s)</h4>
              <p className="text-sm text-white/80 mt-1">{`${auction.seller.firstName} ${auction.seller.lastName}`}</p>
              <div className="h-px bg-white/20 my-4" />
              <h4 className="text-sm font-semibold text-white">Supplier(s)</h4>
              <p className="text-sm text-white/80 mt-1">{`${auction.seller.firstName} ${auction.seller.lastName}`}</p>
            </motion.div>

            {/* Charakterystyka i Ocena jakości */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="card hover:border-white/80 transition-colors"
            >
              <h4 className="text-sm font-semibold text-white mb-3">Charakterystyka</h4>
              <div className="text-sm divide-y divide-white/20 mb-4">
                {[
                  ['Płeć', auction.sex === 'male' ? 'Samiec' : 'Samica'],
                  ['Kolor oka', 'żółty'],
                  ['Barwa gołębia', 'szpak'],
                  ['Dyscypliny', 'krótki dystans, średni dystans'],
                  ['Certyfikat DNA', 'Oboje rodziców'],
                  ['Wielkość', 'średni'],
                  ['Budowa korpusu', 'normalny'],
                  ['Witalność', 'silny'],
                  ['Gęstość barwy', 'bardzo silny'],
                  ['Długość', 'średni'],
                  ['Wytrzymałość', 'silny'],
                  ['Siła widełek', 'silny'],
                  ['Układ widełek', 'lekko otwarty'],
                  ['Mięśnie', 'giętki'],
                  ['Balans', 'zbalansowany'],
                  ['Plecy', 'przeciętny'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between py-1.5">
                    <span className="text-white/60">{label as string}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-medium">{value as string}</span>
                      <span className="h-3 w-3 rounded-full bg-blue-400" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>

              <h5 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">
                Opis skrzydła
              </h5>
              <div className="text-sm divide-y divide-white/20">
                {[
                  ['Pióra rozpłodowe', 'za młody'],
                  ['Lotki', 'długi, normalny'],
                  ['Upierzenie', 'normalne upierzenie'],
                  ['Jakość piór', 'miękki'],
                  ['Lotki II-go rzędu', 'normalny'],
                  ['Elastyczność', 'bardzo giętki'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between py-1.5">
                    <span className="text-white/60">{label as string}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-medium">{value as string}</span>
                      <span className="h-3 w-3 rounded-full bg-blue-400" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 text-xs text-white/60 flex items-center justify-between">
                <span>Data aukcji</span>
                <span className="text-white/80 font-medium">
                  {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: pl })}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dodatkowy odstęp na dole */}
      <div className="h-20"></div>

      {/* Modal pełnoekranowy */}
      {auction && (
        <FullscreenImageModal
          isOpen={isFullscreenOpen}
          onClose={closeFullscreen}
          images={isPedigreeFullscreen ? auction.documents || [] : auction.images}
          currentIndex={isPedigreeFullscreen ? 0 : fullscreenImageIndex}
          title={isPedigreeFullscreen ? `${auction.title} - Rodowód` : auction.title}
        />
      )}
    </div>
  );
}
