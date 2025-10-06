import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import walletRoutes from './routes/wallet.routes';
import donationRoutes from './routes/donation.routes';
import cycleRoutes from './routes/cycle.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import agentRoutes from './routes/agent.routes';
import agentCoinRoutes from './routes/agentCoin.routes';
import adminCoinRoutes from './routes/adminCoin.routes';
import matchRoutes from './routes/match.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use(`/${API_VERSION}/auth`, authRoutes);
app.use(`/${API_VERSION}/users`, userRoutes);
app.use(`/${API_VERSION}/wallet`, walletRoutes);
app.use(`/${API_VERSION}/donations`, donationRoutes);
app.use(`/${API_VERSION}/cycles`, cycleRoutes);
app.use(`/${API_VERSION}/marketplace`, marketplaceRoutes);
app.use(`/${API_VERSION}/agents`, agentRoutes);
app.use(`/${API_VERSION}/agents`, agentCoinRoutes); // Agent coin management
app.use(`/${API_VERSION}/admin`, adminCoinRoutes); // Admin coin management
app.use(`/${API_VERSION}/matches`, matchRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 ChainGive API Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Version: ${API_VERSION}`);
  logger.info(`🌍 Health check: http://localhost:${PORT}/health`);
});

export default app;
