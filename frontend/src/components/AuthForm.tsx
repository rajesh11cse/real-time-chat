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
    <div className="page-center">
      <div className="card">
        <h2 className="card-title">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-displayName">Display name</label>
              <input
                id="auth-displayName"
                type="text"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others see you"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>
        <div className="auth-toggle">
          <button
            type="button"
            className="btn"
            onClick={() =>
              setMode((prev) => (prev === 'login' ? 'register' : 'login'))
            }
          >
            {mode === 'login'
              ? 'Need an account? Register'
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

