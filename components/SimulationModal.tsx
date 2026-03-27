'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const SimulationModal: React.FC = () => {
  const activeLifeEvent = useStore((state) => state.activeLifeEvent);
  const clearLifeEvent = useStore((state) => state.clearLifeEvent);
  const addFunds = useStore((state) => state.addFunds);
  const deductFunds = useStore((state) => state.deductFunds);
  const walletBalance = useStore((state) => state.walletBalance);

  const [isGameOver, setIsGameOver] = React.useState(false);

  const handleAcknowledge = () => {
    if (!activeLifeEvent) return;

    // Apply financial impact
    if (activeLifeEvent.impactType === 'income') {
      addFunds(activeLifeEvent.amount);
    } else {
      deductFunds(Math.abs(activeLifeEvent.amount));
    }

    // Check for game over
    const newBalance = walletBalance + activeLifeEvent.amount;
    if (newBalance < 0) {
      setIsGameOver(true);
    } else {
      clearLifeEvent();
    }
  };

  const handleGameOverReset = () => {
    setIsGameOver(false);
    clearLifeEvent();
  };

  if (isGameOver) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-red-900 to-red-800 border-4 border-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/50">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="w-16 h-16 text-red-300 animate-bounce" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Debt Crisis! 💔
          </h2>

          <p className="text-red-100 text-center mb-6 text-lg">
            Your wallet balance has gone negative. You've accumulated too much
            debt without savings to cover emergencies.
          </p>

          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-center text-sm">
              This is what happens when there's no emergency fund. That's why
              financial literacy and smart budgeting matter!
            </p>
          </div>

          <button
            onClick={handleGameOverReset}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            Try Again - Back to Learning Map
          </button>
        </div>
      </div>
    );
  }

  if (!activeLifeEvent) {
    return null;
  }

  const isIncome = activeLifeEvent.impactType === 'income';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl border-4 p-8 max-w-md w-full shadow-2xl transition-all ${
          isIncome
            ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-400 shadow-green-500/50'
            : 'bg-gradient-to-br from-orange-900 to-orange-800 border-orange-400 shadow-orange-500/50'
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6 text-5xl">
          {activeLifeEvent.title.split(' ')[
            activeLifeEvent.title.split(' ').length - 1
          ]}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3 text-center">
          {activeLifeEvent.title}
        </h2>

        {/* Description */}
        <p className="text-center mb-4 text-gray-100">
          {activeLifeEvent.description}
        </p>

        {/* Amount Impact */}
        <div
          className={`rounded-lg p-4 mb-6 text-center border-2 ${
            isIncome
              ? 'bg-green-900/50 border-green-500 text-green-200'
              : 'bg-orange-900/50 border-orange-500 text-orange-200'
          }`}
        >
          <p className="text-sm font-semibold mb-1">Financial Impact</p>
          <p className="text-2xl font-bold">
            {isIncome ? '+' : ''}${Math.abs(activeLifeEvent.amount)}
          </p>
        </div>

        {/* Message */}
        <p className="text-center text-gray-100 mb-6 text-sm italic border-l-4 border-gray-400 pl-4">
          "{activeLifeEvent.message}"
        </p>

        {/* Action Button */}
        <button
          onClick={handleAcknowledge}
          className={`w-full font-bold py-3 rounded-lg transition-all ${
            isIncome
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};
