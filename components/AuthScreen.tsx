'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { UserProfile } from '@/store/useStore';
import { Trophy, Zap } from 'lucide-react';

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Partial<UserProfile>;
  return (
    typeof maybe.id === 'string' &&
    typeof maybe.username === 'string' &&
    typeof maybe.level === 'number' &&
    typeof maybe.totalXP === 'number'
  );
}

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useStore((state) => state.setUser);

  const handleAuth = async () => {
    setError(null);
    if (!email.trim() || !password.trim() || (mode === 'signup' && !username.trim())) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body = mode === 'signup'
        ? { email: email.trim(), username: username.trim(), password }
        : { email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let payload: { error?: string; user?: unknown } | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const serverError = payload?.error?.trim();
        setError(serverError || `Authentication failed (HTTP ${response.status}).`);
        return;
      }

      if (!payload?.user || !isUserProfile(payload.user)) {
        setError('Authentication succeeded but user data was missing. Please try again.');
        return;
      }

      setUser(payload.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">
            FinPath
          </h1>
          <p className="text-gray-400 text-lg">Master Your Finances, Win the Game</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {mode === 'signup' ? 'Create Account 🎮' : 'Welcome Back 🎮'}
          </h2>

          <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-6">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-semibold ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300'
              }`}
            >
              Log In
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Username Input */}
          {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Choose Your Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={20}
            />
          </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAuth()}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm mb-4">{error}</p>
          )}

          {/* Start Button */}
          <button
            onClick={handleAuth}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all mb-6 ${
              !loading
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>

          {/* Features */}
          <div className="space-y-3 pt-6 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>AI-Generated Questions - Never Same Twice</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span>Climb Leaderboards & Unlock Achievements</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Zap className="w-4 h-4 text-green-400" />
              <span>24/7 Challenges & Daily Streaks</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Account data is stored server-side. Session secured with JWT cookie.
        </p>
      </div>
    </div>
  );
};
