// AI-generated chat room component with history and live updates
import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { MESSAGE_ADDED, MESSAGES, SEND_MESSAGE } from '../graphql/chat';

type ChatRoomProps = {
  roomId: string;
  roomName: string;
  currentUserId: string;
};

type MessageNode = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  roomName,
  currentUserId,
}) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<MessageNode[]>([]);

  const { data, loading } = useQuery(MESSAGES, {
    variables: { roomId, limit: 50 },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);

  useSubscription(MESSAGE_ADDED, {
    variables: { roomId },
    onData: ({ data }) => {
      const msg = data.data?.messageAdded as MessageNode | undefined;
      if (!msg) return;
      setMessages((prev) => {
        const next = [...prev, msg];
        // Ensure stable ordering by createdAt then id
        return next.sort((a, b) => {
          const tA = new Date(a.createdAt).getTime();
          const tB = new Date(b.createdAt).getTime();
          if (tA === tB) {
            return Number(a.id) - Number(b.id);
          }
          return tA - tB;
        });
      });
    },
  });

  useEffect(() => {
    if (data?.messages?.edges) {
      const initial = data.messages.edges.map(
        (e: { node: MessageNode }) => e.node,
      );
      setMessages(initial);
    }
  }, [data]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage({ variables: { roomId, content: text } });
    setText('');
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => {
        const tA = new Date(a.createdAt).getTime();
        const tB = new Date(b.createdAt).getTime();
        if (tA === tB) {
          return Number(a.id) - Number(b.id);
        }
        return tA - tB;
      }),
    [messages],
  );

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Room: {roomName}</h2>
      {loading && <p>Loading history…</p>}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '1rem',
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {sortedMessages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: '0.5rem',
              textAlign: m.senderId === currentUserId ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background:
                  m.senderId === currentUserId ? '#DCF8C6' : '#f1f0f0',
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {m.senderId === currentUserId ? 'You' : `User ${m.senderId}`}
              </div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        {sortedMessages.length === 0 && !loading && <p>No messages yet.</p>}
      </div>
      <form onSubmit={handleSend} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          style={{ width: '80%' }}
        />
        <button type="submit" style={{ width: '18%', marginLeft: '2%' }}>
          Send
        </button>
      </form>
    </div>
  );
};

