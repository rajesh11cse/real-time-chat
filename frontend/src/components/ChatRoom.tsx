// chat room component with history and live updates
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
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
        const next = [...prev, msg];
        return next.sort((a, b) => {
          const tA = new Date(a.createdAt).getTime();
          const tB = new Date(b.createdAt).getTime();
          if (tA === tB) return Number(a.id) - Number(b.id);
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
    // Sender sees their message via subscription (same as other users), so no duplicate
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
    <div className="chat-layout">
      <div className="chat-header">
        <h1>{roomName}</h1>
      </div>
      <div className="chat-messages">
        {loading && (
          <div className="chat-messages-loading">Loading history…</div>
        )}
        {!loading && sortedMessages.length === 0 && (
          <div className="chat-messages-empty">No messages yet. Say hello!</div>
        )}
        {!loading &&
          sortedMessages.map((m) => (
            <div
              key={m.id}
              className={`msg ${m.senderId === currentUserId ? 'msg-sent' : 'msg-received'}`}
            >
              <div className="msg-bubble">
                <div className="msg-sender">
                  {m.senderId === currentUserId ? 'You' : `User ${m.senderId}`}
                </div>
                <div className="msg-content">{m.content}</div>
              </div>
            </div>
          ))}
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <div className="chat-form-inner">
          <input
            type="text"
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            aria-label="Message"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

