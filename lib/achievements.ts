import type { Achievement } from '@/store/useStore';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '⭐',
  },
  {
    id: 'module_master',
    title: 'Module Master',
    description: 'Complete all modules',
    icon: '🏆',
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
  },
  {
    id: 'level_5',
    title: 'Level 5',
    description: 'Reach level 5',
    icon: '⚡',
  },
  {
    id: 'wallet_1000',
    title: 'Millionaire Mindset',
    description: 'Accumulate $1000+ in wallet',
    icon: '💰',
  },
  {
    id: 'challenge_master',
    title: 'Challenge Master',
    description: 'Complete 10 challenges',
    icon: '🎪',
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 25 quizzes',
    icon: '📚',
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
