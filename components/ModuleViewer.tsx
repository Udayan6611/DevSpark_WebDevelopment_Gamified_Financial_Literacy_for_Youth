'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { quizData } from '@/lib/data/quizData';
import { lifeEvents } from '@/lib/data/lifeEvents';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type ModuleName = 'budgeting' | 'saving' | 'investing' | 'credit';

interface ModuleViewerProps {
  moduleName: ModuleName;
  onBack: () => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({
  moduleName,
  onBack,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const addFunds = useStore((state) => state.addFunds);
  const updateScore = useStore((state) => state.updateScore);
  const unlockModule = useStore((state) => state.unlockModule);
  const completeModule = useStore((state) => state.completeModule);
  const recordQuizCompletion = useStore((state) => state.recordQuizCompletion);
  const triggerLifeEvent = useStore((state) => state.triggerLifeEvent);

  const questions = quizData[moduleName];
  const currentQuestion = questions[currentQuestionIndex];
  const isAnswerCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      setShowResult(true);

      if (index === currentQuestion.correctAnswer) {
        setCorrectCount((prev) => prev + 1);
        addFunds(50);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    setFinalScore(scorePercentage);
    updateScore(moduleName, scorePercentage);
    completeModule(moduleName);

    recordQuizCompletion();

    setIsQuizComplete(true);

    // Unlock next module if score >= 80%
    if (scorePercentage >= 80) {
      const moduleOrder: ModuleName[] = [
        'budgeting',
        'saving',
        'investing',
        'credit',
      ];
      const currentIndex = moduleOrder.indexOf(moduleName);
      if (currentIndex < moduleOrder.length - 1) {
        const nextModule = moduleOrder[currentIndex + 1];
        unlockModule(nextModule);
      }
    }

    // 50% chance to trigger a life event
    if (Math.random() < 0.5) {
      const randomEvent =
        lifeEvents[Math.floor(Math.random() * lifeEvents.length)];
      triggerLifeEvent(randomEvent);
    }
  };

  const handleBackToMap = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setFinalScore(null);
    setIsQuizComplete(false);
    onBack();
  };

  if (isQuizComplete) {
    const scorePercentage = finalScore ?? Math.round((correctCount / questions.length) * 100);
    const isPassed = scorePercentage >= 80;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div
            className={`rounded-2xl border-4 p-8 text-center ${
              isPassed
                ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-400'
                : 'bg-gradient-to-br from-orange-900 to-orange-800 border-orange-400'
            }`}
          >
            {isPassed ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto mb-4 text-orange-400" />
            )}

            <h2
              className={`text-3xl font-bold mb-2 ${
                isPassed ? 'text-green-300' : 'text-orange-300'
              }`}
            >
              {isPassed ? 'Excellent! 🎉' : 'Good Try! 💪'}
            </h2>

            <div className="text-5xl font-bold text-white mb-4">
              {scorePercentage}%
            </div>

            <p className="text-gray-200 mb-6">
              {correctCount} out of {questions.length} questions correct
            </p>

            {isPassed && (
              <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-6 text-green-300 text-sm font-semibold">
                🔓 Next module unlocked! Check the learning map.
              </div>
            )}

            {!isPassed && (
              <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-4 mb-6 text-orange-300 text-sm font-semibold">
                Score 80%+ to unlock the next module.
              </div>
            )}

            <button
              onClick={handleBackToMap}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Back to Map
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
          onClick={handleBackToMap}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Learning Map
        </button>

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
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
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
                  'bg-slate-600 border-slate-500 text-white hover:bg-slate-500 hover:border-blue-400 cursor-pointer';
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
            >
              {currentQuestionIndex < questions.length - 1
                ? 'Next Question'
                : 'See Results'}
            </button>
          )}
        </div>

        {/* Reward Preview */}
        {!showResult && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center text-gray-300">
            <p className="text-sm">
              💰 Earn <span className="text-green-400 font-bold">$50</span> for
              each correct answer
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
