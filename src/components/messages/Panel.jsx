"use client";

import React, { useState, useEffect } from 'react';
import ListContacts from './listChats';
import Chat from './Chat';
import InfoContact from './infoContact';
import MassivePanel from './massivePanel';

// Dynamic backend URL
const API_URL = 'http://localhost:4000/api';

export default function MessagesPanel() {
  const [view, setView] = useState('chat'); // 'chat' or 'massive'
  const [showInfo, setShowInfo] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll conversations every 3 seconds
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/conversations`);
        const result = await res.json();
        if (result.success) {
          // Format data to match ListContacts expected format
          const formatted = result.data.map(c => ({
            id: c.id,
            name: c.sender_name,
            avatar: c.sender_avatar || `https://ui-avatars.com/api/?name=${c.sender_name}`,
            lastMessage: c.last_message,
            time: new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: c.unread_count,
            online: true,
            platform: c.platform,
            sender_id: c.sender_id
          }));
          setContacts(formatted);
          if (loading) setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
    const intervalId = setInterval(fetchConversations, 3000);
    return () => clearInterval(intervalId);
  }, [loading]);

  // Poll messages for active contact
  useEffect(() => {
    if (!activeContact) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/conversations/${activeContact.id}`);
        const result = await res.json();
        if (result.success) {
          const formattedMessages = result.data.map(m => ({
            id: m.id,
            text: m.text,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: m.is_mine === 1,
            status: m.status
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalId);
  }, [activeContact]);

  const handleSendMessage = async (text) => {
    if (!text || !activeContact) return;

    // Optimistic UI update
    const tempMsg = { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMine: true, status: 'Sending...' };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeContact.id,
          text,
          platform: activeContact.platform,
          senderId: activeContact.sender_id,
          pageAccessToken: '' // MVP: We need the Page Token here.
        })
      });
      // The polling will fetch the real message in 3 seconds
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white rounded-[32px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-500 font-medium">Cargando mensajes...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white rounded-[32px] shadow-sm relative">
      {view === 'massive' ? (
        <MassivePanel contacts={contacts} onCancel={() => setView('chat')} />
      ) : (
        <>
          <ListContacts 
             contacts={contacts} 
             onStartMassive={() => setView('massive')} 
             // Temporarily select contact[0] if none active, or modify ListContacts to handle selection
             // This assumes ListContacts has a way to select a chat. Let's pass setActiveContact down if we need it.
             onSelectContact={(c) => setActiveContact(c)}
             activeContact={activeContact}
          />

          <Chat
            messages={messages}
            contact={activeContact || contacts[0]}
            onHeaderClick={() => setShowInfo(!showInfo)}
            onSendMessage={handleSendMessage}
          />

          {showInfo && <InfoContact contact={activeContact || contacts[0]} />}
        </>
      )}
    </div>
  );
}
