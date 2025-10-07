import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Gamification Admin Controller
 * Allows admins to configure all gamification settings
 */

// ============================================
// CONFIGURATION MANAGEMENT
// ============================================

/**
 * Get current gamification configuration
 */
export async function getConfig(req: Request, res: Response) {
  try {
    let config = await prisma.gamificationConfig.findFirst();
    
    if (!config) {
      // Create default config
      config = await prisma.gamificationConfig.create({
        data: {
          missionsEnabled: true,
          missionBonusReward: 50,
          weekendMultiplier: 1.5,
          streakEnabled: true,
          ringsEnabled: true,
          ringPerfectDayBonus: 100,
          giveGoal: 1,
          earnGoal: 50,
          engageGoal: 3,
          challengesEnabled: true,
          achievementsEnabled: true,
        },
      });
    }
    
    res.json({ config });
  } catch (error: any) {
    logger.error('Error fetching gamification config:', error);
    res.status(500).json({ error: { message: 'Failed to fetch configuration' } });
  }
}

/**
 * Update gamification configuration
 */
export async function updateConfig(req: Request, res: Response) {
  try {
    const {
      missionsEnabled,
      missionBonusReward,
      weekendMultiplier,
      streakEnabled,
      streakRewards,
      ringsEnabled,
      ringPerfectDayBonus,
      giveGoal,
      earnGoal,
      engageGoal,
      challengesEnabled,
      achievementsEnabled,
    } = req.body;
    
    const userId = (req as any).user?.id;
    
    let config = await prisma.gamificationConfig.findFirst();
    
    if (!config) {
      config = await prisma.gamificationConfig.create({
        data: {
          missionsEnabled,
          missionBonusReward,
          weekendMultiplier,
          streakEnabled,
          streakRewards: streakRewards || undefined,
          ringsEnabled,
          ringPerfectDayBonus,
          giveGoal,
          earnGoal,
          engageGoal,
          challengesEnabled,
          achievementsEnabled,
          updatedBy: userId,
        },
      });
    } else {
      config = await prisma.gamificationConfig.update({
        where: { id: config.id },
        data: {
          missionsEnabled,
          missionBonusReward,
          weekendMultiplier,
          streakEnabled,
          streakRewards: streakRewards || undefined,
          ringsEnabled,
          ringPerfectDayBonus,
          giveGoal,
          earnGoal,
          engageGoal,
          challengesEnabled,
          achievementsEnabled,
          updatedBy: userId,
        },
      });
    }
    
    logger.info(`Gamification config updated by admin ${userId}`);
    
    res.json({ 
      message: 'Configuration updated successfully',
      config 
    });
  } catch (error: any) {
    logger.error('Error updating gamification config:', error);
    res.status(500).json({ error: { message: 'Failed to update configuration' } });
  }
}

// ============================================
// MISSION TEMPLATE MANAGEMENT
// ============================================

/**
 * Get all mission templates
 */
export async function getMissionTemplates(req: Request, res: Response) {
  try {
    const templates = await prisma.missionTemplate.findMany({
      orderBy: [
        { isActive: 'desc' },
        { priority: 'desc' },
        { type: 'asc' },
      ],
    });
    
    res.json({ templates });
  } catch (error: any) {
    logger.error('Error fetching mission templates:', error);
    res.status(500).json({ error: { message: 'Failed to fetch templates' } });
  }
}

/**
 * Create mission template
 */
export async function createMissionTemplate(req: Request, res: Response) {
  try {
    const {
      type,
      name,
      description,
      reward,
      icon,
      priority,
      daysOfWeek,
      isActive,
    } = req.body;
    
    const userId = (req as any).user?.id;
    
    const template = await prisma.missionTemplate.create({
      data: {
        type,
        name,
        description,
        reward,
        icon: icon || 'check-circle',
        priority: priority || 0,
        daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        isActive: isActive !== undefined ? isActive : true,
        updatedBy: userId,
      },
    });
    
    logger.info(`Mission template created by admin ${userId}`, { template });
    
    res.status(201).json({ 
      message: 'Mission template created successfully',
      template 
    });
  } catch (error: any) {
    logger.error('Error creating mission template:', error);
    res.status(500).json({ error: { message: 'Failed to create template' } });
  }
}

/**
 * Update mission template
 */
export async function updateMissionTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      reward,
      icon,
      priority,
      daysOfWeek,
      isActive,
    } = req.body;
    
    const userId = (req as any).user?.id;
    
    const template = await prisma.missionTemplate.update({
      where: { id },
      data: {
        name,
        description,
        reward,
        icon,
        priority,
        daysOfWeek,
        isActive,
        updatedBy: userId,
      },
    });
    
    logger.info(`Mission template ${id} updated by admin ${userId}`);
    
    res.json({ 
      message: 'Mission template updated successfully',
      template 
    });
  } catch (error: any) {
    logger.error('Error updating mission template:', error);
    res.status(500).json({ error: { message: 'Failed to update template' } });
  }
}

/**
 * Delete mission template
 */
export async function deleteMissionTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    await prisma.missionTemplate.delete({
      where: { id },
    });
    
    logger.info(`Mission template ${id} deleted by admin ${userId}`);
    
    res.json({ message: 'Mission template deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting mission template:', error);
    res.status(500).json({ error: { message: 'Failed to delete template' } });
  }
}

// ============================================
// WEEKLY CHALLENGE MANAGEMENT
// ============================================

/**
 * Get all weekly challenges
 */
export async function getWeeklyChallenges(req: Request, res: Response) {
  try {
    const challenges = await prisma.weeklyChallenge.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { progress: true },
        },
      },
    });
    
    res.json({ challenges });
  } catch (error: any) {
    logger.error('Error fetching weekly challenges:', error);
    res.status(500).json({ error: { message: 'Failed to fetch challenges' } });
  }
}

/**
 * Create weekly challenge
 */
export async function createWeeklyChallenge(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      type,
      targetValue,
      rewardCoins,
      rewardType,
      rewardValue,
      startDate,
      endDate,
    } = req.body;
    
    const userId = (req as any).user?.id;
    
    const start = new Date(startDate);
    const weekNumber = getWeekNumber(start);
    
    const challenge = await prisma.weeklyChallenge.create({
      data: {
        name,
        description,
        type,
        targetValue,
        rewardCoins,
        rewardType,
        rewardValue,
        startDate: start,
        endDate: new Date(endDate),
        weekNumber,
        createdBy: userId,
      },
    });
    
    logger.info(`Weekly challenge created by admin ${userId}`, { challenge });
    
    res.status(201).json({ 
      message: 'Weekly challenge created successfully',
      challenge 
    });
  } catch (error: any) {
    logger.error('Error creating weekly challenge:', error);
    res.status(500).json({ error: { message: 'Failed to create challenge' } });
  }
}

/**
 * Update weekly challenge
 */
export async function updateWeeklyChallenge(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      targetValue,
      rewardCoins,
      rewardType,
      rewardValue,
      isActive,
    } = req.body;
    
    const challenge = await prisma.weeklyChallenge.update({
      where: { id },
      data: {
        name,
        description,
        targetValue,
        rewardCoins,
        rewardType,
        rewardValue,
        isActive,
      },
    });
    
    logger.info(`Weekly challenge ${id} updated`);
    
    res.json({ 
      message: 'Weekly challenge updated successfully',
      challenge 
    });
  } catch (error: any) {
    logger.error('Error updating weekly challenge:', error);
    res.status(500).json({ error: { message: 'Failed to update challenge' } });
  }
}

// ============================================
// ACHIEVEMENT MANAGEMENT
// ============================================

/**
 * Get all achievements
 */
export async function getAchievements(req: Request, res: Response) {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { category: 'asc' },
        { tier: 'asc' },
      ],
      include: {
        _count: {
          select: { unlocked: true },
        },
      },
    });
    
    res.json({ achievements });
  } catch (error: any) {
    logger.error('Error fetching achievements:', error);
    res.status(500).json({ error: { message: 'Failed to fetch achievements' } });
  }
}

/**
 * Create achievement
 */
export async function createAchievement(req: Request, res: Response) {
  try {
    const {
      code,
      name,
      description,
      category,
      requirementType,
      requirementValue,
      rewardCoins,
      rewardBadge,
      tier,
      icon,
      color,
      isSecret,
    } = req.body;
    
    const userId = (req as any).user?.id;
    
    const achievement = await prisma.achievement.create({
      data: {
        code,
        name,
        description,
        category,
        requirementType,
        requirementValue,
        rewardCoins,
        rewardBadge,
        tier,
        icon,
        color: color || '#FFD700',
        isSecret: isSecret || false,
        createdBy: userId,
      },
    });
    
    logger.info(`Achievement created by admin ${userId}`, { achievement });
    
    res.status(201).json({ 
      message: 'Achievement created successfully',
      achievement 
    });
  } catch (error: any) {
    logger.error('Error creating achievement:', error);
    res.status(500).json({ error: { message: 'Failed to create achievement' } });
  }
}

/**
 * Update achievement
 */
export async function updateAchievement(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      requirementValue,
      rewardCoins,
      icon,
      color,
      isActive,
    } = req.body;
    
    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        name,
        description,
        requirementValue,
        rewardCoins,
        icon,
        color,
        isActive,
      },
    });
    
    logger.info(`Achievement ${id} updated`);
    
    res.json({ 
      message: 'Achievement updated successfully',
      achievement 
    });
  } catch (error: any) {
    logger.error('Error updating achievement:', error);
    res.status(500).json({ error: { message: 'Failed to update achievement' } });
  }
}

// ============================================
// STATISTICS & OVERVIEW
// ============================================

/**
 * Get gamification statistics
 */
export async function getStatistics(req: Request, res: Response) {
  try {
    const [
      totalUsers,
      activeMissions,
      activeStreaks,
      perfectDaysToday,
      activeChallenges,
      totalAchievementsUnlocked,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dailyMission.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.dailyStreak.count({
        where: {
          currentStreak: { gt: 0 },
        },
      }),
      prisma.dailyProgress.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          allRingsClosed: true,
        },
      }),
      prisma.weeklyChallenge.count({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
      prisma.userAchievement.count(),
    ]);
    
    res.json({
      stats: {
        totalUsers,
        activeMissions,
        activeStreaks,
        perfectDaysToday,
        activeChallenges,
        totalAchievementsUnlocked,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching gamification statistics:', error);
    res.status(500).json({ error: { message: 'Failed to fetch statistics' } });
  }
}

/**
 * Get user gamification data
 */
export async function getUserGamificationData(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    const [missions, streak, progress, challenges, achievements, stats] = await Promise.all([
      prisma.dailyMission.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.dailyStreak.findUnique({
        where: { userId },
      }),
      prisma.dailyProgress.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.weeklyChallengeProgress.findMany({
        where: { userId },
        include: { challenge: true },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      }),
      prisma.gamificationStats.findUnique({
        where: { userId },
      }),
    ]);
    
    res.json({
      missions,
      streak,
      progress,
      challenges,
      achievements,
      stats,
    });
  } catch (error: any) {
    logger.error('Error fetching user gamification data:', error);
    res.status(500).json({ error: { message: 'Failed to fetch user data' } });
  }
}

// ============================================
// HELPERS
// ============================================

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
