'use client';

import React, { useState, useEffect } from 'react';
import { generateRandomQuiz } from '@/lib/questionGenerator';
import { useStore } from '@/store/useStore';
import { ArrowLeft, CheckCircle, XCircle, Zap } from 'lucide-react';

interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

type ModuleName = 'budgeting' | 'saving' | 'investing' | 'credit';

interface ChallengeProps {
  moduleName: ModuleName;
  onBack: () => void;
}

export const ChallengeMode: React.FC<ChallengeProps> = ({
  moduleName,
  onBack,
}) => {
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [questionSource, setQuestionSource] = useState<'groq' | 'local'>('local');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const addFunds = useStore((state) => state.addFunds);
  const addXP = useStore((state) => state.addXP);
  const updateScore = useStore((state) => state.updateScore);
  const completeModule = useStore((state) => state.completeModule);
  const unlockModule = useStore((state) => state.unlockModule);
  const recordQuizCompletion = useStore((state) => state.recordQuizCompletion);

  // Generate quiz on mount (Groq API first, local fallback)
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/groq-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleName, count: 5 }),
        });

        if (!response.ok) {
          throw new Error('Groq API route failed.');
        }

        const payload = await response.json();
        const apiQuestions = payload?.questions as GeneratedQuestion[] | undefined;

        if (Array.isArray(apiQuestions) && apiQuestions.length >= 3) {
          setQuestions(apiQuestions);
          setQuestionSource('groq');
          return;
        }

        throw new Error('Invalid question payload from API.');
      } catch {
        const generatedQuestions = generateRandomQuiz(moduleName, 5);
        setQuestions(generatedQuestions);
        setQuestionSource('local');
      }
    };

    setQuestions([]);
    loadQuestions();
  }, [moduleName]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white">Generating unique questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswerCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      setShowResult(true);

      if (index === currentQuestion.correctAnswer) {
        setCorrectCount((prev) => prev + 1);
        addFunds(75); // More reward for challenge mode
        addXP(50);
      } else {
        addXP(25);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const scorePercentage = Math.round((correctCount / questions.length) * 100);
      setFinalScore(scorePercentage);

      updateScore(moduleName, scorePercentage);
      completeModule(moduleName);

      recordQuizCompletion('challenge');

      // Treat 80%+ as cleared for progression
      if (scorePercentage >= 80) {
        const moduleOrder: ModuleName[] = ['budgeting', 'saving', 'investing', 'credit'];
        const currentIndex = moduleOrder.indexOf(moduleName);
        if (currentIndex < moduleOrder.length - 1) {
          unlockModule(moduleOrder[currentIndex + 1]);
        }
      }

      setIsComplete(true);
    }
  };

  if (isComplete) {
    const scorePercentage = finalScore ?? Math.round((correctCount / questions.length) * 100);
    const totalReward = correctCount * 75;
    const totalXP = correctCount * 50 + (questions.length - correctCount) * 25;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 border-4 border-purple-400 rounded-2xl p-8 text-center shadow-2xl shadow-purple-500/50">
            <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Challenge Complete! 🎉
            </h2>
            <p className="text-6xl font-bold text-purple-300 mb-4">
              {scorePercentage}%
            </p>

            <div className="bg-purple-900/50 border border-purple-600 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between text-white">
                <span>Correct Answers:</span>
                <span className="font-bold">{correctCount}/{questions.length}</span>
              </div>
              <div className="flex justify-between text-green-300">
                <span>Reward:</span>
                <span className="font-bold">+${totalReward}</span>
              </div>
              <div className="flex justify-between text-blue-300">
                <span>Experience:</span>
                <span className="font-bold">+{totalXP} XP</span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Challenge Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900 to-purple-800 border-2 border-purple-600 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            ⚡ Challenge Mode
          </h2>
          <p className="text-purple-200">
            {questionSource === 'groq'
              ? 'Live Groq-generated questions for this session.'
              : 'Local fallback questions (Groq unavailable).'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="font-semibold text-blue-400">
              {correctCount} correct
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="mb-6 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentQuestion.difficulty === 'easy'
                ? 'bg-green-900 text-green-200'
                : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-900 text-yellow-200'
                  : 'bg-red-900 text-red-200'
            }`}
          >
            {currentQuestion.difficulty.toUpperCase()} DIFFICULTY
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-slate-600 rounded-2xl p-8 mb-8">
          {/* Question Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctAnswer;
              const showCorrectness = showResult && isSelected;

              let buttonClass =
                'w-full p-4 text-left rounded-lg font-semibold transition-all border-2 ';

              if (!showResult) {
                buttonClass +=
                  'bg-slate-600 border-slate-500 text-white hover:bg-slate-500 hover:border-purple-400 cursor-pointer';
              } else if (isCorrectOption) {
                buttonClass +=
                  'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/50';
              } else if (showCorrectness && !isCorrectOption) {
                buttonClass +=
                  'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/50';
              } else {
                buttonClass +=
                  'bg-slate-600 border-slate-500 text-gray-400 opacity-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    {showResult && isCorrectOption && (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    {showResult && showCorrectness && !isCorrectOption && (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div
              className={`rounded-lg p-4 mb-8 border-l-4 ${
                isAnswerCorrect
                  ? 'bg-green-900/30 border-green-500 text-green-200'
                  : 'bg-red-900/30 border-red-500 text-red-200'
              }`}
            >
              <p className="font-semibold mb-2">
                {isAnswerCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </p>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
            >
              {currentQuestionIndex < questions.length - 1
                ? 'Next Question'
                : 'See Results'}
            </button>
          )}
        </div>

        {/* Rewards Preview */}
        {!showResult && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center text-gray-300">
            <p className="text-sm">
              💰 Earn <span className="text-green-400 font-bold">$75</span> +{' '}
              <span className="text-blue-400 font-bold">50 XP</span> for each
              correct answer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
