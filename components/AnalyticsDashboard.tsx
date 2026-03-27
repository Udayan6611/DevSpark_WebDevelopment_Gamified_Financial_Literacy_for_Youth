'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const analytics = useStore((state) => state.analytics);

  // Prepare data for chart
  const chartData = [
    {
      name: 'Budgeting',
      score: analytics.budgeting,
    },
    {
      name: 'Saving',
      score: analytics.saving,
    },
    {
      name: 'Investing',
      score: analytics.investing,
    },
    {
      name: 'Credit',
      score: analytics.credit,
    },
  ];

  // Calculate stats
  const completedModules = Object.values(analytics).filter((v) => v > 0).length;
  const avgScore =
    completedModules > 0
      ? Math.round(
          Object.values(analytics).reduce((a, b) => a + b, 0) / completedModules
        )
      : 0;

  // Find weakest area
  const lowestScore = useMemo(() => {
    let lowest = { module: '', score: 101 };
    Object.entries(analytics).forEach(([key, value]) => {
      if (value > 0 && value < lowest.score) {
        lowest = { module: key, score: value };
      }
    });
    return lowest;
  }, [analytics]);

  // Recommendation engine
  const getRecommendation = () => {
    if (completedModules === 0) {
      return 'Start with Budgeting Basics to begin your financial journey!';
    }

    if (lowestScore.score === 101) {
      return 'Great job completing all modules! Review your weak areas to improve further.';
    }

    const recommendations: Record<string, string> = {
      budgeting:
        'Your budgeting skills need work. Review the 50/30/20 rule and focus on distinguishing needs from wants.',
      saving:
        'Build that emergency fund! Work on establishing consistent saving habits to weather financial storms.',
      investing:
        'Strengthen your investing knowledge. Learn about diversification and compound interest to grow wealth.',
      credit:
        'Credit management is crucial. Review how APR works and the importance of payment history.',
    };

    return (
      recommendations[lowestScore.module] ||
      'Keep practicing to master financial literacy!'
    );
  };

  const hasAnyScore = Object.values(analytics).some((v) => v > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Your Financial Progress
          </h1>
          <p className="text-gray-400 text-lg">
            Track your learning across all modules
          </p>
        </div>

        {!hasAnyScore ? (
          <div className="bg-slate-700/50 border-2 border-slate-600 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No Progress Yet
            </h2>
            <p className="text-gray-400">
              Complete modules from the Learning Map to see your progress here.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Completed Modules */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-600 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-300" />
                  <h3 className="font-semibold text-blue-200">
                    Modules Completed
                  </h3>
                </div>
                <p className="text-4xl font-bold text-blue-300">
                  {completedModules}
                </p>
                <p className="text-sm text-blue-200 mt-2">Out of 4 total</p>
              </div>

              {/* Average Score */}
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-600 rounded-xl p-6">
                <h3 className="font-semibold text-purple-200 mb-3">
                  Average Score
                </h3>
                <p className="text-4xl font-bold text-purple-300">{avgScore}%</p>
                <div className="w-full bg-purple-900 rounded-full h-2 mt-4">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all"
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
              </div>

              {/* Weakest Module */}
              <div className="bg-gradient-to-br from-orange-900 to-orange-800 border-2 border-orange-600 rounded-xl p-6">
                <h3 className="font-semibold text-orange-200 mb-3">
                  Focus Area
                </h3>
                <p className="text-2xl font-bold text-orange-300 capitalize">
                  {lowestScore.module}
                </p>
                <p className="text-sm text-orange-200 mt-2">
                  Score: {lowestScore.score}%
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-700/50 border-2 border-slate-600 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Module Scores
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#9ca3af"
                    label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Personalized Path */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 border-4 border-green-400 rounded-2xl p-8 shadow-lg shadow-green-500/30">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-10 h-10 text-green-300 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-200 mb-2">
                    ✨ Your Personalized Learning Path
                  </h3>
                  <p className="text-green-100 text-lg leading-relaxed">
                    {getRecommendation()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
