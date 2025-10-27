'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Gavel,
  Package,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  reservePrice: number | null;
  startTime: string;
  endTime: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Bidder {
  id: string;
  amount: number;
  bidder: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  createdAt: string;
}

interface AdminAuctionsProps {
  auctions: Auction[];
  auctionsTotal: number;
  auctionsPage: number;
  auctionsPageSize: number;
  auctionTab: 'pending' | 'active';
  activeAuctions: Auction[];
  activeAuctionsTotal: number;
  activeAuctionsPage: number;
  activeAuctionsPageSize: number;
  selectedAuction: Auction | null;
  auctionBidders: Bidder[];
  editingAuction: Auction | null;
  editingAuctionData: Partial<Auction>;
  approving: string | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onTabChange: (tab: 'pending' | 'active') => void;
  onActivePageChange: (page: number) => void;
  onActivePageSizeChange: (size: number) => void;
  onSelectAuction: (auction: Auction | null) => void;
  onApproveAuction: (auctionId: string) => void;
  onRejectAuction: (auctionId: string) => void;
  onEditAuction: (auction: Auction) => void;
  onSaveAuction: () => void;
  onCancelEdit: () => void;
  onAuctionDataChange: (field: string, value: string | number | null) => void;
}

const AdminAuctions = memo(function AdminAuctions({
  auctions,
  auctionsTotal,
  auctionsPage,
  auctionsPageSize,
  auctionTab,
  activeAuctions,
  activeAuctionsTotal,
  activeAuctionsPage,
  activeAuctionsPageSize,
  selectedAuction,
  auctionBidders,
  editingAuction,
  editingAuctionData,
  approving,
  onPageChange,
  onPageSizeChange,
  onTabChange,
  onActivePageChange,
  onActivePageSizeChange,
  onSelectAuction,
  onApproveAuction,
  onRejectAuction,
  onEditAuction,
  onSaveAuction,
  onCancelEdit,
  onAuctionDataChange,
}: AdminAuctionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = useCallback((auctionId: string) => {
    setShowDeleteConfirm(auctionId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (showDeleteConfirm) {
      // Implement delete logic here
      setShowDeleteConfirm(null);
    }
  }, [showDeleteConfirm]);

  const totalPages = Math.ceil(auctionsTotal / auctionsPageSize);
  const activeTotalPages = Math.ceil(activeAuctionsTotal / activeAuctionsPageSize);

  const currentAuctions = auctionTab === 'pending' ? auctions : activeAuctions;
  const currentTotal = auctionTab === 'pending' ? auctionsTotal : activeAuctionsTotal;
  const currentPage = auctionTab === 'pending' ? auctionsPage : activeAuctionsPage;
  const currentPageSize = auctionTab === 'pending' ? auctionsPageSize : activeAuctionsPageSize;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onTabChange('pending')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              auctionTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white/70 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Oczekujące ({auctionsTotal})
          </button>
          <button
            onClick={() => onTabChange('active')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              auctionTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white/70 hover:text-white'
            }`}
          >
            <Gavel className="w-4 h-4 inline mr-2" />
            Aktywne ({activeAuctionsTotal})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-white mb-2">Na stronę</label>
            <select
              value={currentPageSize}
              onChange={e => {
                if (auctionTab === 'pending') {
                  onPageSizeChange(Number(e.target.value));
                } else {
                  onActivePageSizeChange(Number(e.target.value));
                }
              }}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
              aria-label="Liczba aukcji na stronę"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Auctions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            {auctionTab === 'pending' ? 'Aukcje oczekujące' : 'Aukcje aktywne'} ({currentTotal})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 text-white font-medium">Aukcja</th>
                <th className="text-left py-3 px-4 text-white font-medium">Sprzedawca</th>
                <th className="text-left py-3 px-4 text-white font-medium">Kategoria</th>
                <th className="text-left py-3 px-4 text-white font-medium">Cena</th>
                <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                <th className="text-left py-3 px-4 text-white font-medium">Data</th>
                <th className="text-left py-3 px-4 text-white font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {currentAuctions.map(auction => (
                <tr key={auction.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{auction.title}</p>
                        <p className="text-white/60 text-sm truncate max-w-xs">
                          {auction.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/80">
                    {auction.seller.firstName && auction.seller.lastName
                      ? `${auction.seller.firstName} ${auction.seller.lastName}`
                      : 'Brak danych'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium">
                      {auction.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">
                      <p className="font-medium">{auction.currentPrice.toFixed(2)} zł</p>
                      {auction.buyNowPrice && (
                        <p className="text-white/60 text-sm">
                          Kup teraz: {auction.buyNowPrice.toFixed(2)} zł
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {auction.isApproved ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className={auction.isApproved ? 'text-green-400' : 'text-yellow-400'}>
                        {auction.isApproved ? 'Zatwierdzona' : 'Oczekuje'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/80">
                    {new Date(auction.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {auctionTab === 'pending' && !auction.isApproved && (
                        <>
                          <button
                            onClick={() => onApproveAuction(auction.id)}
                            disabled={approving === auction.id}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Zatwierdź aukcję"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectAuction(auction.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                            title="Odrzuć aukcję"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onEditAuction(auction)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                        title="Edytuj aukcję"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectAuction(auction)}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-200"
                        title="Zobacz szczegóły"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(auction.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                        title="Usuń aukcję"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-white/70 text-sm">
            Strona {currentPage} z {auctionTab === 'pending' ? totalPages : activeTotalPages} (
            {currentTotal} aukcji)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (auctionTab === 'pending') {
                  onPageChange(currentPage - 1);
                } else {
                  onActivePageChange(currentPage - 1);
                }
              }}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all duration-200"
            >
              Poprzednia
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
            <button
              onClick={() => {
                if (auctionTab === 'pending') {
                  onPageChange(currentPage + 1);
                } else {
                  onActivePageChange(currentPage + 1);
                }
              }}
              disabled={currentPage >= (auctionTab === 'pending' ? totalPages : activeTotalPages)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all duration-200"
            >
              Następna
            </button>
          </div>
        </div>
      </motion.div>

      {/* Auction Details Modal */}
      {selectedAuction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Szczegóły aukcji</h3>
              <button
                onClick={() => onSelectAuction(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200"
                aria-label="Zamknij modal szczegółów aukcji"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Informacje o aukcji</h4>
                <div className="space-y-2 text-white/80">
                  <p>
                    <span className="font-medium">Tytuł:</span> {selectedAuction.title}
                  </p>
                  <p>
                    <span className="font-medium">Opis:</span> {selectedAuction.description}
                  </p>
                  <p>
                    <span className="font-medium">Kategoria:</span> {selectedAuction.category}
                  </p>
                  <p>
                    <span className="font-medium">Cena startowa:</span>{' '}
                    {selectedAuction.startingPrice.toFixed(2)} zł
                  </p>
                  <p>
                    <span className="font-medium">Aktualna cena:</span>{' '}
                    {selectedAuction.currentPrice.toFixed(2)} zł
                  </p>
                  {selectedAuction.buyNowPrice && (
                    <p>
                      <span className="font-medium">Kup teraz:</span>{' '}
                      {selectedAuction.buyNowPrice.toFixed(2)} zł
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-3">Licytacje</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auctionBidders.map(bid => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-2 bg-gray-700 rounded"
                    >
                      <div>
                        <p className="text-white font-medium">{bid.amount.toFixed(2)} zł</p>
                        <p className="text-white/60 text-sm">
                          {bid.bidder.firstName && bid.bidder.lastName
                            ? `${bid.bidder.firstName} ${bid.bidder.lastName}`
                            : bid.bidder.email}
                        </p>
                      </div>
                      <span className="text-white/60 text-sm">
                        {new Date(bid.createdAt).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {editingAuction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Edytuj aukcję</h3>
              <button
                onClick={onCancelEdit}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200"
                aria-label="Zamknij modal edycji aukcji"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tytuł</label>
                <input
                  type="text"
                  value={editingAuctionData.title}
                  onChange={e => onAuctionDataChange('title', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                  aria-label="Tytuł aukcji"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Opis</label>
                <textarea
                  value={editingAuctionData.description}
                  onChange={e => onAuctionDataChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                  aria-label="Opis aukcji"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Cena startowa</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAuctionData.startingPrice}
                    onChange={e => onAuctionDataChange('startingPrice', parseFloat(e.target.value))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                    aria-label="Cena startowa aukcji"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Aktualna cena</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAuctionData.currentPrice}
                    onChange={e => onAuctionDataChange('currentPrice', parseFloat(e.target.value))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                    aria-label="Aktualna cena aukcji"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onSaveAuction}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Zapisz
              </button>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
              >
                Anuluj
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Usuń aukcję</h3>
              <p className="text-white/70 mb-6">
                Czy na pewno chcesz usunąć tę aukcję? Ta akcja nie może zostać cofnięta.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Usuń
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
});

export default AdminAuctions;
