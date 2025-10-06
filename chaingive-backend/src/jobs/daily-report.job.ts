import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendEmail } from '../services/email.service';

/**
 * Generate and send daily transaction summary
 * Runs: Daily at 8 AM
 * Recipient: Finance team
 */
export async function processDailyReport(job: Job) {
  logger.info('Starting daily report generation...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Gather yesterday's stats
    const [
      newUsers,
      transactions,
      totalVolume,
      escrowsCreated,
      escrowsReleased,
      cyclesCompleted,
      coinsSold,
      redemptions,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.transaction.findMany({
        where: { createdAt: { gte: today, lt: tomorrow } },
        select: { amount: true, status: true, type: true },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { in: ['completed', 'in_transit'] },
        },
      }),
      prisma.escrow.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.escrow.count({
        where: {
          status: 'released',
          releasedAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.cycle.count({
        where: {
          status: 'fulfilled',
          fulfilledAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.coinSaleToUser.aggregate({
        _sum: { quantity: true, totalPrice: true },
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.redemption.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: 'approved',
        },
      }),
    ]);

    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'in_transit').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;

    const estimatedFees = Number(totalVolume._sum.amount || 0) * 0.02;
    const coinRevenue = Number(coinsSold._sum.totalPrice || 0);
    const totalRevenue = estimatedFees + coinRevenue;

    // Generate HTML email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #666; }
          .section { margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Transaction Summary</h1>
            <p>${today.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="section">
            <h2>💰 Revenue</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">₦${totalRevenue.toLocaleString()}</div>
                <div class="stat-label">Total Revenue</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">₦${coinRevenue.toLocaleString()}</div>
                <div class="stat-label">Coin Sales</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>📈 Transactions</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${transactions.length}</div>
                <div class="stat-label">Total Transactions</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">₦${Number(totalVolume._sum.amount || 0).toLocaleString()}</div>
                <div class="stat-label">Transaction Volume</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${completedTransactions}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${pendingTransactions}</div>
                <div class="stat-label">Pending</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>👥 Users & Cycles</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${newUsers}</div>
                <div class="stat-label">New Users</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${cyclesCompleted}</div>
                <div class="stat-label">Cycles Completed</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🔒 Escrow</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${escrowsCreated}</div>
                <div class="stat-label">New Escrows</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${escrowsReleased}</div>
                <div class="stat-label">Released</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🪙 Charity Coins</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${coinsSold._sum.quantity || 0}</div>
                <div class="stat-label">Coins Sold</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${redemptions}</div>
                <div class="stat-label">Items Redeemed</div>
              </div>
            </div>
          </div>

          <div class="section">
            <p style="color: #666; font-size: 12px;">
              Generated automatically by ChainGive Backend<br>
              ${new Date().toISOString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to finance team
    const financeEmail = process.env.FINANCE_EMAIL || 'finance@chaingive.ng';
    await sendEmail(
      financeEmail,
      `Daily Transaction Summary - ${today.toLocaleDateString('en-NG')}`,
      html
    );

    logger.info('Daily report sent successfully');
    return { success: true, date: today };
  } catch (error) {
    logger.error('Daily report generation failed:', error);
    throw error;
  }
}
