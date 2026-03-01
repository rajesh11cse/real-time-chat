// AI-generated React entrypoint for chat frontend wired to backend GraphQL services
import './index.css';
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
      <div className="app-shell">
        <header className="header">
          <span className="header-user">
            Logged in as <strong>{auth.user.displayName}</strong>
          </span>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <div className="page-center">
          <RoomSelector onRoomSelected={setRoom} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header">
        <span className="header-user">
          Logged in as <strong>{auth.user.displayName}</strong>
        </span>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
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

