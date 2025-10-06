import client from './client';

/**
 * Gamification API Client
 */

// ============================================
// DAILY MISSIONS
// ============================================

export interface Mission {
  type: string;
  name: string;
  description: string;
  reward: number;
  done: boolean;
  icon: string;
}

export interface DailyMissionsResponse {
  missions: {
    mission1Type: string;
    mission1Name: string;
    mission1Desc: string;
    mission1Done: boolean;
    mission1Reward: number;
    mission2Type: string;
    mission2Name: string;
    mission2Desc: string;
    mission2Done: boolean;
    mission2Reward: number;
    mission3Type: string;
    mission3Name: string;
    mission3Desc: string;
    mission3Done: boolean;
    mission3Reward: number;
    allCompleted: boolean;
    bonusReward: number;
    totalCoinsEarned: number;
  };
}

export const getTodaysMissions = async (): Promise<DailyMissionsResponse> => {
  const response = await client.get('/gamification/missions/today');
  return response.data;
};

export const completeMission = async (missionType: string) => {
  const response = await client.post('/gamification/missions/complete', {
    missionType,
  });
  return response.data;
};

// ============================================
// DAILY STREAK
// ============================================

export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  totalCoinsEarned: number;
  streakLevel: string;
  milestones: number[];
}

export const getStreak = async (): Promise<{ streak: DailyStreak }> => {
  const response = await client.get('/gamification/streak');
  return response.data;
};

// ============================================
// PROGRESS RINGS
// ============================================

export interface DailyProgress {
  date: string;
  giveGoal: number;
  giveProgress: number;
  giveClosed: boolean;
  earnGoal: number;
  earnProgress: number;
  earnClosed: boolean;
  engageGoal: number;
  engageProgress: number;
  engageClosed: boolean;
  allRingsClosed: boolean;
  bonusAwarded: boolean;
  bonusAmount: number;
}

export const getTodaysProgress = async (): Promise<{ progress: DailyProgress }> => {
  const response = await client.get('/gamification/progress/today');
  return response.data;
};

export const updateRingProgress = async (ringType: 'give' | 'earn' | 'engage', incrementBy: number) => {
  const response = await client.post('/gamification/progress/update', {
    ringType,
    incrementBy,
  });
  return response.data;
};

// ============================================
// WEEKLY CHALLENGES
// ============================================

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  rewardCoins: number;
  rewardType: string | null;
  rewardValue: string | null;
  startDate: string;
  endDate: string;
  weekNumber: number;
  isActive: boolean;
}

export interface WeeklyChallengeProgress {
  id: string;
  challengeId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  completed: boolean;
  completedAt: string | null;
  rewardClaimed: boolean;
  challenge: WeeklyChallenge;
}

export const getActiveChallenges = async (): Promise<{ challenges: WeeklyChallenge[] }> => {
  const response = await client.get('/gamification/challenges/active');
  return response.data;
};

export const getChallengeProgress = async (): Promise<{ progress: WeeklyChallengeProgress[] }> => {
  const response = await client.get('/gamification/challenges/my-progress');
  return response.data;
};

// ============================================
// ACHIEVEMENTS
// ============================================

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  requirementType: string;
  requirementValue: number;
  rewardCoins: number;
  rewardBadge: string | null;
  tier: string;
  icon: string;
  color: string;
  isSecret: boolean;
  isUnlocked?: boolean;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  maxProgress: number;
  isNew: boolean;
  viewedAt: string | null;
  achievement: Achievement;
}

export const getAllAchievements = async (): Promise<{ achievements: Achievement[] }> => {
  const response = await client.get('/gamification/achievements');
  return response.data;
};

export const getUnlockedAchievements = async (): Promise<{ achievements: UserAchievement[] }> => {
  const response = await client.get('/gamification/achievements/unlocked');
  return response.data;
};

// ============================================
// DASHBOARD
// ============================================

export interface GamificationDashboard {
  missions: DailyMissionsResponse['missions'];
  streak: DailyStreak | null;
  progress: DailyProgress | null;
  challenges: WeeklyChallengeProgress[];
  totalAchievements: number;
  stats: {
    totalCoinsEarned: number;
    totalMissionsCompleted: number;
    totalPerfectDays: number;
    totalAchievements: number;
  } | null;
}

export const getDashboard = async (): Promise<GamificationDashboard> => {
  const response = await client.get('/gamification/dashboard');
  return response.data;
};

export default {
  getTodaysMissions,
  completeMission,
  getStreak,
  getTodaysProgress,
  updateRingProgress,
  getActiveChallenges,
  getChallengeProgress,
  getAllAchievements,
  getUnlockedAchievements,
  getDashboard,
};
