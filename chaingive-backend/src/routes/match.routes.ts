import { Router } from 'express';
import * as matchController from '../controllers/match.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/matches/pending
 * @desc    Get pending matches for user
 * @access  Private
 */
router.get('/pending', matchController.getPendingMatches);

/**
 * @route   POST /v1/matches/:id/accept
 * @desc    Accept a match
 * @access  Private
 */
router.post('/:id/accept', matchController.acceptMatch);

/**
 * @route   POST /v1/matches/:id/reject
 * @desc    Reject a match
 * @access  Private
 */
router.post('/:id/reject', matchController.rejectMatch);

export default router;
