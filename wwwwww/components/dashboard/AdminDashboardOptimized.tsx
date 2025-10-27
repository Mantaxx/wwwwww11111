'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart3, Camera, DollarSign, Gavel, LogOut, Settings, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AdminAuctions from './admin/AdminAuctions';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';

// Rozszerz Firebase User o właściwość role
declare module 'firebase/auth' {
  interface User {
    role?: string;
  }
}

interface StatsResponse {
  totalUsers: number;
  totalAuctions: number;
  totalTransactions: number;
  disputes: number;
}

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [usersRole, setUsersRole] = useState<string>('');
  const [usersStatus, setUsersStatus] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  }>({
    firstName: '',
    lastName: '',
    role: 'USER',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auctions state
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [auctionsTotal, setAuctionsTotal] = useState(0);
  const [auctionsPage, setAuctionsPage] = useState(1);
  const [auctionsPageSize, setAuctionsPageSize] = useState(10);
  const [approving, setApproving] = useState<string | null>(null);
  const [auctionTab, setAuctionTab] = useState<'pending' | 'active'>('pending');
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [activeAuctionsTotal, setActiveAuctionsTotal] = useState(0);
  const [activeAuctionsPage, setActiveAuctionsPage] = useState(1);
  const [activeAuctionsPageSize, setActiveAuctionsPageSize] = useState(10);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [auctionBidders, setAuctionBidders] = useState<Bidder[]>([]);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [editingAuctionData, setEditingAuctionData] = useState<Partial<Auction>>({});

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: BarChart3 },
    { id: 'users', label: 'Użytkownicy', icon: Users },
    { id: 'auctions', label: 'Aukcje', icon: Gavel },
    { id: 'references', label: 'Referencje', icon: Star },
    { id: 'meetings', label: 'Spotkania', icon: Camera },
    { id: 'transactions', label: 'Transakcje', icon: DollarSign },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania statystyk:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        pageSize: usersPageSize.toString(),
        ...(usersRole && { role: usersRole }),
        ...(usersStatus && { status: usersStatus }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items);
        setUsersTotal(data.total);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania użytkowników:', error);
    }
  }, [usersPage, usersPageSize, usersRole, usersStatus]);

  // Load auctions
  const loadAuctions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: auctionsPage.toString(),
        pageSize: auctionsPageSize.toString(),
        status: 'PENDING',
      });

      const response = await fetch(`/api/admin/auctions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAuctions(data.items);
        setAuctionsTotal(data.total);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania aukcji:', error);
    }
  }, [auctionsPage, auctionsPageSize]);

  // Load active auctions
  const loadActiveAuctions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: activeAuctionsPage.toString(),
        pageSize: activeAuctionsPageSize.toString(),
        status: 'ACTIVE',
      });

      const response = await fetch(`/api/admin/auctions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActiveAuctions(data.items);
        setActiveAuctionsTotal(data.total);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania aktywnych aukcji:', error);
    }
  }, [activeAuctionsPage, activeAuctionsPageSize]);

  // User handlers
  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive,
    });
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania użytkownika:', error);
    } finally {
      setSaving(false);
    }
  }, [editingUser, editForm, loadUsers]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      setDeleting(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadUsers();
        }
      } catch (error) {
        console.error('Błąd podczas usuwania użytkownika:', error);
      } finally {
        setDeleting(false);
      }
    },
    [loadUsers]
  );

  // Auction handlers
  const handleApproveAuction = useCallback(
    async (auctionId: string) => {
      setApproving(auctionId);
      try {
        const response = await fetch(`/api/admin/auctions/${auctionId}/approve`, {
          method: 'POST',
        });

        if (response.ok) {
          await loadAuctions();
          await loadActiveAuctions();
        }
      } catch (error) {
        console.error('Błąd podczas zatwierdzania aukcji:', error);
      } finally {
        setApproving(null);
      }
    },
    [loadAuctions, loadActiveAuctions]
  );

  const handleRejectAuction = useCallback(
    async (auctionId: string) => {
      try {
        const response = await fetch(`/api/admin/auctions/${auctionId}/reject`, {
          method: 'POST',
        });

        if (response.ok) {
          await loadAuctions();
        }
      } catch (error) {
        console.error('Błąd podczas odrzucania aukcji:', error);
      }
    },
    [loadAuctions]
  );

  const handleEditAuction = useCallback((auction: Auction) => {
    setEditingAuction(auction);
    setEditingAuctionData({
      title: auction.title,
      description: auction.description,
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      buyNowPrice: auction.buyNowPrice,
      reservePrice: auction.reservePrice,
    });
  }, []);

  const handleSaveAuction = useCallback(async () => {
    if (!editingAuction) return;

    try {
      const response = await fetch(`/api/admin/auctions/${editingAuction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAuctionData),
      });

      if (response.ok) {
        await loadAuctions();
        await loadActiveAuctions();
        setEditingAuction(null);
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania aukcji:', error);
    }
  }, [editingAuction, editingAuctionData, loadAuctions, loadActiveAuctions]);

  const handleSelectAuction = useCallback(async (auction: Auction | null) => {
    setSelectedAuction(auction);
    if (auction) {
      try {
        const response = await fetch(`/api/admin/auctions/${auction.id}/bids`);
        if (response.ok) {
          const data = await response.json();
          setAuctionBidders(data);
        }
      } catch (error) {
        console.error('Błąd podczas ładowania licytacji:', error);
      }
    }
  }, []);

  // Effects
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === 'auctions') {
      loadAuctions();
      loadActiveAuctions();
    }
  }, [activeTab, loadAuctions, loadActiveAuctions]);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-white">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Panel Administratora</h1>
              <p className="text-white/70 mt-2">
                Zarządzaj platformą, użytkownikami i transakcjami
              </p>
            </div>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg backdrop-blur-sm transition-all duration-200 border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card hover-3d-lift">
              {/* Admin Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {user.displayName || 'Administrator'}
                </h2>
                <p className="text-white/70 text-sm">{user.email}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm">Administrator</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-white/70 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <AdminOverview stats={stats} isLoading={isLoading} />}

              {activeTab === 'users' && (
                <AdminUsers
                  users={users}
                  usersTotal={usersTotal}
                  usersPage={usersPage}
                  usersPageSize={usersPageSize}
                  usersRole={usersRole}
                  usersStatus={usersStatus}
                  editingUser={editingUser}
                  editForm={editForm}
                  saving={saving}
                  deleting={deleting}
                  onPageChange={setUsersPage}
                  onPageSizeChange={setUsersPageSize}
                  onRoleFilter={setUsersRole}
                  onStatusFilter={setUsersStatus}
                  onEditUser={handleEditUser}
                  onSaveUser={handleSaveUser}
                  onDeleteUser={handleDeleteUser}
                  onCancelEdit={() => setEditingUser(null)}
                  onFormChange={(field, value) =>
                    setEditForm(prev => ({ ...prev, [field]: value }))
                  }
                />
              )}

              {activeTab === 'auctions' && (
                <AdminAuctions
                  auctions={auctions}
                  auctionsTotal={auctionsTotal}
                  auctionsPage={auctionsPage}
                  auctionsPageSize={auctionsPageSize}
                  auctionTab={auctionTab}
                  activeAuctions={activeAuctions}
                  activeAuctionsTotal={activeAuctionsTotal}
                  activeAuctionsPage={activeAuctionsPage}
                  activeAuctionsPageSize={activeAuctionsPageSize}
                  selectedAuction={selectedAuction}
                  auctionBidders={auctionBidders}
                  editingAuction={editingAuction}
                  editingAuctionData={editingAuctionData}
                  approving={approving}
                  onPageChange={setAuctionsPage}
                  onPageSizeChange={setAuctionsPageSize}
                  onTabChange={setAuctionTab}
                  onActivePageChange={setActiveAuctionsPage}
                  onActivePageSizeChange={setActiveAuctionsPageSize}
                  onSelectAuction={handleSelectAuction}
                  onApproveAuction={handleApproveAuction}
                  onRejectAuction={handleRejectAuction}
                  onEditAuction={handleEditAuction}
                  onSaveAuction={handleSaveAuction}
                  onCancelEdit={() => setEditingAuction(null)}
                  onAuctionDataChange={(field, value) =>
                    setEditingAuctionData((prev: Partial<Auction>) => ({ ...prev, [field]: value }))
                  }
                />
              )}

              {activeTab === 'references' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-4">Referencje</h3>
                  <p className="text-white/70">Funkcjonalność w trakcie rozwoju...</p>
                </div>
              )}

              {activeTab === 'meetings' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-4">Spotkania</h3>
                  <p className="text-white/70">Funkcjonalność w trakcie rozwoju...</p>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-4">Transakcje</h3>
                  <p className="text-white/70">Funkcjonalność w trakcie rozwoju...</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="card">
                  <h3 className="text-xl font-semibold text-white mb-4">Ustawienia</h3>
                  <p className="text-white/70">Funkcjonalność w trakcie rozwoju...</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
