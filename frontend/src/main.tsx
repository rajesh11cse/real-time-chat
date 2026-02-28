// AI-generated React entrypoint for chat frontend wired to backend GraphQL services
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { chatClient } from './apollo/chatClient';
import { AuthForm } from './components/AuthForm';
import { RoomSelector } from './components/RoomSelector';
import { ChatRoom } from './components/ChatRoom';

type AuthState = {
  token: string;
  user: { id: string; username: string; displayName: string };
} | null;

type RoomState = {
  id: string;
  name: string;
} | null;

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(null);
  const [room, setRoom] = useState<RoomState>(null);

  const handleLogout = () => {
    localStorage.removeItem('chat_jwt');
    setAuth(null);
    setRoom(null);
  };

  if (!auth) {
    return <AuthForm onAuthenticated={setAuth} />;
  }

  if (!room) {
    return (
      <div>
        <div style={{ textAlign: 'right', padding: '1rem' }}>
          Logged in as <strong>{auth.user.displayName}</strong>{' '}
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <RoomSelector onRoomSelected={setRoom} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'right', padding: '1rem' }}>
        Logged in as <strong>{auth.user.displayName}</strong>{' '}
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <ChatRoom
        roomId={room.id}
        roomName={room.name}
        currentUserId={auth.user.id}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={chatClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);

