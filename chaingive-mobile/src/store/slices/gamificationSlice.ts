import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as gamificationAPI from '../../api/gamification';
import type {
  DailyMission,
  DailyStreak,
  DailyProgress,
  WeeklyChallengeProgress,
  Achievement,
  UserAchievement,
  GamificationStats,
} from '../../api/gamification';

interface GamificationState {
  // Daily Missions
  todaysMissions: DailyMission | null;
  missionsLoading: boolean;
  missionsError: string | null;
  
  // Streak
  streak: DailyStreak | null;
  streakLoading: boolean;
  streakError: string | null;
  
  // Progress Rings
  todaysProgress: DailyProgress | null;
  progressLoading: boolean;
  progressError: string | null;
  
  // Weekly Challenges
  activeChallenges: WeeklyChallengeProgress[];
  challengesLoading: boolean;
  challengesError: string | null;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: UserAchievement[];
  achievementsLoading: boolean;
  achievementsError: string | null;
  
  // Stats
  stats: GamificationStats | null;
  
  // Dashboard
  dashboardLoading: boolean;
  dashboardError: string | null;
  
  // Recent Rewards
  recentCoinsEarned: number;
  showRewardAnimation: boolean;
}

const initialState: GamificationState = {
  todaysMissions: null,
  missionsLoading: false,
  missionsError: null,
  
  streak: null,
  streakLoading: false,
  streakError: null,
  
  todaysProgress: null,
  progressLoading: false,
  progressError: null,
  
  activeChallenges: [],
  challengesLoading: false,
  challengesError: null,
  
  achievements: [],
  unlockedAchievements: [],
  achievementsLoading: false,
  achievementsError: null,
  
  stats: null,
  
  dashboardLoading: false,
  dashboardError: null,
  
  recentCoinsEarned: 0,
  showRewardAnimation: false,
};

// ============================================
// ASYNC THUNKS
// ============================================

export const fetchTodaysMissions = createAsyncThunk(
  'gamification/fetchTodaysMissions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getTodaysMissions();
      return data.missions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch missions');
    }
  }
);

export const completeMission = createAsyncThunk(
  'gamification/completeMission',
  async (missionType: string, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.completeMission(missionType);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to complete mission');
    }
  }
);

export const fetchStreak = createAsyncThunk(
  'gamification/fetchStreak',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getStreak();
      return data.streak;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch streak');
    }
  }
);

export const fetchTodaysProgress = createAsyncThunk(
  'gamification/fetchTodaysProgress',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getTodaysProgress();
      return data.progress;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch progress');
    }
  }
);

export const fetchActiveChallenges = createAsyncThunk(
  'gamification/fetchActiveChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getChallengeProgress();
      return data.progress;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch challenges');
    }
  }
);

export const fetchAllAchievements = createAsyncThunk(
  'gamification/fetchAllAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getAllAchievements();
      return data.achievements;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchUnlockedAchievements = createAsyncThunk(
  'gamification/fetchUnlockedAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getUnlockedAchievements();
      return data.achievements;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch unlocked achievements');
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'gamification/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationAPI.getDashboard();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch dashboard');
    }
  }
);

// ============================================
// SLICE
// ============================================

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    hideRewardAnimation: (state) => {
      state.showRewardAnimation = false;
      state.recentCoinsEarned = 0;
    },
    
    updateLocalProgress: (state, action: PayloadAction<{ ring: 'give' | 'earn' | 'engage'; value: number }>) => {
      if (state.todaysProgress) {
        const { ring, value } = action.payload;
        if (ring === 'give') {
          state.todaysProgress.giveProgress = Math.min(value, state.todaysProgress.giveGoal);
          state.todaysProgress.giveClosed = value >= state.todaysProgress.giveGoal;
        } else if (ring === 'earn') {
          state.todaysProgress.earnProgress = Math.min(value, state.todaysProgress.earnGoal);
          state.todaysProgress.earnClosed = value >= state.todaysProgress.earnGoal;
        } else if (ring === 'engage') {
          state.todaysProgress.engageProgress = Math.min(value, state.todaysProgress.engageGoal);
          state.todaysProgress.engageClosed = value >= state.todaysProgress.engageGoal;
        }
        
        state.todaysProgress.allRingsClosed =
          state.todaysProgress.giveClosed &&
          state.todaysProgress.earnClosed &&
          state.todaysProgress.engageClosed;
      }
    },
    
    resetGamification: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Today's Missions
    builder
      .addCase(fetchTodaysMissions.pending, (state) => {
        state.missionsLoading = true;
        state.missionsError = null;
      })
      .addCase(fetchTodaysMissions.fulfilled, (state, action) => {
        state.missionsLoading = false;
        state.todaysMissions = action.payload;
      })
      .addCase(fetchTodaysMissions.rejected, (state, action) => {
        state.missionsLoading = false;
        state.missionsError = action.payload as string;
      });
    
    // Complete Mission
    builder
      .addCase(completeMission.fulfilled, (state, action) => {
        state.recentCoinsEarned = action.payload.coinsAwarded;
        state.showRewardAnimation = true;
        // Refresh missions after completion
      });
    
    // Streak
    builder
      .addCase(fetchStreak.pending, (state) => {
        state.streakLoading = true;
        state.streakError = null;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        state.streakLoading = false;
        state.streak = action.payload;
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.streakLoading = false;
        state.streakError = action.payload as string;
      });
    
    // Today's Progress
    builder
      .addCase(fetchTodaysProgress.pending, (state) => {
        state.progressLoading = true;
        state.progressError = null;
      })
      .addCase(fetchTodaysProgress.fulfilled, (state, action) => {
        state.progressLoading = false;
        state.todaysProgress = action.payload;
      })
      .addCase(fetchTodaysProgress.rejected, (state, action) => {
        state.progressLoading = false;
        state.progressError = action.payload as string;
      });
    
    // Active Challenges
    builder
      .addCase(fetchActiveChallenges.pending, (state) => {
        state.challengesLoading = true;
        state.challengesError = null;
      })
      .addCase(fetchActiveChallenges.fulfilled, (state, action) => {
        state.challengesLoading = false;
        state.activeChallenges = action.payload;
      })
      .addCase(fetchActiveChallenges.rejected, (state, action) => {
        state.challengesLoading = false;
        state.challengesError = action.payload as string;
      });
    
    // All Achievements
    builder
      .addCase(fetchAllAchievements.pending, (state) => {
        state.achievementsLoading = true;
        state.achievementsError = null;
      })
      .addCase(fetchAllAchievements.fulfilled, (state, action) => {
        state.achievementsLoading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAllAchievements.rejected, (state, action) => {
        state.achievementsLoading = false;
        state.achievementsError = action.payload as string;
      });
    
    // Unlocked Achievements
    builder
      .addCase(fetchUnlockedAchievements.fulfilled, (state, action) => {
        state.unlockedAchievements = action.payload;
      });
    
    // Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.todaysMissions = action.payload.missions;
        state.streak = action.payload.streak;
        state.todaysProgress = action.payload.progress;
        state.activeChallenges = action.payload.challenges;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload as string;
      });
  },
});

export const { hideRewardAnimation, updateLocalProgress, resetGamification } = gamificationSlice.actions;

export default gamificationSlice.reducer;
