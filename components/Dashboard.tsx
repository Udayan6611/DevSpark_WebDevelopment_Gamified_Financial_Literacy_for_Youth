'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ModuleViewer } from './ModuleViewer';
import { Lock, Unlock, CheckCircle, Zap } from 'lucide-react';

type ModuleName = 'budgeting' | 'saving' | 'investing' | 'credit';

interface Module {
  id: ModuleName;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface DashboardProps {
  onChallenge?: (module: ModuleName) => void;
}

const modules: Module[] = [
  {
    id: 'budgeting',
    title: 'Budgeting Basics',
    description: 'Master the fundamentals of budgeting',
    icon: '📊',
    order: 1,
  },
  {
    id: 'saving',
    title: 'Smart Saving',
    description: 'Build your emergency fund and savings habits',
    icon: '💰',
    order: 2,
  },
  {
    id: 'investing',
    title: 'Investment Intro',
    description: 'Learn the basics of investing for wealth',
    icon: '📈',
    order: 3,
  },
  {
    id: 'credit',
    title: 'Credit Mastery',
    description: 'Understand credit scores and debt management',
    icon: '💳',
    order: 4,
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ onChallenge }) => {
  const [activeModule, setActiveModule] = useState<ModuleName | null>(null);
  const moduleProgress = useStore((state) => state.moduleProgress);
  const analytics = useStore((state) => state.analytics);

  if (activeModule) {
    return (
      <ModuleViewer
        moduleName={activeModule}
        onBack={() => setActiveModule(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Your Learning Journey
          </h1>
          <p className="text-gray-400 text-lg">
            Complete modules to unlock new financial skills
          </p>
        </div>

        {/* Challenge CTA */}
        {onChallenge && (
          <div className="mb-12 bg-gradient-to-r from-purple-900 to-pink-900 border-2 border-purple-600 rounded-2xl p-8 text-center shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">
                Want a Challenge?
              </h2>
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <p className="text-purple-200 mb-6">
              Try our AI-generated challenge mode! Unique questions every time
              you play.
            </p>
            <button
              onClick={() => onChallenge('budgeting')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg inline-block"
            >
              🔥 Start Daily Challenge
            </button>
          </div>
        )}

        {/* Learning Path - Visual Graph */}
        <div className="relative mb-16">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 z-0" />

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {modules.map((module) => {
              const status = moduleProgress[module.id];
              const score = analytics[module.id];
              const isLocked = status === 'locked';
              const isUnlocked = status === 'unlocked';
              const isCompleted = status === 'completed';

              return (
                <div key={module.id} className="flex flex-col items-center">
                  <div className="w-full mb-4 space-y-2">
                    <button
                      onClick={() => !isLocked && setActiveModule(module.id)}
                      disabled={isLocked}
                      className={`w-full transition-all transform hover:scale-105 active:scale-95 ${
                        isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div
                        className={`relative w-full aspect-square rounded-2xl border-4 flex flex-col items-center justify-center p-4 transition-all ${
                          isLocked
                            ? 'bg-slate-700 border-slate-600 opacity-60'
                            : isCompleted
                              ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-400 shadow-lg shadow-green-500/50'
                              : 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70'
                        }`}
                      >
                        {/* Icon */}
                        <div className="text-4xl md:text-5xl mb-2">
                          {module.icon}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {isLocked && (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                          {isUnlocked && (
                            <Unlock className="w-5 h-5 text-blue-300" />
                          )}
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-300" />
                          )}
                        </div>

                        {/* Score Display */}
                        {score > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs font-bold text-white">
                            {score}%
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Challenge Button (for unlocked modules) */}
                    {!isLocked && onChallenge && (
                      <button
                        onClick={() => onChallenge(module.id)}
                        className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Challenge
                      </button>
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="text-center w-full">
                    <h3 className="text-lg font-bold text-white">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {module.description}
                    </p>
                    {isLocked && (
                      <p className="text-xs font-semibold text-yellow-400 mt-2">
                        Unlock by scoring 80%+ on previous module
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
          <h3 className="text-white font-bold mb-4">Overall Progress</h3>
          <div className="space-y-3">
            {modules.map((module) => {
              const status = moduleProgress[module.id];
              const progress =
                status === 'locked' ? 0 : status === 'unlocked' ? 50 : 100;

              return (
                <div key={module.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{module.title}</span>
                    <span className="text-blue-400 font-semibold">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status === 'locked'
                          ? 'bg-gray-600 w-0'
                          : status === 'unlocked'
                            ? 'bg-yellow-400 w-1/2'
                            : 'bg-green-400 w-full'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
