'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '@/store/useStore';

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  totalXP: number;
  quizzesCompleted: number;
  longestStreak: number;
}

interface LeaderboardProps {
  currentUser?: UserProfile | null;
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  onBack,
}) => {
  const [apiEntries, setApiEntries] = useState<Omit<LeaderboardEntry, 'rank'>[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const payload = await response.json();
        if (Array.isArray(payload?.entries)) {
          setApiEntries(payload.entries);
        }
      } catch {
        setApiEntries([]);
      }
    };

    loadLeaderboard();
  }, []);

  const rivals: Omit<LeaderboardEntry, 'rank'>[] = [
    { username: 'Sarah', level: 9, totalXP: 9300, quizzesCompleted: 42, longestStreak: 18 },
    { username: 'Alex', level: 8, totalXP: 8100, quizzesCompleted: 37, longestStreak: 14 },
    { username: 'Jordan', level: 7, totalXP: 7600, quizzesCompleted: 35, longestStreak: 16 },
    { username: 'Morgan', level: 7, totalXP: 7050, quizzesCompleted: 30, longestStreak: 12 },
    { username: 'Casey', level: 6, totalXP: 6100, quizzesCompleted: 28, longestStreak: 9 },
    { username: 'Taylor', level: 5, totalXP: 5200, quizzesCompleted: 24, longestStreak: 11 },
    { username: 'Parker', level: 5, totalXP: 4800, quizzesCompleted: 22, longestStreak: 8 },
    { username: 'Riley', level: 4, totalXP: 3900, quizzesCompleted: 18, longestStreak: 7 },
  ];

  const leaderboardData: LeaderboardEntry[] = useMemo(() => {
    const mergedByName = new Map<string, Omit<LeaderboardEntry, 'rank'>>();

    [...rivals, ...apiEntries].forEach((entry) => {
      mergedByName.set(entry.username.trim().toLowerCase(), entry);
    });

    if (currentUser) {
      mergedByName.set(currentUser.username.trim().toLowerCase(), {
        username: currentUser.username,
        level: currentUser.level,
        totalXP: currentUser.totalXP,
        quizzesCompleted: currentUser.quizzesCompleted,
        longestStreak: currentUser.longestStreak,
      });
    }

    return Array.from(mergedByName.values())
      .sort((a, b) => {
        if (b.totalXP !== a.totalXP) {
          return b.totalXP - a.totalXP;
        }
        if (b.quizzesCompleted !== a.quizzesCompleted) {
          return b.quizzesCompleted - a.quizzesCompleted;
        }
        return b.longestStreak - a.longestStreak;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [apiEntries, currentUser]);

  const currentUserRank = currentUser
    ? leaderboardData.findIndex(
        (e) =>
          e.username.trim().toLowerCase() ===
          currentUser.username.trim().toLowerCase()
      ) + 1
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-400">Top Financial Education Masters</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
          >
            Back
          </button>
        </div>

        {/* Current User Info */}
        {currentUser && currentUserRank && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-2 border-blue-600 rounded-xl p-6 mb-8">
            <p className="text-blue-200 text-sm font-semibold mb-2">Your Rank</p>
            <div className="flex justify-between items-center">
              <p className="text-3xl font-bold text-white">#{currentUserRank}</p>
              <p className="text-white">
                {currentUser.username} - Keep grinding to climb! 📈
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => {
            const isCurrentUser =
              !!currentUser &&
              entry.username.trim().toLowerCase() ===
                currentUser.username.trim().toLowerCase();
            const medalIcon =
              entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉';

            return (
              <div
                key={entry.rank}
                className={`rounded-xl p-6 border-2 transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500 shadow-lg shadow-blue-500/30'
                    : index < 3
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600'
                      : 'bg-slate-800/50 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Rank & Name */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`text-3xl font-bold w-12 text-center ${
                        index < 3 ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      {entry.rank <= 3 ? medalIcon : `#${entry.rank}`}
                    </div>
                    <div>
                      <p
                        className={`font-bold text-lg ${
                          isCurrentUser ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {entry.username} {isCurrentUser && '👤'}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-8 flex-wrap justify-end">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Level</p>
                      <p className="text-2xl font-bold text-purple-300">
                        {entry.level}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Total XP</p>
                      <p className="text-2xl font-bold text-blue-300">
                        {Math.round(entry.totalXP / 1000)}k
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Quizzes</p>
                      <p className="text-2xl font-bold text-green-300">
                        {entry.quizzesCompleted}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Streak</p>
                      <p className="text-2xl font-bold text-orange-300">
                        {entry.longestStreak}🔥
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-600">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Lvl</p>
                    <p className="font-bold text-purple-300">{entry.level}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">XP</p>
                    <p className="font-bold text-blue-300">
                      {Math.round(entry.totalXP / 1000)}k
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Quiz</p>
                    <p className="font-bold text-green-300">
                      {entry.quizzesCompleted}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Streak</p>
                    <p className="font-bold text-orange-300">
                      {entry.longestStreak}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-slate-800/50 border-2 border-slate-700 rounded-xl p-6 text-center">
          <p className="text-gray-300 mb-3">
            🎮 Rankings update daily based on XP earned
          </p>
          <p className="text-gray-500 text-sm">
            Complete quizzes, challenges, and maintain streaks to climb the
            leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
};
