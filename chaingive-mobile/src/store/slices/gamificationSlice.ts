import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import gamificationService, { 
  UserGamification, 
  Quest, 
  XPTransaction,
  LevelUpResponse
} from '../../services/gamificationService';
import streakService, { Streak, StreakCalendarDay } from '../../services/streakService';
import achievementService, { Achievement, UserAchievements } from '../../services/achievementService';

interface GamificationState {
  // User gamification data
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  rank: string;
  title: string;
  
  // Stats
  stats: {
    totalDonations: number;
    totalAmount: number;
    itemsRedeemed: number;
    referrals: number;
    loginStreak: number;
  };
  
  // Streaks
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
  };
  
  // Achievements
  achievements: Achievement[];
  totalAchievementsUnlocked: number;
  totalAchievementsAvailable: number;
  achievementCompletionPercentage: number;
  recentlyUnlockedAchievements: Achievement[];
  
  // Quests
  quests: Quest[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  
  // XP History
  xpHistory: XPTransaction[];
  
  // UI states
  loading: boolean;
  error: string | null;
  showLevelUpModal: boolean;
  levelUpData: LevelUpResponse | null;
  showAchievementModal: boolean;
  newAchievement: Achievement | null;
}

const initialState: GamificationState = {
  level: 1,
  currentXP: 0,
  xpToNextLevel: 100,
  totalXP: 0,
  rank: 'Beginner',
  title: 'New Giver',
  
  stats: {
    totalDonations: 0,
    totalAmount: 0,
    itemsRedeemed: 0,
    referrals: 0,
    loginStreak: 0,
  },
  
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  },
  
  achievements: [],
  totalAchievementsUnlocked: 0,
  totalAchievementsAvailable: 0,
  achievementCompletionPercentage: 0,
  recentlyUnlockedAchievements: [],
  
  quests: [],
  dailyQuests: [],
  weeklyQuests: [],
  
  xpHistory: [],
  
  loading: false,
  error: null,
  showLevelUpModal: false,
  levelUpData: null,
  showAchievementModal: false,
  newAchievement: null,
};

// Async thunks - Gamification
export const fetchUserGamification = createAsyncThunk(
  'gamification/fetchUser',
  async () => {
    const data = await gamificationService.getUserGamification();
    return data;
  }
);

export const addXP = createAsyncThunk(
  'gamification/addXP',
  async ({ amount, reason, source }: { amount: number; reason: string; source?: any }) => {
    const result = await gamificationService.addXP(amount, reason, source);
    return result;
  }
);

export const fetchQuests = createAsyncThunk(
  'gamification/fetchQuests',
  async () => {
    const quests = await gamificationService.getQuests();
    return quests;
  }
);

export const fetchDailyQuests = createAsyncThunk(
  'gamification/fetchDailyQuests',
  async () => {
    const quests = await gamificationService.getDailyQuests();
    return quests;
  }
);

export const completeQuest = createAsyncThunk(
  'gamification/completeQuest',
  async (questId: string) => {
    const result = await gamificationService.completeQuest(questId);
    return result;
  }
);

export const claimDailyReward = createAsyncThunk(
  'gamification/claimDailyReward',
  async () => {
    const result = await gamificationService.claimDailyReward();
    return result;
  }
);

// Async thunks - Streaks
export const fetchStreak = createAsyncThunk(
  'gamification/fetchStreak',
  async () => {
    const streak = await streakService.getCurrentStreak();
    return streak;
  }
);

export const updateLoginStreak = createAsyncThunk(
  'gamification/updateLoginStreak',
  async () => {
    const result = await streakService.updateLoginStreak();
    return result;
  }
);

// Async thunks - Achievements
export const fetchAchievements = createAsyncThunk(
  'gamification/fetchAchievements',
  async () => {
    const achievements = await achievementService.getUserAchievements();
    return achievements;
  }
);

export const unlockAchievement = createAsyncThunk(
  'gamification/unlockAchievement',
  async (achievementId: string) => {
    const result = await achievementService.unlockAchievement(achievementId);
    return result;
  }
);

export const claimAchievement = createAsyncThunk(
  'gamification/claimAchievement',
  async (achievementId: string) => {
    const result = await achievementService.claimAchievement(achievementId);
    return result;
  }
);

// Slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    hideLevelUpModal: (state) => {
      state.showLevelUpModal = false;
      state.levelUpData = null;
    },
    hideAchievementModal: (state) => {
      state.showAchievementModal = false;
      state.newAchievement = null;
    },
    updateStreakLocally: (state, action: PayloadAction<{ currentStreak: number; longestStreak: number }>) => {
      state.streak.currentStreak = action.payload.currentStreak;
      state.streak.longestStreak = action.payload.longestStreak;
      state.stats.loginStreak = action.payload.currentStreak;
    },
  },
  extraReducers: (builder) => {
    // Fetch user gamification
    builder
      .addCase(fetchUserGamification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGamification.fulfilled, (state, action: PayloadAction<UserGamification>) => {
        state.loading = false;
        state.level = action.payload.level;
        state.currentXP = action.payload.currentXP;
        state.xpToNextLevel = action.payload.xpToNextLevel;
        state.totalXP = action.payload.totalXP;
        state.rank = action.payload.rank;
        state.title = action.payload.title;
        state.stats = action.payload.stats;
      })
      .addCase(fetchUserGamification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch gamification data';
      });

    // Add XP
    builder
      .addCase(addXP.fulfilled, (state, action) => {
        state.currentXP = action.payload.newXP;
        state.totalXP = action.payload.totalXP;
        
        if (action.payload.leveledUp && action.payload.newLevel) {
          state.level = action.payload.newLevel;
          state.showLevelUpModal = true;
          state.levelUpData = {
            newLevel: action.payload.newLevel,
            rewards: action.payload.rewards || {},
            nextLevelXP: action.payload.totalXP,
          };
        }
      });

    // Fetch quests
    builder
      .addCase(fetchQuests.fulfilled, (state, action: PayloadAction<Quest[]>) => {
        state.quests = action.payload;
      });

    // Fetch daily quests
    builder
      .addCase(fetchDailyQuests.fulfilled, (state, action: PayloadAction<Quest[]>) => {
        state.dailyQuests = action.payload;
      });

    // Complete quest
    builder
      .addCase(completeQuest.fulfilled, (state, action) => {
        const questIndex = state.quests.findIndex(q => q.id === action.payload.quest.id);
        if (questIndex !== -1) {
          state.quests[questIndex] = action.payload.quest;
        }
        
        // Update XP if leveled up
        if (action.payload.leveledUp && action.payload.newLevel) {
          state.level = action.payload.newLevel;
          state.showLevelUpModal = true;
        }
      });

    // Claim daily reward
    builder
      .addCase(claimDailyReward.fulfilled, (state, action) => {
        if (action.payload.rewards.xp) {
          state.currentXP += action.payload.rewards.xp;
          state.totalXP += action.payload.rewards.xp;
        }
        if (action.payload.rewards.streak) {
          state.stats.loginStreak = action.payload.rewards.streak;
        }
      });

    // Fetch streak
    builder
      .addCase(fetchStreak.fulfilled, (state, action: PayloadAction<Streak>) => {
        state.streak.currentStreak = action.payload.currentStreak;
        state.streak.longestStreak = action.payload.longestStreak;
        state.streak.lastActivityDate = action.payload.lastActivityDate;
        state.stats.loginStreak = action.payload.currentStreak;
      });

    // Update login streak
    builder
      .addCase(updateLoginStreak.fulfilled, (state, action) => {
        state.streak.currentStreak = action.payload.currentStreak;
        state.streak.longestStreak = action.payload.longestStreak;
        state.stats.loginStreak = action.payload.currentStreak;
        
        if (action.payload.reward) {
          state.currentXP += action.payload.reward.xp;
          state.totalXP += action.payload.reward.xp;
        }
      });

    // Fetch achievements
    builder
      .addCase(fetchAchievements.fulfilled, (state, action: PayloadAction<UserAchievements>) => {
        state.achievements = action.payload.achievements;
        state.totalAchievementsUnlocked = action.payload.totalUnlocked;
        state.totalAchievementsAvailable = action.payload.totalAvailable;
        state.achievementCompletionPercentage = action.payload.completionPercentage;
        state.recentlyUnlockedAchievements = action.payload.recentlyUnlocked;
      });

    // Unlock achievement
    builder
      .addCase(unlockAchievement.fulfilled, (state, action) => {
        const achievementIndex = state.achievements.findIndex(a => a.id === action.payload.achievement.id);
        if (achievementIndex !== -1) {
          state.achievements[achievementIndex] = action.payload.achievement;
        } else {
          state.achievements.push(action.payload.achievement);
        }
        
        state.totalAchievementsUnlocked += 1;
        state.showAchievementModal = true;
        state.newAchievement = action.payload.achievement;
        
        if (action.payload.reward.xp) {
          state.currentXP += action.payload.reward.xp;
          state.totalXP += action.payload.reward.xp;
        }
      });
  },
});

export const { 
  clearError, 
  hideLevelUpModal, 
  hideAchievementModal,
  updateStreakLocally,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
