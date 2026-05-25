'use client';

import { useState } from 'react';
import { TeacherHeader } from '@/components/teacher/teacher-header';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Plus,
  Paperclip,
  Send,
  Star,
  Archive,
  MoreVertical,
  Circle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  contact: {
    name: string;
    role: 'parent' | 'admin';
    studentName?: string;
  };
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  starred: boolean;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

const conversations: Conversation[] = [
  {
    id: '1',
    contact: { name: 'Mme Martin', role: 'parent', studentName: 'Lucas Martin' },
    lastMessage: 'Merci pour ces précisions sur le contrôle à venir.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: true,
    starred: false,
  },
  {
    id: '2',
    contact: { name: 'M. Bernard', role: 'parent', studentName: 'Emma Bernard' },
    lastMessage: "Pouvez-vous m'expliquer le système de notation ?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: true,
    starred: true,
  },
  {
    id: '3',
    contact: { name: 'Direction', role: 'admin' },
    lastMessage: 'Réunion pédagogique vendredi à 14h',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unread: false,
    starred: false,
  },
  {
    id: '4',
    contact: { name: 'Mme Dubois', role: 'parent', studentName: 'Léa Dubois' },
    lastMessage: 'Léa a bien reçu les exercices supplémentaires.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unread: false,
    starred: false,
  },
  {
    id: '5',
    contact: { name: 'M. Robert', role: 'parent', studentName: 'Nathan Robert' },
    lastMessage: "Nous avons pris note de l'absence de Nathan.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    unread: false,
    starred: false,
  },
];

const selectedMessages: Message[] = [
  { id: '1', content: 'Bonjour Madame Boucher, je voulais vous remercier pour les explications données à Lucas concernant les équations.', timestamp: new Date(Date.now() - 1000 * 60 * 60), isMe: false },
  { id: '2', content: "Je vous en prie, Lucas fait de réels progrès cette année. N'hésitez pas à me contacter si vous avez des questions.", timestamp: new Date(Date.now() - 1000 * 60 * 45), isMe: true },
  { id: '3', content: "À ce propos, pourriez-vous me donner plus de détails sur le contrôle prévu la semaine prochaine ?", timestamp: new Date(Date.now() - 1000 * 60 * 40), isMe: false },
  { id: '4', content: "Bien sûr. Le contrôle portera sur les chapitres 4 et 5 : équations du premier degré et fonctions affines. Je conseille à Lucas de revoir les exercices des pages 78 à 85.", timestamp: new Date(Date.now() - 1000 * 60 * 35), isMe: true },
  { id: '5', content: "Merci pour ces précisions sur le contrôle à venir.", timestamp: new Date(Date.now() - 1000 * 60 * 30), isMe: false },
];

const formatTimestamp = (date: Date) => {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  return format(date, 'd MMM', { locale: fr });
};

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      <TeacherHeader 
        title="Messagerie" 
        subtitle="Communiquez avec les parents et l'administration"
      />
      
      <div className="p-6">
        <div className="flex h-[calc(100vh-180px)] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* Conversations List */}
          <div className="w-80 flex-shrink-0 border-r border-slate-200">
            <div className="border-b border-slate-100 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-slate-200 bg-slate-50 pl-9 text-sm focus:bg-white"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-73px)]">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left transition-colors border-b border-slate-50',
                    selectedConversation.id === conversation.id
                      ? 'bg-emerald-50'
                      : 'hover:bg-slate-50'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarFallback className={cn(
                        'text-sm',
                        conversation.contact.role === 'admin' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {conversation.contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread && (
                      <Circle className="absolute -right-0.5 -top-0.5 h-3 w-3 fill-emerald-500 text-emerald-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        'text-sm truncate',
                        conversation.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                      )}>
                        {conversation.contact.name}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {formatTimestamp(conversation.timestamp)}
                      </span>
                    </div>
                    {conversation.contact.studentName && (
                      <p className="text-xs text-emerald-600">{conversation.contact.studentName}</p>
                    )}
                    <p className={cn(
                      'mt-0.5 text-sm truncate',
                      conversation.unread ? 'text-slate-700' : 'text-slate-500'
                    )}>
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {conversation.starred && (
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                    {selectedConversation.contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{selectedConversation.contact.name}</p>
                  {selectedConversation.contact.studentName && (
                    <p className="text-sm text-slate-500">Parent de {selectedConversation.contact.studentName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <Star className="h-5 w-5" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <Archive className="h-5 w-5" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.isMe ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2.5',
                    message.isMe 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-900'
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      'mt-1 text-xs',
                      message.isMe ? 'text-emerald-200' : 'text-slate-400'
                    )}>
                      {format(message.timestamp, 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-end gap-3">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows={1}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <Button 
                  className="h-10 gap-2 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
