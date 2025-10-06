import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import gamificationAPI, {
  DailyMissionsResponse,
  DailyStreak,
  DailyProgress,
  WeeklyChallengeProgress,
  Achievement,
  UserAchievement,
  GamificationDashboard,
} from '../../api/gamification';

interface GamificationState {
  // Daily Missions
  missions: DailyMissionsResponse['missions'] | null;
  missionsLoading: boolean;
  missionsError: string | null;
  
  // Streak
  streak: DailyStreak | null;
  streakLoading: boolean;
  streakError: string | null;
  
  // Progress Rings
  progress: DailyProgress | null;
  progressLoading: boolean;
  progressError: string | null;
  
  // Weekly Challenges
  challenges: WeeklyChallengeProgress[];
  challengesLoading: boolean;
  challengesError: string | null;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: UserAchievement[];
  achievementsLoading: boolean;
  achievementsError: string | null;
  
  // Dashboard
  dashboardLoading: boolean;
  dashboardError: string | null;
}

const initialState: GamificationState = {
  missions: null,
  missionsLoading: false,
  missionsError: null,
  
  streak: null,
  streakLoading: false,
  streakError: null,
  
  progress: null,
  progressLoading: false,
  progressError: null,
  
  challenges: [],
  challengesLoading: false,
  challengesError: null,
  
  achievements: [],
  unlockedAchievements: [],
  achievementsLoading: false,
  achievementsError: null,
  
  dashboardLoading: false,
  dashboardError: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

export const fetchTodaysMissions = createAsyncThunk(
  'gamification/fetchTodaysMissions',
  async () => {
    const response = await gamificationAPI.getTodaysMissions();
    return response.missions;
  }
);

export const completeMission = createAsyncThunk(
  'gamification/completeMission',
  async (missionType: string) => {
    const response = await gamificationAPI.completeMission(missionType);
    return response;
  }
);

export const fetchStreak = createAsyncThunk(
  'gamification/fetchStreak',
  async () => {
    const response = await gamificationAPI.getStreak();
    return response.streak;
  }
);

export const fetchTodaysProgress = createAsyncThunk(
  'gamification/fetchTodaysProgress',
  async () => {
    const response = await gamificationAPI.getTodaysProgress();
    return response.progress;
  }
);

export const fetchChallenges = createAsyncThunk(
  'gamification/fetchChallenges',
  async () => {
    const response = await gamificationAPI.getChallengeProgress();
    return response.progress;
  }
);

export const fetchAchievements = createAsyncThunk(
  'gamification/fetchAchievements',
  async () => {
    const [all, unlocked] = await Promise.all([
      gamificationAPI.getAllAchievements(),
      gamificationAPI.getUnlockedAchievements(),
    ]);
    return {
      achievements: all.achievements,
      unlocked: unlocked.achievements,
    };
  }
);

export const fetchDashboard = createAsyncThunk(
  'gamification/fetchDashboard',
  async () => {
    const response = await gamificationAPI.getDashboard();
    return response;
  }
);

// ============================================
// SLICE
// ============================================

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearGamificationErrors: (state) => {
      state.missionsError = null;
      state.streakError = null;
      state.progressError = null;
      state.challengesError = null;
      state.achievementsError = null;
      state.dashboardError = null;
    },
  },
  extraReducers: (builder) => {
    // Missions
    builder.addCase(fetchTodaysMissions.pending, (state) => {
      state.missionsLoading = true;
      state.missionsError = null;
    });
    builder.addCase(fetchTodaysMissions.fulfilled, (state, action) => {
      state.missionsLoading = false;
      state.missions = action.payload;
    });
    builder.addCase(fetchTodaysMissions.rejected, (state, action) => {
      state.missionsLoading = false;
      state.missionsError = action.error.message || 'Failed to fetch missions';
    });
    
    // Complete Mission
    builder.addCase(completeMission.fulfilled, (state, action) => {
      // Refresh missions after completion
      if (state.missions) {
        // Will be refreshed by fetchTodaysMissions
      }
    });
    
    // Streak
    builder.addCase(fetchStreak.pending, (state) => {
      state.streakLoading = true;
      state.streakError = null;
    });
    builder.addCase(fetchStreak.fulfilled, (state, action) => {
      state.streakLoading = false;
      state.streak = action.payload;
    });
    builder.addCase(fetchStreak.rejected, (state, action) => {
      state.streakLoading = false;
      state.streakError = action.error.message || 'Failed to fetch streak';
    });
    
    // Progress
    builder.addCase(fetchTodaysProgress.pending, (state) => {
      state.progressLoading = true;
      state.progressError = null;
    });
    builder.addCase(fetchTodaysProgress.fulfilled, (state, action) => {
      state.progressLoading = false;
      state.progress = action.payload;
    });
    builder.addCase(fetchTodaysProgress.rejected, (state, action) => {
      state.progressLoading = false;
      state.progressError = action.error.message || 'Failed to fetch progress';
    });
    
    // Challenges
    builder.addCase(fetchChallenges.pending, (state) => {
      state.challengesLoading = true;
      state.challengesError = null;
    });
    builder.addCase(fetchChallenges.fulfilled, (state, action) => {
      state.challengesLoading = false;
      state.challenges = action.payload;
    });
    builder.addCase(fetchChallenges.rejected, (state, action) => {
      state.challengesLoading = false;
      state.challengesError = action.error.message || 'Failed to fetch challenges';
    });
    
    // Achievements
    builder.addCase(fetchAchievements.pending, (state) => {
      state.achievementsLoading = true;
      state.achievementsError = null;
    });
    builder.addCase(fetchAchievements.fulfilled, (state, action) => {
      state.achievementsLoading = false;
      state.achievements = action.payload.achievements;
      state.unlockedAchievements = action.payload.unlocked;
    });
    builder.addCase(fetchAchievements.rejected, (state, action) => {
      state.achievementsLoading = false;
      state.achievementsError = action.error.message || 'Failed to fetch achievements';
    });
    
    // Dashboard
    builder.addCase(fetchDashboard.pending, (state) => {
      state.dashboardLoading = true;
      state.dashboardError = null;
    });
    builder.addCase(fetchDashboard.fulfilled, (state, action) => {
      state.dashboardLoading = false;
      state.missions = action.payload.missions;
      state.streak = action.payload.streak;
      state.progress = action.payload.progress;
      state.challenges = action.payload.challenges;
    });
    builder.addCase(fetchDashboard.rejected, (state, action) => {
      state.dashboardLoading = false;
      state.dashboardError = action.error.message || 'Failed to fetch dashboard';
    });
  },
});

export const { clearGamificationErrors } = gamificationSlice.actions;
export default gamificationSlice.reducer;
