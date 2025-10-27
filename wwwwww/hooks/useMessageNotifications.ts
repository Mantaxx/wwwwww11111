'use client';

import { useEffect, useState } from 'react';

interface MessageNotification {
  id: string;
  senderName: string;
  content: string;
  conversationId: string;
  createdAt: string;
}

export function useMessageNotifications() {
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Pobierz powiadomienia z localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem('messageNotifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.length);
    }
  }, []);

  // Zapisz powiadomienia do localStorage
  useEffect(() => {
    localStorage.setItem('messageNotifications', JSON.stringify(notifications));
    setUnreadCount(notifications.length);
  }, [notifications]);

  const addNotification = (notification: MessageNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Maksymalnie 10 powiadomień
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
  };
}
