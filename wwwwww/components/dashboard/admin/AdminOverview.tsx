'use client';

import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Gavel, Users } from 'lucide-react';
import { memo } from 'react';

interface StatsResponse {
  totalUsers: number;
  totalAuctions: number;
  totalTransactions: number;
  disputes: number;
}

interface AdminOverviewProps {
  stats: StatsResponse | null;
  isLoading: boolean;
}

const AdminOverview = memo(function AdminOverview({ stats, isLoading }: AdminOverviewProps) {
  const statsCards = [
    {
      title: 'Użytkownicy',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Aukcje',
      value: stats?.totalAuctions || 0,
      icon: Gavel,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Transakcje',
      value: stats?.totalTransactions || 0,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Spory',
      value: stats?.disputes || 0,
      icon: BarChart3,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-32 bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card hover-3d-lift ${stat.bgColor} ${stat.borderColor} border`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Szybkie akcje</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all duration-200 hover:scale-105">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">Zarządzaj użytkownikami</p>
          </button>
          <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-all duration-200 hover:scale-105">
            <Gavel className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Moderuj aukcje</p>
          </button>
          <button className="p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg transition-all duration-200 hover:scale-105">
            <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-medium">Przeglądaj transakcje</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export default AdminOverview;
