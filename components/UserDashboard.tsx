'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/store/useStore';
import { ACHIEVEMENTS } from '@/lib/achievements';

interface UserDashboardProps {
  user: UserProfile;
  walletBalance: number;
  moduleProgress: Record<string, string>;
  onMainView: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  walletBalance,
  moduleProgress,
  onMainView,
}) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState(
    user.achievements
  );

  useEffect(() => {
    setUnlockedAchievements(user.achievements);
  }, [user.achievements]);

  const progress = Math.round(
    ((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
            <p className="text-gray-400">
              Member since{' '}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onMainView}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
          >
            Back to Learning
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-600 rounded-xl p-6">
            <p className="text-blue-200 text-sm font-semibold mb-2">Level</p>
            <p className="text-4xl font-bold text-blue-300">{user.level}</p>
            <p className="text-blue-300 text-sm mt-2">
              {user.totalXP % 1000} / 1000 XP
            </p>
            <div className="w-full bg-blue-900 rounded-full h-2 mt-3">
              <div
                className="bg-blue-400 h-full rounded-full transition-all"
                style={{ width: `${(user.totalXP % 1000) / 10}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-600 rounded-xl p-6">
            <p className="text-purple-200 text-sm font-semibold mb-2">
              Current Streak
            </p>
            <p className="text-4xl font-bold text-purple-300">
              {user.currentStreak}🔥
            </p>
            <p className="text-purple-300 text-sm mt-2">
              Best: {user.longestStreak}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-600 rounded-xl p-6">
            <p className="text-green-200 text-sm font-semibold mb-2">Quizzes</p>
            <p className="text-4xl font-bold text-green-300">
              {user.quizzesCompleted}
            </p>
            <p className="text-green-300 text-sm mt-2">Total Completed</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-800 border-2 border-orange-600 rounded-xl p-6">
            <p className="text-orange-200 text-sm font-semibold mb-2">
              Achievements
            </p>
            <p className="text-4xl font-bold text-orange-300">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </p>
            <div className="w-full bg-orange-900 rounded-full h-2 mt-3">
              <div
                className="bg-orange-400 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlockedAchievements.some(
                (a) => a.id === achievement.id
              );
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-500 shadow-lg shadow-yellow-500/30'
                      : 'bg-slate-700/50 border-slate-600 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-bold text-white text-sm">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-300 text-xs mt-1">
                    {achievement.description}
                  </p>
                  {isUnlocked && (
                    <p className="text-yellow-300 text-xs font-semibold mt-2">
                      ✓ Unlocked
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="bg-slate-700/50 border-2 border-slate-600 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Learning Progress</h2>
          <div className="space-y-4">
            {Object.entries(moduleProgress).map(([module, status]) => (
              <div key={module}>
                <div className="flex justify-between mb-2">
                  <span className="text-white font-semibold capitalize">
                    {module}
                  </span>
                  <span className={`text-sm font-semibold ${
                    status === 'completed' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {status === 'locked' ? '🔒 Locked' : status === 'unlocked' ? '🔓 Unlocked' : '✅ Completed'}
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === 'completed'
                        ? 'bg-green-500 w-full'
                        : status === 'unlocked'
                          ? 'bg-blue-500 w-1/2'
                          : 'bg-gray-500 w-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
