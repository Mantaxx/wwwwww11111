'use client';

import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UnifiedCard } from '@/components/ui/UnifiedCard';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { MessageCircle, Send, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    isRead: boolean;
    createdAt: string;
  };
  lastMessageAt: string;
  unreadCount: number;
}

interface MessagesListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export function MessagesList({
  conversations,
  onSelectConversation,
  selectedConversationId,
}: MessagesListProps) {
  return (
    <div className="w-full md:w-80 shrink-0">
      <UnifiedCard variant="glass" className="h-full">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Wiadomości
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Brak wiadomości</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors ${
                    selectedConversationId === conversation.id ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                      {conversation.otherParticipant.image ? (
                        <Image
                          src={conversation.otherParticipant.image}
                          alt={conversation.otherParticipant.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white truncate">
                          {conversation.otherParticipant.name}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-300 truncate">
                            {conversation.lastMessage.content}
                          </p>
                          <span className="text-xs text-gray-400 ml-2 shrink-0">
                            {format(new Date(conversation.lastMessageAt), 'HH:mm', { locale: pl })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </UnifiedCard>
    </div>
  );
}

interface MessageChatProps {
  conversationId?: string;
  otherParticipant?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  userId: string;
}

export function MessageChat({
  conversationId,
  otherParticipant,
  messages,
  onSendMessage,
  isLoading = false,
  userId,
}: MessageChatProps) {
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent.trim());
      setMessageContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Wybierz konwersację</p>
          <p className="text-sm">Aby rozpocząć rozmowę</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <UnifiedCard variant="glass" className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              {otherParticipant.image ? (
                <Image
                  src={otherParticipant.image}
                  alt={otherParticipant.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{otherParticipant.name}</h3>
              <p className="text-sm text-gray-400">{otherParticipant.email}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Brak wiadomości w tej konwersacji</p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(message.createdAt), 'HH:mm', { locale: pl })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Napisz wiadomość..."
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <UnifiedButton
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || isLoading}
              className="px-4 py-2"
            >
              <Send className="w-4 h-4" />
            </UnifiedButton>
          </div>
        </div>
      </UnifiedCard>
    </div>
  );
}

interface MessagesPageProps {
  userId: string;
}

export function MessagesPage({ userId }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<{
    id: string;
    name: string;
    email: string;
    image?: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);

  // Pobierz konwersacje
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  // Pobierz wiadomości dla wybranej konwersacji
  useEffect(() => {
    if (selectedConversationId) {
      const fetchMessages = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/messages/${selectedConversationId}`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages);
            setOtherParticipant(data.conversation.otherParticipant);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMessages();
    }
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [
          ...prev,
          {
            ...data.message,
            senderId: userId, // Użyj rzeczywistego ID użytkownika
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Wiadomości</h1>
          <p className="text-gray-400">Komunikuj się z innymi użytkownikami</p>
        </div>

        <div className="flex gap-6 h-[600px]">
          <MessagesList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />

          <MessageChat
            conversationId={selectedConversationId}
            otherParticipant={otherParticipant}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
