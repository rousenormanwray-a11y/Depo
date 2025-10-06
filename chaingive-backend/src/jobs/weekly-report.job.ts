import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendEmail } from '../services/email.service';

/**
 * Generate and send weekly growth report
 * Runs: Every Monday at 9 AM
 * Recipient: CEO / Leadership team
 */
export async function processWeeklyReport(job: Job) {
  logger.info('Starting weekly report generation...');

  try {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Gather week's stats
    const [
      newUsers,
      activeUsers,
      totalTransactions,
      totalVolume,
      completedCycles,
      totalRevenue,
      topDonors,
      cityBreakdown,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: lastWeek } },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: lastWeek },
          isActive: true,
        },
      }),
      prisma.transaction.count({
        where: { createdAt: { gte: lastWeek } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: lastWeek },
          status: { in: ['completed', 'in_transit'] },
        },
      }),
      prisma.cycle.count({
        where: {
          status: 'fulfilled',
          fulfilledAt: { gte: lastWeek },
        },
      }),
      prisma.coinSaleToUser.aggregate({
        _sum: { totalPrice: true },
        where: { createdAt: { gte: lastWeek } },
      }),
      prisma.user.findMany({
        where: {
          totalDonated: { gt: 0 },
        },
        select: {
          firstName: true,
          lastName: true,
          totalDonated: true,
          locationCity: true,
        },
        orderBy: { totalDonated: 'desc' },
        take: 5,
      }),
      prisma.user.groupBy({
        by: ['locationCity'],
        where: {
          locationCity: { not: null },
          createdAt: { gte: lastWeek },
        },
        _count: true,
      }),
    ]);

    const estimatedFees = Number(totalVolume._sum.amount || 0) * 0.02;
    const revenue = estimatedFees + Number(totalRevenue._sum.totalPrice || 0);

    // Generate HTML email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
          .section { margin: 30px 0; }
          .top-list { list-style: none; padding: 0; }
          .top-item { background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 6px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Growth Report</h1>
            <p>Week of ${lastWeek.toLocaleDateString('en-NG')} - ${today.toLocaleDateString('en-NG')}</p>
          </div>
          
          <div class="section">
            <h2>🎯 Key Metrics</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${newUsers}</div>
                <div class="stat-label">New Users</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${activeUsers}</div>
                <div class="stat-label">Active Users</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">₦${revenue.toLocaleString()}</div>
                <div class="stat-label">Revenue</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${totalTransactions}</div>
                <div class="stat-label">Transactions</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">₦${Number(totalVolume._sum.amount || 0).toLocaleString()}</div>
                <div class="stat-label">Volume</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${completedCycles}</div>
                <div class="stat-label">Cycles Completed</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🏆 Top Donors (All Time)</h2>
            <ul class="top-list">
              ${topDonors.map((donor, idx) => `
                <li class="top-item">
                  <span>${idx + 1}. ${donor.firstName} ${donor.lastName} (${donor.locationCity || 'N/A'})</span>
                  <strong>₦${Number(donor.totalDonated).toLocaleString()}</strong>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="section">
            <h2>📍 Growth by City</h2>
            <ul class="top-list">
              ${cityBreakdown.slice(0, 5).map((city: any) => `
                <li class="top-item">
                  <span>${city.locationCity || 'Unknown'}</span>
                  <strong>${city._count} new users</strong>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="section">
            <p style="color: #666; font-size: 12px;">
              ChainGive Weekly Report - Confidential<br>
              Generated: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to CEO/Leadership
    const ceoEmail = process.env.CEO_EMAIL || 'ceo@chaingive.ng';
    await sendEmail(
      ceoEmail,
      `Weekly Growth Report - ${today.toLocaleDateString('en-NG')}`,
      html
    );

    logger.info('Weekly report sent successfully');
    return { success: true, date: today };
  } catch (error) {
    logger.error('Weekly report generation failed:', error);
    throw error;
  }
}
