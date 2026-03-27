'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { LogOut, User, Trophy, Zap } from 'lucide-react';

interface TopNavProps {
  activeTab: 'map' | 'analytics' | 'profile' | 'leaderboard' | 'challenge';
  onTabChange: (tab: 'map' | 'analytics' | 'profile' | 'leaderboard' | 'challenge') => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const walletBalance = useStore((state) => state.walletBalance);
  const user = useStore((state) => state.user);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              FinPath
            </div>
            {user && (
              <div className="hidden sm:flex items-center gap-2 border-l border-slate-600 pl-4">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-gray-300">
                  {user.username}
                </span>
                <span className="bg-purple-600 px-2 py-1 rounded text-xs font-bold text-white">
                  Lvl {user.level}
                </span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="hidden lg:flex gap-1">
            <button
              onClick={() => onTabChange('map')}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'map'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => onTabChange('challenge')}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1 ${
                activeTab === 'challenge'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" /> Challenge
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => onTabChange('leaderboard')}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-1 ${
                activeTab === 'leaderboard'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4" /> Board
            </button>
            <button
              onClick={() => onTabChange('profile')}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'profile'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Profile
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Wallet Balance */}
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400 font-medium">Mock Wallet</p>
              <p
                className={`text-lg font-bold ${
                  walletBalance < 0 ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {formatCurrency(walletBalance)}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex gap-2 pb-4 overflow-x-auto">
          <button
            onClick={() => onTabChange('map')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'map'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => onTabChange('challenge')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'challenge'
                ? 'bg-purple-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            🔥 Challenge
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            🏆
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            👤
          </button>
        </div>
      </div>
    </nav>
  );
};
