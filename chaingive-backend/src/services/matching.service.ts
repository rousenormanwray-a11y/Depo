import prisma from '../utils/prisma';

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
    take: 50, // Consider top 50 candidates
  });

  if (candidates.length === 0) {
    return null;
  }

  // Score each candidate
  const scoredCandidates = candidates.map((candidate) => {
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
  });

  return match;
}
