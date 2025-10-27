'use client';

import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { Search, Send, User, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string;
}

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStarted: (conversationId: string) => void;
}

export function StartConversationModal({
  isOpen,
  onClose,
  onConversationStarted,
}: StartConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [messageContent, setMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Wyszukaj użytkowników
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const searchUsers = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setUsers(data.users || []);
          }
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const timeoutId = setTimeout(searchUsers, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery('');
    setUsers([]);
  };

  const handleStartConversation = async () => {
    if (!selectedUser || !messageContent.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: messageContent.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onConversationStarted(data.conversation.id);
        onClose();
        setSelectedUser(undefined);
        setMessageContent('');
        setSearchQuery('');
      } else {
        const error = await response.json();
        alert(error.error || 'Nie udało się rozpocząć konwersacji');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Wystąpił błąd podczas rozpoczynania konwersacji');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedUser && messageContent.trim()) {
        handleStartConversation();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <UnifiedCard variant="glass" className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Nowa konwersacja</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedUser ? (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Wyszukaj użytkownika..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {isLoading && <div className="text-center py-4 text-gray-400">Wyszukiwanie...</div>}

              {users.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full p-3 text-left hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.firstName || user.email}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && users.length === 0 && !isLoading && (
                <div className="text-center py-4 text-gray-400">Nie znaleziono użytkowników</div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.firstName || selectedUser.email}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email}
                  </p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(undefined)}
                  className="ml-auto text-gray-400 hover:text-white"
                  title="Anuluj wybór"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pierwsza wiadomość
                </label>
                <textarea
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Napisz pierwszą wiadomość..."
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <UnifiedButton
                  onClick={handleStartConversation}
                  disabled={!messageContent.trim() || isSending}
                  className="flex-1"
                >
                  {isSending ? (
                    'Wysyłanie...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Rozpocznij konwersację
                    </>
                  )}
                </UnifiedButton>
                <UnifiedButton variant="secondary" onClick={onClose} disabled={isSending}>
                  Anuluj
                </UnifiedButton>
              </div>
            </div>
          )}
        </div>
      </UnifiedCard>
    </div>
  );
}
