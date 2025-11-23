'use client';
import { useAuth } from '@/app/src/context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatPage({ params }: { params: { matchId: string } }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!user) return;

    // Suscribirse a mensajes en tiempo real
    const channel = supabase
      .channel(`chat:${params.matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${params.matchId}`
      }, (payload) => {
        console.log('Nuevo mensaje:', payload);
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [user, params.matchId]);

  return (
    <div>
      {/* Interfaz de chat */}
    </div>
  );
}