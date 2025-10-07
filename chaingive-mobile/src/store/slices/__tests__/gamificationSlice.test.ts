import gamificationReducer, {
  fetchUserGamification,
  addXP,
  hideLevelUpModal,
  hideAchievementModal,
  updateStreakLocally,
} from '../gamificationSlice';
import { configureStore } from '@reduxjs/toolkit';

describe('gamificationSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        gamification: gamificationReducer,
      },
    });
  });

  it('should return the initial state', () => {
    const state = store.getState().gamification;
    
    expect(state.level).toBe(1);
    expect(state.currentXP).toBe(0);
    expect(state.xpToNextLevel).toBe(100);
    expect(state.totalXP).toBe(0);
    expect(state.rank).toBe('Beginner');
    expect(state.title).toBe('New Giver');
    expect(state.showLevelUpModal).toBe(false);
    expect(state.showAchievementModal).toBe(false);
  });

  it('should handle hideLevelUpModal', () => {
    // First set the modal to show
    const mockData = {
      userId: 'user-1',
      level: 5,
      currentXP: 0,
      xpToNextLevel: 500,
      totalXP: 1500,
      rank: 'Bronze',
      title: 'Generous Giver',
      stats: {
        totalDonations: 10,
        totalAmount: 50000,
        itemsRedeemed: 2,
        referrals: 1,
        loginStreak: 5,
      },
    };
    
    store.dispatch(fetchUserGamification.fulfilled(mockData, '', undefined));
    store.dispatch(hideLevelUpModal());
    
    const state = store.getState().gamification;
    expect(state.showLevelUpModal).toBe(false);
    expect(state.levelUpData).toBe(null);
  });

  it('should handle hideAchievementModal', () => {
    store.dispatch(hideAchievementModal());
    const state = store.getState().gamification;
    
    expect(state.showAchievementModal).toBe(false);
    expect(state.newAchievement).toBe(null);
  });

  it('should handle updateStreakLocally', () => {
    store.dispatch(updateStreakLocally({
      currentStreak: 10,
      longestStreak: 15,
    }));
    
    const state = store.getState().gamification;
    expect(state.streak.currentStreak).toBe(10);
    expect(state.streak.longestStreak).toBe(15);
    expect(state.stats.loginStreak).toBe(10);
  });

  describe('fetchUserGamification', () => {
    it('should handle pending state', () => {
      store.dispatch(fetchUserGamification.pending('', undefined));
      const state = store.getState().gamification;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const mockData = {
        userId: 'user-1',
        level: 5,
        currentXP: 250,
        xpToNextLevel: 500,
        totalXP: 1250,
        rank: 'Bronze',
        title: 'Generous Giver',
        stats: {
          totalDonations: 15,
          totalAmount: 75000,
          itemsRedeemed: 3,
          referrals: 2,
          loginStreak: 7,
        },
      };

      store.dispatch(fetchUserGamification.fulfilled(mockData, '', undefined));
      const state = store.getState().gamification;
      
      expect(state.loading).toBe(false);
      expect(state.level).toBe(5);
      expect(state.currentXP).toBe(250);
      expect(state.rank).toBe('Bronze');
      expect(state.stats.totalDonations).toBe(15);
    });

    it('should handle rejected state', () => {
      const error = new Error('Failed to fetch');
      store.dispatch(fetchUserGamification.rejected(error, '', undefined));
      const state = store.getState().gamification;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('addXP', () => {
    it('should add XP without level up', () => {
      const mockData = {
        newXP: 350,
        totalXP: 1350,
        leveledUp: false,
      };

      store.dispatch(
        addXP.fulfilled(mockData, '', { amount: 100, reason: 'Test', source: 'bonus' })
      );
      const state = store.getState().gamification;
      
      expect(state.currentXP).toBe(350);
      expect(state.totalXP).toBe(1350);
      expect(state.showLevelUpModal).toBe(false);
    });

    it('should add XP with level up', () => {
      const mockData = {
        newXP: 0,
        totalXP: 1500,
        leveledUp: true,
        newLevel: 6,
        rewards: {
          coins: 100,
          badge: 'Level 6 Master',
        },
      };

      store.dispatch(
        addXP.fulfilled(mockData, '', { amount: 500, reason: 'Test', source: 'donation' })
      );
      const state = store.getState().gamification;
      
      expect(state.currentXP).toBe(0);
      expect(state.totalXP).toBe(1500);
      expect(state.level).toBe(6);
      expect(state.showLevelUpModal).toBe(true);
      expect(state.levelUpData).toBeDefined();
      expect(state.levelUpData?.newLevel).toBe(6);
    });
  });
});
