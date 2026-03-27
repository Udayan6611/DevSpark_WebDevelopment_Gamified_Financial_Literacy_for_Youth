import { create } from 'zustand';
import { getAchievementById } from '@/lib/achievements';

export type ModuleStatus = 'locked' | 'unlocked' | 'completed';

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  impactType: 'income' | 'expense';
  amount: number;
  category: string;
  message: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  totalXP: number;
  longestStreak: number;
  currentStreak: number;
  lastActiveDate?: string;
  quizzesCompleted: number;
  challengesCompleted: number;
  achievements: Achievement[];
  createdAt: number;
}

export interface StoreState {
  // User profile
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  updateUserStats: (stats: Partial<UserProfile>) => void;
  recordQuizCompletion: (mode?: 'module' | 'challenge') => void;

  // Game state
  walletBalance: number;
  moduleProgress: {
    budgeting: ModuleStatus;
    saving: ModuleStatus;
    investing: ModuleStatus;
    credit: ModuleStatus;
  };
  analytics: {
    budgeting: number;
    saving: number;
    investing: number;
    credit: number;
  };
  activeLifeEvent: LifeEvent | null;

  // Actions
  addFunds: (amount: number) => void;
  deductFunds: (amount: number) => void;
  unlockModule: (moduleName: 'budgeting' | 'saving' | 'investing' | 'credit') => void;
  completeModule: (moduleName: 'budgeting' | 'saving' | 'investing' | 'credit') => void;
  updateScore: (moduleName: 'budgeting' | 'saving' | 'investing' | 'credit', score: number) => void;
  triggerLifeEvent: (event: LifeEvent) => void;
  clearLifeEvent: () => void;
  checkGameOver: () => boolean;
  addXP: (amount: number) => void;
  unlockAchievement: (achievement: Achievement) => void;
}

const MODULE_KEYS: Array<'budgeting' | 'saving' | 'investing' | 'credit'> = [
  'budgeting',
  'saving',
  'investing',
  'credit',
];

function withUnlockedAchievement(user: UserProfile, achievementId: string): UserProfile {
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    return user;
  }

  if (user.achievements.some((a) => a.id === achievementId)) {
    return user;
  }

  return {
    ...user,
    achievements: [...user.achievements, { ...achievement, unlockedAt: Date.now() }],
  };
}

function evaluateAutomaticAchievements(state: {
  user: UserProfile;
  walletBalance: number;
  moduleProgress: Record<'budgeting' | 'saving' | 'investing' | 'credit', ModuleStatus>;
}): UserProfile {
  let user = state.user;

  if (user.quizzesCompleted >= 1) {
    user = withUnlockedAchievement(user, 'first_quiz');
  }
  if (user.quizzesCompleted >= 25) {
    user = withUnlockedAchievement(user, 'knowledge_seeker');
  }
  if (user.challengesCompleted >= 10) {
    user = withUnlockedAchievement(user, 'challenge_master');
  }
  if (user.currentStreak >= 7) {
    user = withUnlockedAchievement(user, 'streak_7');
  }
  if (user.level >= 5) {
    user = withUnlockedAchievement(user, 'level_5');
  }
  if (state.walletBalance >= 1000) {
    user = withUnlockedAchievement(user, 'wallet_1000');
  }

  const allCompleted = MODULE_KEYS.every(
    (module) => state.moduleProgress[module] === 'completed'
  );
  if (allCompleted) {
    user = withUnlockedAchievement(user, 'module_master');
  }

  return user;
}

export const useStore = create<StoreState>((set) => ({
  // User profile
  user: null,

  setUser: (user) =>
    set((state) => ({
      user: evaluateAutomaticAchievements({
        user: {
          ...user,
          challengesCompleted: user.challengesCompleted ?? 0,
          achievements: user.achievements ?? [],
        },
        walletBalance: state.walletBalance,
        moduleProgress: state.moduleProgress,
      }),
    })),

  logout: () =>
    set({
      user: null,
      walletBalance: 1000,
      moduleProgress: {
        budgeting: 'unlocked',
        saving: 'locked',
        investing: 'locked',
        credit: 'locked',
      },
      analytics: {
        budgeting: 0,
        saving: 0,
        investing: 0,
        credit: 0,
      },
    }),

  updateUserStats: (stats) =>
    set((state) => ({
      user: state.user
        ? evaluateAutomaticAchievements({
            user: { ...state.user, ...stats },
            walletBalance: state.walletBalance,
            moduleProgress: state.moduleProgress,
          })
        : null,
    })),

  recordQuizCompletion: (mode = 'module') =>
    set((state) => {
      if (!state.user) return state;

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(now.getDate() - 1);
      const yesterday = `${yesterdayDate.getFullYear()}-${String(
        yesterdayDate.getMonth() + 1
      ).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

      let nextStreak = state.user.currentStreak;
      if (state.user.lastActiveDate === today) {
        nextStreak = state.user.currentStreak;
      } else if (state.user.lastActiveDate === yesterday) {
        nextStreak = state.user.currentStreak + 1;
      } else {
        nextStreak = 1;
      }

      return {
        user: evaluateAutomaticAchievements({
          user: {
            ...state.user,
            quizzesCompleted: state.user.quizzesCompleted + 1,
            challengesCompleted:
              mode === 'challenge'
                ? (state.user.challengesCompleted ?? 0) + 1
                : state.user.challengesCompleted ?? 0,
            currentStreak: nextStreak,
            longestStreak: Math.max(state.user.longestStreak, nextStreak),
            lastActiveDate: today,
          },
          walletBalance: state.walletBalance,
          moduleProgress: state.moduleProgress,
        }),
      };
    }),

  // Game state
  walletBalance: 1000,
  moduleProgress: {
    budgeting: 'unlocked',
    saving: 'locked',
    investing: 'locked',
    credit: 'locked',
  },
  analytics: {
    budgeting: 0,
    saving: 0,
    investing: 0,
    credit: 0,
  },
  activeLifeEvent: null,

  addFunds: (amount) =>
    set((state) => {
      const nextWalletBalance = state.walletBalance + amount;
      return {
        walletBalance: nextWalletBalance,
        user: state.user
          ? evaluateAutomaticAchievements({
              user: state.user,
              walletBalance: nextWalletBalance,
              moduleProgress: state.moduleProgress,
            })
          : null,
      };
    }),

  deductFunds: (amount) =>
    set((state) => {
      const nextWalletBalance = state.walletBalance - amount;
      return {
        walletBalance: nextWalletBalance,
        user: state.user
          ? evaluateAutomaticAchievements({
              user: state.user,
              walletBalance: nextWalletBalance,
              moduleProgress: state.moduleProgress,
            })
          : null,
      };
    }),

  unlockModule: (moduleName) =>
    set((state) => ({
      moduleProgress: {
        ...state.moduleProgress,
        [moduleName]: 'unlocked',
      },
    })),

  completeModule: (moduleName) =>
    set((state) => {
      const nextModuleProgress = {
        ...state.moduleProgress,
        [moduleName]: 'completed' as ModuleStatus,
      };

      return {
        moduleProgress: nextModuleProgress,
        user: state.user
          ? evaluateAutomaticAchievements({
              user: state.user,
              walletBalance: state.walletBalance,
              moduleProgress: nextModuleProgress,
            })
          : null,
      };
    }),

  updateScore: (moduleName, score) =>
    set((state) => ({
      analytics: {
        ...state.analytics,
        [moduleName]: score,
      },
      user:
        state.user && score === 100
          ? withUnlockedAchievement(
              evaluateAutomaticAchievements({
                user: state.user,
                walletBalance: state.walletBalance,
                moduleProgress: state.moduleProgress,
              }),
              'perfect_score'
            )
          : state.user,
    })),

  triggerLifeEvent: (event) => set({ activeLifeEvent: event }),

  clearLifeEvent: () => set({ activeLifeEvent: null }),

  checkGameOver: () => {
    let isGameOver = false;
    set((state) => {
      if (state.walletBalance < 0) {
        isGameOver = true;
      }
      return state;
    });
    return isGameOver;
  },

  addXP: (amount) =>
    set((state) => {
      if (!state.user) return state;
      const newXP = state.user.totalXP + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return {
        user: evaluateAutomaticAchievements({
          user: {
            ...state.user,
            totalXP: newXP,
            level: newLevel,
          },
          walletBalance: state.walletBalance,
          moduleProgress: state.moduleProgress,
        }),
      };
    }),

  unlockAchievement: (achievement) =>
    set((state) => {
      if (!state.user) return state;
      if (state.user.achievements.find((a) => a.id === achievement.id)) {
        return state;
      }
      return {
        user: {
          ...state.user,
          achievements: [
            ...state.user.achievements,
            { ...achievement, unlockedAt: Date.now() },
          ],
        },
      };
    }),
}));
