import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as leaderboardValidation from '../validations/leaderboard.validation';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

router.use(requireFeature('leaderboard'));

/**
 * @route   GET /v1/leaderboard
 * @desc    Get global leaderboard (top 100)
 * @access  Public
 */
router.get('/', leaderboardController.getLeaderboard);

/**
 * @route   GET /v1/leaderboard/city/:city
 * @desc    Get city-specific leaderboard
 * @access  Public
 */
router.get('/city/:city', leaderboardController.getCityLeaderboard);

/**
 * @route   GET /v1/leaderboard/boosts/available
 * @desc    Get available boost options
 * @access  Public
 */
router.get('/boosts/available', leaderboardController.getBoostOptions);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /v1/leaderboard/me
 * @desc    Get user's leaderboard position
 * @access  Private
 */
router.get('/me', leaderboardController.getMyPosition);

/**
 * @route   POST /v1/leaderboard/boost
 * @desc    Purchase a leaderboard boost
 * @access  Private
 */
router.post(
  '/boost',
  validate(leaderboardValidation.purchaseBoostSchema),
  leaderboardController.purchaseBoost
);

/**
 * @route   GET /v1/leaderboard/boosts/active
 * @desc    Get user's active boosts
 * @access  Private
 */
router.get('/boosts/active', leaderboardController.getActiveBoosts);

export default router;
