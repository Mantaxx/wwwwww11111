'use client';

import { motion } from 'framer-motion';
import { Ban, CheckCircle, Edit, Trash2, UserCheck, Users, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminUsersProps {
  users: User[];
  usersTotal: number;
  usersPage: number;
  usersPageSize: number;
  usersRole: string;
  usersStatus: string;
  editingUser: User | null;
  editForm: { firstName: string; lastName: string; role: string; isActive: boolean };
  saving: boolean;
  deleting: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRoleFilter: (role: string) => void;
  onStatusFilter: (status: string) => void;
  onEditUser: (user: User) => void;
  onSaveUser: () => void;
  onDeleteUser: (userId: string) => void;
  onCancelEdit: () => void;
  onFormChange: (field: string, value: string | boolean) => void;
}

const AdminUsers = memo(function AdminUsers({
  users,
  usersTotal,
  usersPage,
  usersPageSize,
  usersRole,
  usersStatus,
  editingUser,
  editForm,
  saving,
  deleting,
  onPageChange,
  onPageSizeChange,
  onRoleFilter,
  onStatusFilter,
  onEditUser,
  onSaveUser,
  onDeleteUser,
  onCancelEdit,
  onFormChange,
}: AdminUsersProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = useCallback((userId: string) => {
    setShowDeleteConfirm(userId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (showDeleteConfirm) {
      onDeleteUser(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  }, [showDeleteConfirm, onDeleteUser]);

  const totalPages = Math.ceil(usersTotal / usersPageSize);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-white mb-2">Rola</label>
            <select
              value={usersRole}
              onChange={e => onRoleFilter(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
              aria-label="Filtruj według roli"
            >
              <option value="">Wszystkie role</option>
              <option value="USER">Użytkownik</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-white mb-2">Status</label>
            <select
              value={usersStatus}
              onChange={e => onStatusFilter(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
              aria-label="Filtruj według statusu"
            >
              <option value="">Wszystkie statusy</option>
              <option value="active">Aktywni</option>
              <option value="inactive">Nieaktywni</option>
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-white mb-2">Na stronę</label>
            <select
              value={usersPageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
              aria-label="Liczba użytkowników na stronę"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Użytkownicy ({usersTotal})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 text-white font-medium">Użytkownik</th>
                <th className="text-left py-3 px-4 text-white font-medium">Email</th>
                <th className="text-left py-3 px-4 text-white font-medium">Rola</th>
                <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                <th className="text-left py-3 px-4 text-white font-medium">Data rejestracji</th>
                <th className="text-left py-3 px-4 text-white font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : 'Brak danych'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/80">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Ban className="w-4 h-4 text-red-400" />
                      )}
                      <span className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                        {user.isActive ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/80">
                    {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditUser(user)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                        title="Edytuj użytkownika"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                        title="Usuń użytkownika"
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
            Strona {usersPage} z {totalPages} ({usersTotal} użytkowników)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(usersPage - 1)}
              disabled={usersPage <= 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all duration-200"
            >
              Poprzednia
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">{usersPage}</span>
            <button
              onClick={() => onPageChange(usersPage + 1)}
              disabled={usersPage >= totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all duration-200"
            >
              Następna
            </button>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {editingUser && (
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Edytuj użytkownika</h3>
              <button
                onClick={onCancelEdit}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200"
                aria-label="Zamknij modal edycji użytkownika"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Imię</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={e => onFormChange('firstName', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                  aria-label="Imię użytkownika"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nazwisko</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={e => onFormChange('lastName', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                  aria-label="Nazwisko użytkownika"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Rola</label>
                <select
                  value={editForm.role}
                  onChange={e => onFormChange('role', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500"
                  aria-label="Rola użytkownika"
                >
                  <option value="USER">Użytkownik</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={e => onFormChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-white">
                  Aktywny
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onSaveUser}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {saving ? 'Zapisywanie...' : 'Zapisz'}
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
              <h3 className="text-xl font-semibold text-white mb-2">Usuń użytkownika</h3>
              <p className="text-white/70 mb-6">
                Czy na pewno chcesz usunąć tego użytkownika? Ta akcja nie może zostać cofnięta.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  {deleting ? 'Usuwanie...' : 'Usuń'}
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

export default AdminUsers;
