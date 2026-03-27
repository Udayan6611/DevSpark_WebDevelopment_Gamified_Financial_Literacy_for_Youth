'use client';

import React, { useState, useEffect } from 'react';
import { TopNav } from '@/components/TopNav';
import { Dashboard } from '@/components/Dashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SimulationModal } from '@/components/SimulationModal';
import { AuthScreen } from '@/components/AuthScreen';
import { UserDashboard } from '@/components/UserDashboard';
import { Leaderboard } from '@/components/Leaderboard';
import { ChallengeMode } from '@/components/ChallengeMode';
import { useStore, UserProfile } from '@/store/useStore';

type ModuleName = 'budgeting' | 'saving' | 'investing' | 'credit';
type ViewMode = 'auth' | 'home' | 'challenge' | 'challenge_module';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('auth');
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'profile' | 'leaderboard' | 'challenge'>('map');
  const [selectedChallengeModule, setSelectedChallengeModule] = useState<ModuleName | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const logout = useStore((state) => state.logout);
  const walletBalance = useStore((state) => state.walletBalance);
  const moduleProgress = useStore((state) => state.moduleProgress);

  // Load current user from JWT session cookie
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { method: 'GET' });
        const payload = await response.json();
        if (payload?.user) {
          setUser(payload.user as UserProfile);
          setViewMode('home');
        } else {
          setViewMode('auth');
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        setViewMode('auth');
      } finally {
        setLoadingUser(false);
      }
    };

    loadSession();
  }, [setUser]);

  // Auto-transition to home when user logs in
  useEffect(() => {
    if (user && viewMode === 'auth') {
      setViewMode('home');
    }
  }, [user, viewMode]);

  // Keep active user profile synced to server-side storage
  useEffect(() => {
    if (!user) {
      return;
    }

    fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: user }),
    }).catch(() => {
      // Silent fail: local UI still works; server sync retries on next update.
    });
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
      // Ignore network errors and clear local state anyway.
    });
    logout();
    setViewMode('auth');
    setActiveTab('map');
  };

  const handleChallengeSelect = (module: ModuleName) => {
    setSelectedChallengeModule(module);
    setViewMode('challenge_module');
  };

  const handleChallengeComplete = () => {
    setViewMode('home');
    setSelectedChallengeModule(null);
    setActiveTab('map');
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading FinPath...</p>
      </div>
    );
  }

  if (viewMode === 'auth') {
    return <AuthScreen />;
  }

  if (viewMode === 'challenge_module' && selectedChallengeModule) {
    return (
      <>
        <TopNav activeTab="challenge" onTabChange={setActiveTab} onLogout={handleLogout} />
        <ChallengeMode
          moduleName={selectedChallengeModule}
          onBack={handleChallengeComplete}
        />
        <SimulationModal />
      </>
    );
  }

  return (
    <>
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main>
        {activeTab === 'map' && (
          <Dashboard onChallenge={handleChallengeSelect} />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'challenge' && (
          <ChallengeLanding onSelectModule={handleChallengeSelect} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            currentUser={user}
            onBack={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'profile' && user && (
          <UserDashboard
            user={user}
            walletBalance={walletBalance}
            moduleProgress={moduleProgress}
            onMainView={() => setActiveTab('map')}
          />
        )}
      </main>

      <SimulationModal />
    </>
  );
}

// Challenge Landing Component
interface ChallengeLandingProps {
  onSelectModule: (module: ModuleName) => void;
}

const ChallengeLanding: React.FC<ChallengeLandingProps> = ({ onSelectModule }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
            ⚡ Daily Challenges
          </h1>
          <p className="text-gray-400 text-lg">
            Face unique AI-generated questions! Never the same twice.
          </p>
        </div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'budgeting' as ModuleName, title: '📊 Budgeting', color: 'from-blue-600 to-blue-700', borderColor: 'border-blue-400' },
            { name: 'saving' as ModuleName, title: '💰 Saving', color: 'from-green-600 to-green-700', borderColor: 'border-green-400' },
            { name: 'investing' as ModuleName, title: '📈 Investing', color: 'from-purple-600 to-purple-700', borderColor: 'border-purple-400' },
            { name: 'credit' as ModuleName, title: '💳 Credit', color: 'from-orange-600 to-orange-700', borderColor: 'border-orange-400' },
          ].map((challenge) => (
            <button
              key={challenge.name}
              onClick={() => onSelectModule(challenge.name)}
              className={`bg-gradient-to-br ${challenge.color} border-4 ${challenge.borderColor} rounded-2xl p-8 text-center hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105`}
            >
              <div className="text-5xl mb-4">{challenge.title.split(' ')[0]}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {challenge.title}
              </h3>
              <p className="text-gray-100 text-sm mb-6">
                5 AI-generated questions
              </p>
              <div className="w-full bg-white text-gray-900 font-bold py-2 rounded-lg hover:bg-gray-100 transition-all">
                Start Challenge
              </div>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-600 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Challenges?</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Each challenge generates unique questions algorithmically</li>
            <li>✅ Test your knowledge with varied scenarios every time</li>
            <li>✅ Earn extra XP and rewards for challenging yourself</li>
            <li>✅ No two players will see the same questions twice</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
