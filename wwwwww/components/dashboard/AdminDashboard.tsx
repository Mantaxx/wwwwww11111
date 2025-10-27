'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Ban,
  BarChart3,
  Camera,
  CheckCircle,
  DollarSign,
  Edit,
  Gavel,
  LogOut,
  Package,
  Save,
  Settings,
  Star,
  StopCircle,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
interface StatsResponse {
  totalUsers: number;
  totalAuctions: number;
  totalTransactions: number;
  disputes: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'disputed';
  createdAt: string;
  auction: { title: string };
  buyer: { firstName: string; lastName: string; email: string };
  seller: { firstName: string; lastName: string; email: string };
}

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  isApproved: boolean;
  createdAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assets?: Array<{
    id: string;
    type: string;
    url: string;
  }>;
  bids?: Array<{
    id: string;
    amount: number;
    createdAt: string;
    bidder: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

interface Bidder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  createdAt: string;
  memberSince: string;
  totalBids: number;
  rating?: number;
}

interface EditingBid {
  id: string;
  amount: number;
  originalAmount: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<StatsResponse | null>(null);
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
  }>({ firstName: '', lastName: '', role: 'USER', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [txsTotal, setTxsTotal] = useState(0);
  const [txsPage, setTxsPage] = useState(1);
  const [txsPageSize, setTxsPageSize] = useState(10);
  const [txsStatus, setTxsStatus] = useState<string>('');
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
  const [loadingBidders, setLoadingBidders] = useState(false);
  const [editingBid, setEditingBid] = useState<EditingBid | null>(null);
  const [savingBid, setSavingBid] = useState(false);
  const [editingAuctionData, setEditingAuctionData] = useState<{
    id: string;
    title: string;
    currentPrice: string;
    endTime: string;
    status: string;
  } | null>(null);
  const [savingAuction, setSavingAuction] = useState(false);

  // Stany dla referencji
  const [references, setReferences] = useState<
    Array<{
      id: string;
      breederName: string;
      dogName: string;
      status: string;
      location: string;
      experience: string;
      rating: number;
      testimonial: string;
      createdAt: string;
      achievements?: Array<{
        pigeon: string;
        ringNumber: string;
        results?: Array<{
          place: string;
          competition: string;
          date: string;
        }>;
      }>;
      [key: string]: unknown;
    }>
  >([]);
  const [referencesTotal, setReferencesTotal] = useState(0);
  // const [referencesPage, setReferencesPage] = useState(1) // unused
  // const [referencesPageSize, setReferencesPageSize] = useState(10) // unused
  const [referencesStatus, setReferencesStatus] = useState<'pending' | 'approved' | 'all'>(
    'pending'
  );

  // Stany dla spotkań z hodowcami
  const [meetings, setMeetings] = useState<
    Array<{
      id: string;
      breederName: string;
      date: string;
      status: string;
      title: string;
      location: string;
      isApproved: boolean;
      user: {
        firstName?: string;
        lastName?: string;
      };
      createdAt: string;
      notes?: string;
      description?: string;
      images?: string[];
      [key: string]: unknown;
    }>
  >([]);
  const [meetingsTotal, setMeetingsTotal] = useState(0);
  // const [meetingsPage, setMeetingsPage] = useState(1) // unused
  // const [meetingsPageSize, setMeetingsPageSize] = useState(10) // unused
  const [meetingsStatus, setMeetingsStatus] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [s, u, t, a, aa, r, m] = await Promise.all([
          fetch('/api/admin/stats', { headers }).then(r => (r.ok ? r.json() : null)),
          fetch(
            `/api/admin/users?page=${usersPage}&pageSize=${usersPageSize}${usersRole ? `&role=${usersRole}` : ''}${usersStatus ? `&status=${usersStatus}` : ''}`,
            { headers }
          ).then(r => (r.ok ? r.json() : null)),
          fetch(
            `/api/admin/transactions?page=${txsPage}&pageSize=${txsPageSize}${txsStatus ? `&status=${txsStatus}` : ''}`,
            { headers }
          ).then(r => (r.ok ? r.json() : null)),
          fetch(`/api/admin/auctions/pending?page=${auctionsPage}&limit=${auctionsPageSize}`, {
            headers,
          }).then(r => (r.ok ? r.json() : null)),
          fetch(
            `/api/admin/auctions/active?page=${activeAuctionsPage}&limit=${activeAuctionsPageSize}`,
            { headers }
          ).then(r => (r.ok ? r.json() : null)),
          fetch(`/api/admin/references?page=1&limit=10&status=${referencesStatus}`, {
            headers,
          }).then(r => (r.ok ? r.json() : null)),
          fetch(`/api/admin/breeder-meetings?page=1&limit=10&status=${meetingsStatus}`, {
            headers,
          }).then(r => (r.ok ? r.json() : null)),
        ]);
        if (s) setStats(s);
        if (u) {
          setUsers(u.items);
          setUsersTotal(u.total);
        }
        if (t) {
          setTxs(t.items);
          setTxsTotal(t.total);
        }
        if (a) {
          setAuctions(a.auctions);
          setAuctionsTotal(a.total);
        }
        if (aa) {
          setActiveAuctions(aa.auctions);
          setActiveAuctionsTotal(aa.total);
        }
        if (r) {
          setReferences(r.references);
          setReferencesTotal(r.pagination?.total || 0);
        }
        if (m) {
          setMeetings(m.meetings);
          setMeetingsTotal(m.pagination?.total || 0);
        }
      } catch {}
    };
    fetchAll();
  }, [
    user,
    usersPage,
    usersPageSize,
    usersRole,
    usersStatus,
    txsPage,
    txsPageSize,
    txsStatus,
    auctionsPage,
    auctionsPageSize,
    activeAuctionsPage,
    activeAuctionsPageSize,
    referencesStatus,
    meetingsStatus,
  ]);

  // Automatyczne odświeżanie list aukcji
  const refreshAuctionLists = useCallback(
    async (silent = true) => {
      try {
        // Odśwież oczekujące aukcje
        const refreshedPending = await fetch(
          `/api/admin/auctions/pending?page=${auctionsPage}&limit=${auctionsPageSize}`
        ).then(r => r.json());
        setAuctions(refreshedPending.auctions);
        setAuctionsTotal(refreshedPending.total);

        // Odśwież aktywne aukcje
        const refreshedActive = await fetch(
          `/api/admin/auctions/active?page=${activeAuctionsPage}&limit=${activeAuctionsPageSize}`
        ).then(r => r.json());
        setActiveAuctions(refreshedActive.auctions);
        setActiveAuctionsTotal(refreshedActive.total);

        if (!silent) {
          console.log('✅ Listy aukcji zostały odświeżone');
        }
      } catch (error) {
        console.error('Błąd podczas odświeżania list aukcji:', error);
      }
    },
    [auctionsPage, auctionsPageSize, activeAuctionsPage, activeAuctionsPageSize]
  );

  // Automatyczne odświeżanie co 30 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAuctionLists(true); // Silent refresh
    }, 30000); // 30 sekund

    return () => clearInterval(interval);
  }, [
    auctionsPage,
    auctionsPageSize,
    activeAuctionsPage,
    activeAuctionsPageSize,
    refreshAuctionLists,
  ]);

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role || 'USER',
      isActive: Boolean(u.isActive),
    });
  };

  const saveEdit = async () => {
    if (!editingUser?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        // refresh list
        const u = await fetch(
          `/api/admin/users?page=${usersPage}&pageSize=${usersPageSize}${usersRole ? `&role=${usersRole}` : ''}${usersStatus ? `&status=${usersStatus}` : ''}`
        ).then(r => r.json());
        setUsers(u.items);
        setUsersTotal(u.total);
        setEditingUser(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: User) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    const refreshed = await fetch(
      `/api/admin/users?page=${usersPage}&pageSize=${usersPageSize}${usersRole ? `&role=${usersRole}` : ''}${usersStatus ? `&status=${usersStatus}` : ''}`
    ).then(r => r.json());
    setUsers(refreshed.items);
    setUsersTotal(refreshed.total);
  };

  const deleteUser = async (u: User) => {
    if (!confirm('Na pewno usunąć użytkownika?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      const refreshed = await fetch(
        `/api/admin/users?page=${usersPage}&pageSize=${usersPageSize}${usersRole ? `&role=${usersRole}` : ''}${usersStatus ? `&status=${usersStatus}` : ''}`
      ).then(r => r.json());
      setUsers(refreshed.items);
      setUsersTotal(refreshed.total);
    } finally {
      setDeleting(false);
    }
  };

  const approveAuction = async (auctionId: string) => {
    setApproving(auctionId);
    try {
      const response = await fetch('/api/auctions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auctionId }),
      });

      if (response.ok) {
        // Automatyczne odświeżanie obu list
        await refreshAuctionLists(false);
        alert('Aukcja została zatwierdzona i przeniesiona do aktywnych!');
      } else {
        alert('Błąd podczas zatwierdzania aukcji');
      }
    } catch (error) {
      alert('Błąd podczas zatwierdzania aukcji');
    } finally {
      setApproving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktywny';
      case 'pending':
        return 'Oczekuje';
      case 'blocked':
        return 'Zablokowany';
      case 'completed':
        return 'Zakończona';
      case 'disputed':
        return 'Spór';
      default:
        return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'USER':
        return 'Użytkownik';
      case 'ADMIN':
        return 'Administrator';
      default:
        return role;
    }
  };

  const viewAuctionBidders = async (auction: Auction) => {
    setSelectedAuction(auction);
    setLoadingBidders(true);
    try {
      const response = await fetch(`/api/admin/auctions/${auction.id}/bidders`);
      if (response.ok) {
        const data = await response.json();
        setAuctionBidders(data.bidders || []);
      } else {
        setAuctionBidders([]);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania licytujących:', error);
      setAuctionBidders([]);
    } finally {
      setLoadingBidders(false);
    }
  };

  const editBid = (bidder: Bidder) => {
    setEditingBid({
      id: bidder.id,
      amount: bidder.amount,
      originalAmount: bidder.amount,
    });
  };

  const saveBidEdit = async () => {
    if (!editingBid || !selectedAuction) return;

    setSavingBid(true);
    try {
      const response = await fetch(
        `/api/admin/auctions/${selectedAuction.id}/bids/${editingBid.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: editingBid.amount }),
        }
      );

      if (response.ok) {
        // Odśwież listę licytujących i aukcji
        await viewAuctionBidders(selectedAuction);
        await refreshAuctionLists(true); // Silent refresh
        setEditingBid(null);
        alert('Licytacja została zaktualizowana');
      } else {
        alert('Błąd podczas aktualizacji licytacji');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji licytacji:', error);
      alert('Błąd podczas aktualizacji licytacji');
    } finally {
      setSavingBid(false);
    }
  };

  const deleteBid = async (bidderId: string) => {
    if (!selectedAuction || !confirm('Czy na pewno chcesz usunąć tę licytację?')) return;

    try {
      const response = await fetch(`/api/admin/auctions/${selectedAuction.id}/bids/${bidderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Odśwież listę licytujących i aukcji
        await viewAuctionBidders(selectedAuction);
        await refreshAuctionLists(true); // Silent refresh
        alert('Licytacja została usunięta');
      } else {
        alert('Błąd podczas usuwania licytacji');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania licytacji:', error);
      alert('Błąd podczas usuwania licytacji');
    }
  };

  const editAuction = (auction: Auction) => {
    setEditingAuctionData({
      id: auction.id,
      title: auction.title,
      currentPrice: auction.currentPrice.toString(),
      endTime: new Date(auction.endTime).toISOString().slice(0, 16), // Format dla datetime-local
      status: auction.status,
    });
  };

  const saveAuctionEdit = async () => {
    if (!editingAuctionData) return;

    setSavingAuction(true);
    try {
      const response = await fetch(`/api/admin/auctions/${editingAuctionData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingAuctionData.title,
          currentPrice: parseFloat(editingAuctionData.currentPrice),
          endTime: new Date(editingAuctionData.endTime).toISOString(),
          status: editingAuctionData.status,
        }),
      });

      if (response.ok) {
        // Automatyczne odświeżanie list
        await refreshAuctionLists(false);
        setEditingAuctionData(null);
        alert('Aukcja została zaktualizowana');
      } else {
        alert('Błąd podczas aktualizacji aukcji');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji aukcji:', error);
      alert('Błąd podczas aktualizacji aukcji');
    } finally {
      setSavingAuction(false);
    }
  };

  const blockUser = async (userId: string, userName: string) => {
    if (!confirm(`Czy na pewno chcesz zablokować użytkownika ${userName}?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        alert(`Użytkownik ${userName} został zablokowany`);
        // Odśwież listę użytkowników jeśli jesteśmy na tej zakładce
        if (activeTab === 'users') {
          const refreshed = await fetch(
            `/api/admin/users?page=${usersPage}&pageSize=${usersPageSize}${usersRole ? `&role=${usersRole}` : ''}${usersStatus ? `&status=${usersStatus}` : ''}`
          ).then(r => r.json());
          setUsers(refreshed.items);
          setUsersTotal(refreshed.total);
        }
      } else {
        alert('Błąd podczas blokowania użytkownika');
      }
    } catch (error) {
      console.error('Błąd podczas blokowania użytkownika:', error);
      alert('Błąd podczas blokowania użytkownika');
    }
  };

  const endAuction = async (auctionId: string, auctionTitle: string) => {
    if (!confirm(`Czy na pewno chcesz zakończyć aukcję "${auctionTitle}"?`)) return;

    try {
      const response = await fetch(`/api/admin/auctions/${auctionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ENDED' }),
      });

      if (response.ok) {
        // Automatyczne odświeżanie list
        await refreshAuctionLists(false);
        alert('Aukcja została zakończona');
      } else {
        alert('Błąd podczas kończenia aukcji');
      }
    } catch (error) {
      console.error('Błąd podczas kończenia aukcji:', error);
      alert('Błąd podczas kończenia aukcji');
    }
  };

  // Funkcje dla referencji
  const approveReference = async (referenceId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/references/${referenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });

      if (response.ok) {
        // Odśwież listę referencji
        const updatedReferences = references
          .map(ref => (ref.id === referenceId ? { ...ref, isApproved } : ref))
          .filter(ref => {
            if (referencesStatus === 'pending') return !ref.isApproved;
            if (referencesStatus === 'approved') return ref.isApproved;
            return true;
          });
        setReferences(updatedReferences);
        alert(`Referencja została ${isApproved ? 'zatwierdzona' : 'odrzucona'}`);
      } else {
        alert('Błąd podczas aktualizacji referencji');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji referencji:', error);
      alert('Błąd podczas aktualizacji referencji');
    }
  };

  const deleteReference = async (referenceId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę referencję?')) return;

    try {
      const response = await fetch(`/api/admin/references/${referenceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReferences(references.filter(ref => ref.id !== referenceId));
        setReferencesTotal(referencesTotal - 1);
        alert('Referencja została usunięta');
      } else {
        alert('Błąd podczas usuwania referencji');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania referencji:', error);
      alert('Błąd podczas usuwania referencji');
    }
  };

  // Funkcje dla spotkań z hodowcami
  const approveMeeting = async (meetingId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/breeder-meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });

      if (response.ok) {
        // Odśwież listę spotkań
        const updatedMeetings = meetings
          .map(meeting => (meeting.id === meetingId ? { ...meeting, isApproved } : meeting))
          .filter(meeting => {
            if (meetingsStatus === 'pending') return !meeting.isApproved;
            if (meetingsStatus === 'approved') return meeting.isApproved;
            return true;
          });
        setMeetings(updatedMeetings);
        alert(`Spotkanie zostało ${isApproved ? 'zatwierdzone' : 'odrzucone'}`);
      } else {
        alert('Błąd podczas aktualizacji spotkania');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji spotkania:', error);
      alert('Błąd podczas aktualizacji spotkania');
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to spotkanie?')) return;

    try {
      const response = await fetch(`/api/admin/breeder-meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
        setMeetingsTotal(meetingsTotal - 1);
        alert('Spotkanie zostało usunięte');
      } else {
        alert('Błąd podczas usuwania spotkania');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania spotkania:', error);
      alert('Błąd podczas usuwania spotkania');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: BarChart3 },
    { id: 'users', label: 'Użytkownicy', icon: Users },
    { id: 'auctions', label: 'Aukcje', icon: Gavel },
    { id: 'references', label: 'Referencje', icon: Star },
    { id: 'meetings', label: 'Spotkania', icon: Camera },
    { id: 'transactions', label: 'Transakcje', icon: DollarSign },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

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
              Wyloguj się
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-white text-white'
                        : 'border-transparent text-white/60 hover:text-white hover:border-white/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Użytkownicy</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalUsers ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Przychód platformy</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.totalTransactions
                        ? stats.totalTransactions.toLocaleString() + ' trans.'
                        : '0 trans.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Package className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Aktywne aukcje</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalAuctions ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Spory</p>
                    <p className="text-2xl font-bold text-white">{stats?.disputes ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Ostatnie transakcje</h2>
                <div className="space-y-4">
                  {txs.length === 0 ? (
                    <div className="text-sm text-white/70">Brak danych</div>
                  ) : (
                    txs.slice(0, 3).map(tx => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">{tx.auction?.title || 'Aukcja'}</p>
                          <p className="text-sm text-white/70">
                            {(tx.buyer?.firstName || '') + ' ' + (tx.buyer?.lastName || '')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {Number(tx.amount || 0).toLocaleString()} zł
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(String(tx.status || 'pending'))}`}
                          >
                            {getStatusText(String(tx.status || 'pending'))}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Oczekujące akcje</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="font-medium text-white">Zatwierdzenie sprzedawców</p>
                        <p className="text-sm text-white/70">0 oczekuje</p>
                      </div>
                    </div>
                    <button className="text-white/80 hover:text-white font-medium">Sprawdź</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <div>
                        <p className="font-medium text-white">Spory do rozstrzygnięcia</p>
                        <p className="text-sm text-white/70">0 spraw</p>
                      </div>
                    </div>
                    <button className="text-white/80 hover:text-white font-medium">Sprawdź</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Zarządzanie użytkownikami</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Użytkownik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rola
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data dołączenia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-600">
                          Brak danych użytkowników
                        </td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                              </div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{getRoleText(u.role)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(u.isActive ? 'active' : 'blocked')}`}
                            >
                              {getStatusText(u.isActive ? 'active' : 'blocked')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                              <button
                                aria-label="Edytuj"
                                title="Edytuj"
                                onClick={() => openEdit(u)}
                                className="px-3 py-1 border rounded hover:bg-gray-50 text-gray-700"
                              >
                                Edytuj
                              </button>
                              <button
                                aria-label={u.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                                title={u.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                                onClick={() => toggleActive(u)}
                                className="px-3 py-1 border rounded hover:bg-gray-50 text-gray-700"
                              >
                                {u.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                              </button>
                              <button
                                aria-label="Usuń"
                                title="Usuń"
                                onClick={() => deleteUser(u)}
                                disabled={deleting}
                                className="px-3 py-1 border rounded hover:bg-red-50 disabled:opacity-50 text-gray-700"
                              >
                                Usuń
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {editingUser && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edytuj użytkownika"
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                  >
                    <div className="bg-white border-2 border-white rounded-lg shadow-lg w-full max-w-md p-6">
                      <h3 className="text-lg font-semibold mb-4">Edytuj użytkownika</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Email</label>
                          <input
                            aria-label="Email"
                            value={editingUser?.email || ''}
                            readOnly
                            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Imię</label>
                          <input
                            aria-label="Imię"
                            value={editForm.firstName}
                            onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Nazwisko</label>
                          <input
                            aria-label="Nazwisko"
                            value={editForm.lastName}
                            onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Rola</label>
                          <select
                            aria-label="Rola"
                            value={editForm.role}
                            onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="USER">Użytkownik</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="isActive"
                            aria-label="Aktywne konto"
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                          />
                          <label htmlFor="isActive" className="text-sm text-gray-700">
                            Aktywne konto
                          </label>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 border rounded"
                        >
                          Anuluj
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-50"
                        >
                          Zapisz
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Rola</label>
                    <select
                      aria-label="Filtr roli użytkownika"
                      title="Filtr roli użytkownika"
                      value={usersRole}
                      onChange={e => {
                        setUsersPage(1);
                        setUsersRole(e.target.value);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Wszystkie</option>
                      <option value="USER">Użytkownik</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                    <label className="text-sm text-gray-600 ml-4">Status</label>
                    <select
                      aria-label="Filtr statusu użytkownika"
                      title="Filtr statusu użytkownika"
                      value={usersStatus}
                      onChange={e => {
                        setUsersPage(1);
                        setUsersStatus(e.target.value);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Wszystkie</option>
                      <option value="active">Aktywny</option>
                      <option value="blocked">Zablokowany</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      disabled={usersPage <= 1}
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Poprzednia
                    </button>
                    <span>
                      Strona {usersPage} z {Math.max(1, Math.ceil(usersTotal / usersPageSize))}
                    </span>
                    <button
                      disabled={usersPage >= Math.ceil(usersTotal / usersPageSize)}
                      onClick={() => setUsersPage(p => p + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Następna
                    </button>
                    <select
                      aria-label="Rozmiar strony użytkowników"
                      title="Rozmiar strony użytkowników"
                      value={usersPageSize}
                      onChange={e => {
                        setUsersPage(1);
                        setUsersPageSize(parseInt(e.target.value, 10));
                      }}
                      className="ml-2 border rounded px-2 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'auctions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 border-2 border-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Zarządzanie aukcjami</h2>
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setAuctionTab('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      auctionTab === 'pending'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    Oczekujące ({auctionsTotal})
                  </button>
                  <button
                    onClick={() => setAuctionTab('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      auctionTab === 'active'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    Aktywne ({activeAuctionsTotal})
                  </button>
                </div>
              </div>

              {auctionTab === 'pending' && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Oczekujące aukcje do zatwierdzenia
                  </h3>

                  <div className="space-y-4">
                    {auctions.length === 0 ? (
                      <div className="text-center py-8 text-white/70">
                        <Gavel className="w-12 h-12 mx-auto mb-4 text-white/40" />
                        <p>Brak oczekujących aukcji do zatwierdzenia</p>
                      </div>
                    ) : (
                      auctions.map(auction => (
                        <div
                          key={auction.id}
                          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-2">
                                {auction.title}
                              </h3>
                              <p className="text-white/70 text-sm mb-2">{auction.description}</p>
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <span>Kategoria: {auction.category}</span>
                                <span>Cena startowa: {auction.startingPrice} zł</span>
                                <span>
                                  Sprzedawca: {auction.seller.firstName} {auction.seller.lastName}
                                </span>
                                <span>
                                  Data utworzenia:{' '}
                                  {new Date(auction.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {auction.assets && auction.assets.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-white/60 text-sm">Zasoby:</p>
                                  <div className="flex gap-2 mt-1">
                                    {auction.assets.slice(0, 3).map(asset => (
                                      <div key={asset.id} className="text-xs text-white/50">
                                        {asset.type}: {asset.url.split('/').pop()}
                                      </div>
                                    ))}
                                    {auction.assets.length > 3 && (
                                      <div className="text-xs text-white/50">
                                        +{auction.assets.length - 3} więcej
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => approveAuction(auction.id)}
                                disabled={approving === auction.id}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {approving === auction.id ? 'Zatwierdzanie...' : 'Zatwierdź'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {auctionsTotal > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>
                          Strona {auctionsPage} z{' '}
                          {Math.max(1, Math.ceil(auctionsTotal / auctionsPageSize))}
                        </span>
                        <span>Łącznie: {auctionsTotal} aukcji</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={auctionsPage <= 1}
                          onClick={() => setAuctionsPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1 border border-white/20 rounded text-white disabled:opacity-50 hover:bg-white/10"
                        >
                          Poprzednia
                        </button>
                        <button
                          disabled={auctionsPage >= Math.ceil(auctionsTotal / auctionsPageSize)}
                          onClick={() => setAuctionsPage(p => p + 1)}
                          className="px-3 py-1 border border-white/20 rounded text-white disabled:opacity-50 hover:bg-white/10"
                        >
                          Następna
                        </button>
                        <select
                          value={auctionsPageSize}
                          onChange={e => {
                            setAuctionsPage(1);
                            setAuctionsPageSize(parseInt(e.target.value, 10));
                          }}
                          className="ml-2 border border-white/20 rounded px-2 py-1 bg-gray-800 text-white"
                          aria-label="Rozmiar strony aukcji"
                          title="Rozmiar strony aukcji"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {auctionTab === 'active' && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Aktywne aukcje</h3>

                  <div className="space-y-4">
                    {activeAuctions.length === 0 ? (
                      <div className="text-center py-8 text-white/70">
                        <Gavel className="w-12 h-12 mx-auto mb-4 text-white/40" />
                        <p>Brak aktywnych aukcji</p>
                      </div>
                    ) : (
                      activeAuctions.map(auction => (
                        <div
                          key={auction.id}
                          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-2">
                                {auction.title}
                              </h3>
                              <p className="text-white/70 text-sm mb-2">{auction.description}</p>
                              <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                                <span>Kategoria: {auction.category}</span>
                                <span>Cena startowa: {auction.startingPrice} zł</span>
                                <span>Aktualna cena: {auction.currentPrice} zł</span>
                                <span>
                                  Sprzedawca: {auction.seller.firstName} {auction.seller.lastName}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <span>
                                  Start: {new Date(auction.startTime).toLocaleDateString()}
                                </span>
                                <span>
                                  Koniec: {new Date(auction.endTime).toLocaleDateString()}
                                </span>
                                {auction.bids && auction.bids.length > 0 && (
                                  <span>
                                    Najwyższa oferta: {auction.bids[0].bidder.firstName}{' '}
                                    {auction.bids[0].bidder.lastName} - {auction.bids[0].amount} zł
                                  </span>
                                )}
                              </div>
                              {auction.assets && auction.assets.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-white/60 text-sm">Zasoby:</p>
                                  <div className="flex gap-2 mt-1">
                                    {auction.assets.slice(0, 3).map(asset => (
                                      <div key={asset.id} className="text-xs text-white/50">
                                        {asset.type}: {asset.url.split('/').pop()}
                                      </div>
                                    ))}
                                    {auction.assets.length > 3 && (
                                      <div className="text-xs text-white/50">
                                        +{auction.assets.length - 3} więcej
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => window.open(`/auctions/${auction.id}`, '_blank')}
                                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                title="Zobacz aukcję"
                              >
                                Zobacz
                              </button>
                              <button
                                onClick={() => viewAuctionBidders(auction)}
                                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                title="Przeglądaj licytujących"
                              >
                                Licytujący
                              </button>
                              <button
                                onClick={() => editAuction(auction)}
                                className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                                title="Edytuj aukcję"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => endAuction(auction.id, auction.title)}
                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                title="Zakończ aukcję"
                              >
                                <StopCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {activeAuctionsTotal > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>
                          Strona {activeAuctionsPage} z{' '}
                          {Math.max(1, Math.ceil(activeAuctionsTotal / activeAuctionsPageSize))}
                        </span>
                        <span>Łącznie: {activeAuctionsTotal} aukcji</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={activeAuctionsPage <= 1}
                          onClick={() => setActiveAuctionsPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1 border border-white/20 rounded text-white disabled:opacity-50 hover:bg-white/10"
                        >
                          Poprzednia
                        </button>
                        <button
                          disabled={
                            activeAuctionsPage >=
                            Math.ceil(activeAuctionsTotal / activeAuctionsPageSize)
                          }
                          onClick={() => setActiveAuctionsPage(p => p + 1)}
                          className="px-3 py-1 border border-white/20 rounded text-white disabled:opacity-50 hover:bg-white/10"
                        >
                          Następna
                        </button>
                        <select
                          value={activeAuctionsPageSize}
                          onChange={e => {
                            setActiveAuctionsPage(1);
                            setActiveAuctionsPageSize(parseInt(e.target.value, 10));
                          }}
                          className="ml-2 border border-white/20 rounded px-2 py-1 bg-gray-800 text-white"
                          aria-label="Rozmiar strony aktywnych aukcji"
                          title="Rozmiar strony aktywnych aukcji"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Transakcje</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aukcja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kupujący
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sprzedawca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kwota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prowizja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {txs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-600">
                          Brak danych transakcji
                        </td>
                      </tr>
                    ) : (
                      txs.map(tx => (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.auction?.title || 'Aukcja'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {`${tx.buyer?.firstName || ''} ${tx.buyer?.lastName || ''}`.trim() ||
                              tx.buyer?.email ||
                              ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {`${tx.seller?.firstName || ''} ${tx.seller?.lastName || ''}`.trim() ||
                              tx.seller?.email ||
                              ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Number(tx.amount || 0).toLocaleString()} zł
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Number(tx.commission || 0).toLocaleString()} zł
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(String(tx.status || 'pending'))}`}
                            >
                              {getStatusText(String(tx.status || 'pending'))}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString('pl-PL')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Status</label>
                    <select
                      aria-label="Filtr statusu transakcji"
                      title="Filtr statusu transakcji"
                      value={txsStatus}
                      onChange={e => {
                        setTxsPage(1);
                        setTxsStatus(e.target.value);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Wszystkie</option>
                      <option value="PENDING">Oczekuje</option>
                      <option value="COMPLETED">Zakończona</option>
                      <option value="DISPUTED">Spór</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      disabled={txsPage <= 1}
                      onClick={() => setTxsPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Poprzednia
                    </button>
                    <span>
                      Strona {txsPage} z {Math.max(1, Math.ceil(txsTotal / txsPageSize))}
                    </span>
                    <button
                      disabled={txsPage >= Math.ceil(txsTotal / txsPageSize)}
                      onClick={() => setTxsPage(p => p + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Następna
                    </button>
                    <select
                      aria-label="Rozmiar strony transakcji"
                      title="Rozmiar strony transakcji"
                      value={txsPageSize}
                      onChange={e => {
                        setTxsPage(1);
                        setTxsPageSize(parseInt(e.target.value, 10));
                      }}
                      className="ml-2 border rounded px-2 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'references' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Zarządzanie referencjami</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReferencesStatus('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      referencesStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Oczekujące ({referencesStatus === 'pending' ? references.length : 0})
                  </button>
                  <button
                    onClick={() => setReferencesStatus('approved')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      referencesStatus === 'approved'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Zatwierdzone
                  </button>
                  <button
                    onClick={() => setReferencesStatus('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      referencesStatus === 'all'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Wszystkie
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {references.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Brak referencji do wyświetlenia
                  </div>
                ) : (
                  references.map(reference => (
                    <div key={reference.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{reference.breederName}</h3>
                          <p className="text-sm text-gray-600">{reference.location}</p>
                          <p className="text-sm text-gray-600">
                            Doświadczenie: {reference.experience}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < reference.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reference.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {reference.isApproved ? 'Zatwierdzona' : 'Oczekuje'}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{reference.testimonial}</p>

                      {reference.achievements && reference.achievements.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">Osiągnięcia:</h4>
                          <div className="space-y-1">
                            {reference.achievements.map(
                              (
                                achievement: {
                                  pigeon: string;
                                  ringNumber: string;
                                  results?: Array<{
                                    place: string;
                                    competition: string;
                                    date: string;
                                  }>;
                                },
                                index: number
                              ) => (
                                <div key={index} className="text-sm text-gray-600">
                                  <strong>{achievement.pigeon}</strong> ({achievement.ringNumber}) -{' '}
                                  {achievement.results
                                    ?.map(
                                      result =>
                                        `${result.place} miejsce w ${result.competition} (${result.date})`
                                    )
                                    .join(', ')}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                          Dodano: {new Date(reference.createdAt).toLocaleDateString('pl-PL')}
                        </span>
                        <div className="flex gap-2">
                          {!reference.isApproved && (
                            <>
                              <button
                                onClick={() => approveReference(reference.id, true)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                title="Zatwierdź referencję"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Zatwierdź
                              </button>
                              <button
                                onClick={() => approveReference(reference.id, false)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                title="Odrzuć referencję"
                              >
                                <XCircle className="w-4 h-4" />
                                Odrzuć
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteReference(reference.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                            title="Usuń referencję"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'meetings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Zarządzanie spotkaniami z hodowcami
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMeetingsStatus('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      meetingsStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Oczekujące ({meetingsStatus === 'pending' ? meetings.length : 0})
                  </button>
                  <button
                    onClick={() => setMeetingsStatus('approved')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      meetingsStatus === 'approved'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Zatwierdzone
                  </button>
                  <button
                    onClick={() => setMeetingsStatus('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      meetingsStatus === 'all'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Wszystkie
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {meetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Brak spotkań do wyświetlenia</div>
                ) : (
                  meetings.map(meeting => (
                    <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                          <p className="text-sm text-gray-600">{meeting.location}</p>
                          <p className="text-sm text-gray-600">
                            Data: {new Date(meeting.date).toLocaleDateString('pl-PL')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Dodane przez: {meeting.user.firstName} {meeting.user.lastName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meeting.isApproved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {meeting.isApproved ? 'Zatwierdzone' : 'Oczekuje'}
                        </span>
                      </div>

                      {meeting.description && (
                        <p className="text-gray-700 mb-3">{meeting.description}</p>
                      )}

                      {meeting.images && meeting.images.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Zdjęcia ({meeting.images.length}):
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {meeting.images.slice(0, 4).map((image: string, index: number) => (
                              <div
                                key={index}
                                className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={image}
                                  alt={`Zdjęcie ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {meeting.images.length > 4 && (
                              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm text-gray-600">
                                  +{meeting.images.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                          Dodano: {new Date(meeting.createdAt).toLocaleDateString('pl-PL')}
                        </span>
                        <div className="flex gap-2">
                          {!meeting.isApproved && (
                            <>
                              <button
                                onClick={() => approveMeeting(meeting.id, true)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                title="Zatwierdź spotkanie"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Zatwierdź
                              </button>
                              <button
                                onClick={() => approveMeeting(meeting.id, false)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                title="Odrzuć spotkanie"
                              >
                                <XCircle className="w-4 h-4" />
                                Odrzuć
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteMeeting(meeting.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                            title="Usuń spotkanie"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ustawienia platformy</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prowizja platformy (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Prowizja platformy w procentach"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksymalny czas trwania aukcji (dni)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Maksymalny czas trwania aukcji w dniach"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimalna cena wywoławcza (zł)
                  </label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Minimalna cena wywoławcza w złotych"
                  />
                </div>

                <button className="bg-slate-600 text-white px-6 py-2 rounded-md hover:bg-slate-700 transition-colors">
                  Zapisz ustawienia
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal licytujących */}
        {selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Licytujący - {selectedAuction.title}
                </h3>
                <button
                  onClick={() => setSelectedAuction(null)}
                  className="text-gray-400 hover:text-white"
                  title="Zamknij"
                  aria-label="Zamknij modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loadingBidders ? (
                <div className="text-center py-8 text-white/70">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Ładowanie licytujących...</p>
                </div>
              ) : auctionBidders.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <Users className="w-12 h-12 mx-auto mb-4 text-white/40" />
                  <p>Brak licytujących w tej aukcji</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {auctionBidders.map((bidder, index) => (
                      <div
                        key={bidder.id}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">
                            {bidder.firstName} {bidder.lastName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                index === 0
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {index === 0 ? 'Najwyższa' : `#${index + 1}`}
                            </span>
                            <button
                              onClick={() => editBid(bidder)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="Edytuj licytację"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBid(bidder.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Usuń licytację"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                blockUser(bidder.id, `${bidder.firstName} ${bidder.lastName}`)
                              }
                              className="p-1 text-orange-400 hover:text-orange-300"
                              title="Zablokuj użytkownika"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-white/70">
                          <p>Email: {bidder.email}</p>
                          {editingBid && editingBid.id === bidder.id ? (
                            <div className="flex items-center gap-2">
                              <span>Oferta:</span>
                              <input
                                type="number"
                                value={editingBid.amount}
                                onChange={e =>
                                  setEditingBid({
                                    ...editingBid,
                                    amount: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="bg-gray-600 text-white px-2 py-1 rounded text-sm w-20"
                                min="0"
                                step="0.01"
                                aria-label="Kwota licytacji"
                                title="Kwota licytacji"
                              />
                              <span>zł</span>
                              <button
                                onClick={saveBidEdit}
                                disabled={savingBid}
                                className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                                title="Zapisz"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingBid(null)}
                                className="p-1 text-gray-400 hover:text-gray-300"
                                title="Anuluj"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <p>
                              Oferta:{' '}
                              <span className="font-semibold text-green-400">
                                {bidder.amount} zł
                              </span>
                            </p>
                          )}
                          <p>Data: {new Date(bidder.createdAt).toLocaleString()}</p>
                          {bidder.totalBids && <p>Łączne licytacje: {bidder.totalBids}</p>}
                          {bidder.rating && <p>Ocena: {bidder.rating}/5 ⭐</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal edycji aukcji */}
        {editingAuctionData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Edytuj aukcję</h3>
                <button
                  onClick={() => setEditingAuctionData(null)}
                  className="text-gray-400 hover:text-white"
                  title="Zamknij"
                  aria-label="Zamknij modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tytuł aukcji</label>
                  <input
                    type="text"
                    value={editingAuctionData.title}
                    onChange={e =>
                      setEditingAuctionData({ ...editingAuctionData, title: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                    placeholder="Wprowadź tytuł aukcji"
                    aria-label="Tytuł aukcji"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Aktualna cena (zł)
                  </label>
                  <input
                    type="number"
                    value={editingAuctionData.currentPrice}
                    onChange={e =>
                      setEditingAuctionData({ ...editingAuctionData, currentPrice: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    aria-label="Aktualna cena aukcji"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Data zakończenia
                  </label>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment */}
                  {/* stylelint-disable-next-line property-no-vendor-prefix */}
                  {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                  <input
                    type="datetime-local"
                    value={editingAuctionData.endTime}
                    onChange={e =>
                      setEditingAuctionData({ ...editingAuctionData, endTime: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 datetime-input"
                    aria-label="Data zakończenia aukcji"
                    data-fallback="true"
                  />
                  {/* Fallback text input for very old browsers */}
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 mt-2 datetime-fallback"
                    aria-label="Data zakończenia aukcji (fallback)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status aukcji</label>
                  <select
                    value={editingAuctionData.status}
                    onChange={e =>
                      setEditingAuctionData({ ...editingAuctionData, status: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                    aria-label="Status aukcji"
                  >
                    <option value="ACTIVE">Aktywna</option>
                    <option value="ENDED">Zakończona</option>
                    <option value="CANCELLED">Anulowana</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveAuctionEdit}
                    disabled={savingAuction}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingAuction ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                  <button
                    onClick={() => setEditingAuctionData(null)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
