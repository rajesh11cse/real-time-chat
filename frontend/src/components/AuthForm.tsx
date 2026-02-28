// AI-generated authentication form component (register/login) using user-service
import React, { useState } from 'react';
import { userClient } from '../apollo/userClient';
import { LOGIN, REGISTER } from '../graphql/user';

type AuthFormProps = {
  onAuthenticated: (params: {
    token: string;
    user: { id: string; username: string; displayName: string };
  }) => void;
};

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        const { data } = await userClient.mutate({
          mutation: REGISTER,
          variables: {
            input: { username, displayName, password },
          },
        });
        const payload = data.register;
        localStorage.setItem('chat_jwt', payload.accessToken);
        onAuthenticated({
          token: payload.accessToken,
          user: payload.user,
        });
      } else {
        const { data } = await userClient.mutate({
          mutation: LOGIN,
          variables: {
            input: { username, password },
          },
        });
        const payload = data.login;
        localStorage.setItem('chat_jwt', payload.accessToken);
        onAuthenticated({
          token: payload.accessToken,
          user: payload.user,
        });
      }
    } catch (e: any) {
      setError(e.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
        </div>
        {mode === 'register' && (
          <div>
            <label>
              Display name
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button
        type="button"
        onClick={() =>
          setMode((prev) => (prev === 'login' ? 'register' : 'login'))
        }
        style={{ marginTop: '1rem' }}
      >
        {mode === 'login'
          ? 'Need an account? Register'
          : 'Already have an account? Login'}
      </button>
    </div>
  );
};

