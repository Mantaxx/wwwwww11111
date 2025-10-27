'use client';

import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { Bell, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, clearAllNotifications } =
    useMessageNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 z-50">
      <UnifiedCard variant="glass" className="p-0">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Powiadomienia
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <UnifiedButton variant="secondary" size="sm" onClick={clearAllNotifications}>
                  Wyczyść
                </UnifiedButton>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                title="Zamknij"
                aria-label="Zamknij powiadomienia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Brak powiadomień</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => {
                    markAsRead(notification.id);
                    onClose();
                    // Można dodać nawigację do konwersacji
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        Nowa wiadomość od {notification.senderName}
                      </p>
                      <p className="text-xs text-gray-300 truncate mt-1">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString('pl-PL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </UnifiedCard>
    </div>
  );
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useMessageNotifications();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
