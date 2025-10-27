'use client';

import { useEffect, useRef } from 'react';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';

export function useMessagePolling() {
  const { addNotification } = useMessageNotifications();
  const lastCheckRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkForNewMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();

          // Sprawdź czy są nowe wiadomości od ostatniego sprawdzenia
          const newMessages = data.conversations
            .filter((conv: any) => conv.lastMessage)
            .filter((conv: any) => {
              const messageTime = new Date(conv.lastMessage.createdAt);
              return messageTime > lastCheckRef.current;
            });

          // Dodaj powiadomienia dla nowych wiadomości
          newMessages.forEach((conv: any) => {
            addNotification({
              id: conv.lastMessage.id,
              senderName: conv.lastMessage.senderName,
              content: conv.lastMessage.content,
              conversationId: conv.id,
              createdAt: conv.lastMessage.createdAt,
            });
          });

          // Zaktualizuj czas ostatniego sprawdzenia
          lastCheckRef.current = new Date();
        }
      } catch (error) {
        console.error('Error checking for new messages:', error);
      }
    };

    // Sprawdzaj co 30 sekund
    intervalRef.current = setInterval(checkForNewMessages, 30000);

    // Sprawdź od razu po załadowaniu
    checkForNewMessages();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [addNotification]);

  return null;
}
