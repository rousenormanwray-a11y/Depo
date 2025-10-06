import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaderboardAPI } from '../../api/leaderboard';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  locationCity: string;
  score: number;
  totalDonated: number;
  cyclesCompleted: number;
  charityCoinsBalance: number;
}

interface LeaderboardState {
  globalLeaderboard: LeaderboardEntry[];
  cityLeaderboard: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
  selectedCity: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  globalLeaderboard: [],
  cityLeaderboard: [],
  myRank: null,
  selectedCity: null,
  loading: false,
  error: null,
};

export const fetchGlobalLeaderboard = createAsyncThunk(
  'leaderboard/fetchGlobal',
  async (params?: { limit?: number; offset?: number }) => {
    const res = await leaderboardAPI.getGlobal(params);
    return res.data;
  }
);

export const fetchCityLeaderboard = createAsyncThunk(
  'leaderboard/fetchCity',
  async (city: string) => {
    const res = await leaderboardAPI.getByCity(city);
    return res.data;
  }
);

export const fetchMyRank = createAsyncThunk(
  'leaderboard/fetchMyRank',
  async () => {
    const res = await leaderboardAPI.getMyRank();
    return res.data;
  }
);

export const boostLeaderboard = createAsyncThunk(
  'leaderboard/boost',
  async (data: {
    boostType: 'visibility' | 'multiplier' | 'position';
    coinsToSpend: number;
    duration?: number;
  }) => {
    const res = await leaderboardAPI.boostPosition(data);
    return res.data;
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.globalLeaderboard = action.payload.leaderboard || action.payload || [];
      })
      .addCase(fetchGlobalLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load leaderboard';
      })
      
      .addCase(fetchCityLeaderboard.fulfilled, (state, action) => {
        state.cityLeaderboard = action.payload.leaderboard || action.payload || [];
      })
      
      .addCase(fetchMyRank.fulfilled, (state, action) => {
        state.myRank = action.payload;
      })
      
      .addCase(boostLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(boostLeaderboard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(boostLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to boost position';
      });
  },
});

export const { clearError, setSelectedCity } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
