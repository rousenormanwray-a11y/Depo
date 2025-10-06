import prisma from '../utils/prisma';
import { checkUserQualifiesForReceipt } from './forceRecycle.service';
import logger from '../utils/logger';

interface MatchPreferences {
  location?: string;
  faith?: string;
}

/**
 * Find best match for a donor
 * Uses algorithm based on:
 * - Trust score
 * - Location proximity
 * - Time waiting
 * - Amount needed
 * - Force recycle qualification (NEW!)
 */
export async function findBestMatch(
  donorId: string,
  amount: number,
  preferences: MatchPreferences = {}
) {
  // Find users who need donations (have pending obligations or are new)
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: donorId },
      isActive: true,
      isBanned: false,
      kycStatus: 'approved',
      ...(preferences.location && {
        locationCity: preferences.location,
      }),
    },
    include: {
      wallet: true,
      cycles: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
    take: 100, // Consider more candidates for force recycle filtering
  });

  if (candidates.length === 0) {
    return null;
  }

  // Filter out users who don't qualify (force recycle check)
  const qualifiedCandidates = [];
  
  for (const candidate of candidates) {
    const qualification = await checkUserQualifiesForReceipt(candidate.id);
    
    if (qualification.qualifies) {
      qualifiedCandidates.push({
        ...candidate,
        qualification,
      });
    } else {
      logger.info(`User ${candidate.id} excluded from matching: ${qualification.reason}`);
    }
  }

  if (qualifiedCandidates.length === 0) {
    logger.warn('No qualified recipients found (all need to complete 2nd donation)');
    return null;
  }

  // Score each qualified candidate
  const scoredCandidates = qualifiedCandidates.map((candidate) => {
    let score = 0;

    // Trust score (0-100 points)
    score += Number(candidate.trustScore) * 20;

    // Has pending obligation (50 points)
    if (candidate.cycles.length > 0) {
      score += 50;
    }

    // Location match (30 points)
    if (preferences.location && candidate.locationCity === preferences.location) {
      score += 30;
    }

    // Time waiting (calculated from oldest cycle)
    if (candidate.cycles.length > 0) {
      const oldestCycle = candidate.cycles[0];
      const daysWaiting = Math.floor(
        (Date.now() - oldestCycle.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.min(daysWaiting * 2, 40); // Up to 40 points
    }

    // Bonus: User has completed many cycles (reliability bonus)
    score += Math.min(candidate.qualification.completedCycles * 5, 30);

    return {
      ...candidate,
      score,
    };
  });

  // Sort by score (highest first)
  scoredCandidates.sort((a, b) => b.score - a.score);

  const bestMatch = scoredCandidates[0];

  // Create match record
  const match = await prisma.match.create({
    data: {
      donorId,
      recipientId: bestMatch.id,
      amount,
      priorityScore: bestMatch.score,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    include: {
      recipient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          locationCity: true,
          trustScore: true,
          totalCyclesCompleted: true,
        },
      },
    },
  });

  logger.info(`Match created: Donor ${donorId} → Recipient ${bestMatch.id} (score: ${bestMatch.score})`);

  return match;
}
