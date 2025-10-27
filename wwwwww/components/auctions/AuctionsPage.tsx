'use client';

import CreateAuctionForm from '@/components/auctions/CreateAuctionForm';
import { FullscreenImageModal } from '@/components/ui/FullscreenImageModal';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, useError, useFilteredAuctions, useLoading } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Gavel, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuctionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { setAuctions, setSearchTerm, setLoading, setError, searchTerm } = useAppStore();
  const filteredAuctions = useFilteredAuctions();
  const isLoading = useLoading();
  const error = useError();
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'PENDING'
  >('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nowTs, setNowTs] = useState<number>(Date.now());
  // const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({}) // unused
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImages, setFullscreenImages] = useState<string[]>([]);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [fullscreenTitle, setFullscreenTitle] = useState('');

  useEffect(() => {
    // Load auctions data from API
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auctions');
        if (response.ok) {
          const data = await response.json();
          // Mapuj assets na images dla kompatybilności
          const auctionsWithImages = (data.auctions || []).map(
            (auction: {
              assets?: Array<{ type: string; url: string }>;
              [key: string]: unknown;
            }) => ({
              ...auction,
              images:
                auction.assets
                  ?.filter((asset: { type: string; url: string }) => asset.type === 'IMAGE')
                  .map((asset: { type: string; url: string }) => asset.url) || [],
              documents:
                auction.assets
                  ?.filter((asset: { type: string; url: string }) => asset.type === 'DOCUMENT')
                  .map((asset: { type: string; url: string }) => asset.url) || [],
            })
          );
          setAuctions(auctionsWithImages);
        } else {
          setError('Błąd podczas ładowania aukcji');
        }
      } catch (err) {
        setError('Błąd podczas ładowania aukcji');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [setAuctions, setLoading, setError]);

  // Live ticking for countdowns
  useEffect(() => {
    const interval = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (endTimeStr: string) => {
    const endTime = new Date(endTimeStr);
    const diff = endTime.getTime() - nowTs;
    if (diff <= 0) return 'Zakończona';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  const isEndingSoon = (endTimeStr: string) => {
    const endTime = new Date(endTimeStr);
    const diff = endTime.getTime() - nowTs;
    return diff > 0 && diff <= 3600000; // < 1h
  };

  // const formatPrice = (price: number) => {
  //     return `${price.toLocaleString()} zł`
  // } // unused

  const openFullscreen = (auction: { images?: string[]; title: string }) => {
    if (auction.images && auction.images.length > 0) {
      setFullscreenImages(auction.images);
      setFullscreenIndex(0);
      setFullscreenTitle(auction.title);
      setIsFullscreen(true);
    }
  };

  const handleBuyNow = (auctionId: string) => {
    const auction = filteredAuctions.find(a => a.id === auctionId);
    if (!auction || !auction.buyNowPrice) return;

    const successData = {
      type: 'buy_now',
      auctionId: auction.id,
      auctionTitle: auction.title,
      price: auction.buyNowPrice,
      seller: {
        name: auction.sellerId, // Używamy sellerId jako nazwy
        id: auction.sellerId,
        rating: 0, // Brak systemu ocen
        salesCount: 0, // Brak danych o sprzedaży
        avatar: null, // Brak awatara
        location: 'Brak lokalizacji',
        phone: 'Brak numeru telefonu',
        email: 'Brak email',
      },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('auctionSuccess', JSON.stringify(successData));
    window.location.href = '/auctions/success';
  };

  // Filter by status
  const statusFilteredAuctions = filteredAuctions.filter(
    auction => filterStatus === 'all' || auction.status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center -mt-48">
        <UnifiedCard variant="glass" className="p-8 text-center border-2 border-white shadow-xl">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Ładowanie aukcji...</h2>
          <p className="text-white/70">Przygotowujemy najlepsze oferty dla Ciebie</p>
        </UnifiedCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 -mt-48">
        <UnifiedCard variant="glass" className="p-8 text-center border-2 border-white shadow-xl">
          <p className="text-lg mb-4 text-red-400">{error}</p>
          <UnifiedButton
            variant="primary"
            onClick={() => window.location.reload()}
            intensity="high"
          >
            Spróbuj ponownie
          </UnifiedButton>
        </UnifiedCard>
      </div>
    );
  }

  return (
    <>
      <div className="pt-1 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto text-center mb-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-2">Aukcje Gołębi</h1>
          <p className="text-3xl md:text-4xl text-white/90 mb-2 max-w-3xl mx-auto">
            Licytuj ekskluzywne gołębie pocztowe z rodowodami championów
          </p>

          <div className="mb-8">
            <button
              onClick={() => {
                if (user) {
                  setShowCreateForm(true);
                } else {
                  router.push('/auth/signin');
                }
              }}
              className="bg-white/10 backdrop-blur-md rounded-2xl px-12 py-6 text-2xl font-bold text-white border border-white/20 hover:bg-white/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto"
            >
              <Plus className="w-10 h-10 mr-4" />
              Dodaj aukcję
            </button>
            {user && (
              <div className="text-center text-sm text-white/60 mt-2">
                Debug: Przycisk widoczny dla użytkownika {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
          <div className="w-full">
            {/* Filters */}
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <UnifiedCard variant="glass" className="p-6 border-2 border-white shadow-xl">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                    <input
                      type="text"
                      placeholder=""
                      aria-label="Szukaj gołębi"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 solid-morphism rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border-2 border-white bg-white/90"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex gap-2">
                    {['all', 'ACTIVE', 'PENDING', 'CANCELLED', 'ENDED'].map(status => (
                      <div key={status}>
                        <button
                          onClick={() => setFilterStatus(status as typeof filterStatus)}
                          className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                            filterStatus === status
                              ? 'bg-gradient-to-r from-blue-600/80 to-blue-800/80 text-white'
                              : 'glass-morphism text-white/70 hover:glass-morphism-strong hover:text-white'
                          } relative overflow-hidden`}
                        >
                          {status === 'all' && 'Wszystkie'}
                          {status === 'ACTIVE' && 'Aktywne'}
                          {status === 'PENDING' && 'Oczekujące'}
                          {status === 'CANCELLED' && 'Anulowane'}
                          {status === 'ENDED' && 'Zakończone'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Create Auction Button */}
                  <button
                    onClick={() => {
                      if (user) {
                        setShowCreateForm(true);
                      } else {
                        router.push('/auth/signin');
                      }
                    }}
                    className="flex items-center gap-2 btn-primary"
                    aria-label="Dodaj nową aukcję"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Dodaj aukcję</span>
                  </button>
                </div>
              </UnifiedCard>
            </motion.section>

            {/* Auctions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {statusFilteredAuctions.length > 0 ? (
                statusFilteredAuctions.map((auction, index) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, y: 50, rotateY: -10 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.05, type: 'spring' }}
                    viewport={{ once: true, margin: '-100px' }}
                    className="group"
                  >
                    <Link href={`/auctions/${auction.id}`} className="block h-full">
                      <UnifiedCard
                        variant="glass"
                        glow={false}
                        className="overflow-hidden h-full flex flex-col hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        {/* Image - Większe zdjęcie z możliwością fullscreen */}
                        <div
                          className="relative w-full h-64 bg-gray-100 overflow-hidden rounded-t-lg cursor-pointer group"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            openFullscreen(auction);
                          }}
                        >
                          {auction.images?.[0] ? (
                            <>
                              <Image
                                src={auction.images[0]}
                                alt={auction.title}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onError={() => {
                                  console.error('Auction image failed to load:', auction.images[0]);
                                }}
                              />
                              {/* Hover overlay z ikoną powiększenia */}
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
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <div className="text-center">
                                <div className="text-4xl mb-2">📷</div>
                                <p className="text-sm">Brak zdjęcia</p>
                              </div>
                            </div>
                          )}
                          {/* Status Badge */}
                          <div className="absolute top-4 left-4">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-lg
                                                        ${auction.status === 'ACTIVE' ? 'bg-emerald-600' : ''}
                                                        ${auction.status === 'PENDING' ? 'bg-amber-600' : ''}
                                                        ${auction.status === 'CANCELLED' ? 'bg-gray-500' : ''}
                                                        ${auction.status === 'ENDED' ? 'bg-rose-600' : ''}
                                                    `}
                            >
                              {auction.status === 'ACTIVE' && 'Aktywna'}
                              {auction.status === 'PENDING' && 'Oczekuje'}
                              {auction.status === 'CANCELLED' && 'Anulowana'}
                              {auction.status === 'ENDED' && 'Zakończona'}
                            </span>
                          </div>
                        </div>

                        {/* Content - Uproszczony */}
                        <div className="p-6 flex flex-col grow">
                          {/* Tytuł */}
                          <h3 className="text-lg font-bold text-white line-clamp-2 mb-4">
                            {auction.title}
                          </h3>

                          {/* Kwota i czas */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/70">Aktualna cena:</span>
                              <span className="text-xl font-bold text-white">
                                {`${Math.round(auction.currentPrice / useAppStore.getState().ratePLNperEUR)} EUR`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/70">Czas do końca:</span>
                              <span
                                className={`text-sm font-semibold flex items-center gap-2 ${isEndingSoon(auction.endTime) ? 'text-red-400' : 'text-white'}`}
                              >
                                <Calendar
                                  className={`w-4 h-4 ${isEndingSoon(auction.endTime) ? 'text-red-400' : 'text-white/70'}`}
                                />
                                {formatTimeLeft(auction.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Większe i bardziej widoczne */}
                        <div className="p-6 pt-0" onClick={e => e.stopPropagation()}>
                          {auction.status === 'ENDED' ? (
                            <div className="text-center text-white/70 py-4">Aukcja zakończona</div>
                          ) : (
                            <div className="space-y-3">
                              {/* Przyciski funkcjonalne pokazujące i obsługujące typ aukcji */}
                              {auction.startingPrice > 0 && auction.buyNowPrice ? (
                                // Aukcja z obiema opcjami: licytacja + kup teraz
                                <div className="flex gap-2">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      // Przekieruj do strony aukcji dla licytacji
                                      router.push(`/auctions/${auction.id}`);
                                    }}
                                    className="inline-flex items-center justify-center flex-1 h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    Licytuj
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleBuyNow(auction.id);
                                    }}
                                    className="inline-flex items-center justify-center flex-1 h-10 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                  >
                                    Kup teraz
                                  </button>
                                </div>
                              ) : auction.startingPrice > 0 ? (
                                // Aukcja tylko z licytacją
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    // Przekieruj do strony aukcji dla licytacji
                                    router.push(`/auctions/${auction.id}`);
                                  }}
                                  className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Licytuj
                                </button>
                              ) : auction.buyNowPrice ? (
                                // Aukcja tylko z kup teraz
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleBuyNow(auction.id);
                                  }}
                                  className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  Kup teraz
                                </button>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </UnifiedCard>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 py-12">
                  <UnifiedCard variant="glass" className="p-12 text-center">
                    <Gavel className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">Brak aukcji</h3>
                    <p className="text-white/70 mb-6">
                      Nie znaleziono aukcji spełniających kryteria wyszukiwania.
                    </p>
                    <UnifiedButton
                      variant="secondary"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                      }}
                    >
                      Wyczyść filtry
                    </UnifiedButton>
                  </UnifiedCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Auction Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-7xl h-[95vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-full overflow-auto">
                <CreateAuctionForm
                  onSuccess={() => setShowCreateForm(false)}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <FullscreenImageModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        images={fullscreenImages}
        currentIndex={fullscreenIndex}
        title={fullscreenTitle}
      />
    </>
  );
}
