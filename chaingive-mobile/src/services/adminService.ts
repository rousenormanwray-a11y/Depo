import apiClient from './api';

export interface AdminMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface AdminQuickStat {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export interface AdminActivity {
  id: string;
  type: 'user' | 'donation' | 'transaction' | 'verification' | 'marketplace';
  user: string;
  action: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface AdminDashboardData {
  metrics: AdminMetric[];
  quickStats: AdminQuickStat[];
  recentActivity: AdminActivity[];
  pendingVerifications: number;
  pendingDisputes: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    activeUsers: number;
  };
}

/**
 * Admin Service
 * Handles admin dashboard and management operations
 */
export const adminService = {
  /**
   * Get comprehensive admin dashboard data
   */
  async getDashboard(): Promise<AdminDashboardData> {
    try {
      const response = await apiClient.get<AdminDashboardData>('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
      throw error;
    }
  },

  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<AdminMetric[]> {
    try {
      const response = await apiClient.get<AdminMetric[]>('/admin/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error);
      throw error;
    }
  },

  /**
   * Get quick stats
   */
  async getQuickStats(): Promise<AdminQuickStat[]> {
    try {
      const response = await apiClient.get<AdminQuickStat[]>('/admin/dashboard/quick-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quick stats:', error);
      throw error;
    }
  },

  /**
   * Get recent activity
   * @param limit - Number of recent activities to fetch
   */
  async getRecentActivity(limit = 20): Promise<AdminActivity[]> {
    try {
      const response = await apiClient.get<AdminActivity[]>('/admin/activity/recent', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      throw error;
    }
  },

  /**
   * Get user management data
   */
  async getUserManagement(filters?: {
    search?: string;
    status?: string;
    tier?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: any[];
    total: number;
    page: number;
  }> {
    try {
      const response = await apiClient.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user management data:', error);
      throw error;
    }
  },

  /**
   * Verify user KYC
   */
  async verifyUserKYC(userId: string, approved: boolean, reason?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/verify-kyc`, {
        approved,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to verify user KYC:', error);
      throw error;
    }
  },

  /**
   * Update user tier
   */
  async updateUserTier(userId: string, tier: string): Promise<{
    success: boolean;
    newTier: string;
  }> {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/tier`, { tier });
      return response.data;
    } catch (error) {
      console.error('Failed to update user tier:', error);
      throw error;
    }
  },

  /**
   * Get transaction monitoring data
   */
  async getTransactionMonitoring(filters?: {
    type?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: any[];
    total: number;
    flagged: number;
  }> {
    try {
      const response = await apiClient.get('/admin/transactions/monitor', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transaction monitoring data:', error);
      throw error;
    }
  },

  /**
   * Flag transaction for review
   */
  async flagTransaction(transactionId: string, reason: string): Promise<{
    success: boolean;
  }> {
    try {
      const response = await apiClient.post(`/admin/transactions/${transactionId}/flag`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to flag transaction:', error);
      throw error;
    }
  },

  /**
   * Get pending disputes
   */
  async getPendingDisputes(): Promise<any[]> {
    try {
      const response = await apiClient.get('/admin/disputes/pending');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending disputes:', error);
      throw error;
    }
  },

  /**
   * Resolve dispute
   */
  async resolveDispute(
    disputeId: string,
    resolution: {
      decision: 'approve' | 'reject' | 'escalate';
      comment: string;
      refundAmount?: number;
    }
  ): Promise<{
    success: boolean;
    dispute: any;
  }> {
    try {
      const response = await apiClient.post(`/admin/disputes/${disputeId}/resolve`, resolution);
      return response.data;
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      throw error;
    }
  },

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    activeUsers: number;
    apiLatency: number;
    databaseStatus: string;
    services: {
      name: string;
      status: 'up' | 'down';
      lastCheck: string;
    }[];
  }> {
    try {
      const response = await apiClient.get('/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  },

  /**
   * Get analytics data
   */
  async getAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<{
    donations: { date: string; count: number; amount: number }[];
    users: { date: string; new: number; active: number }[];
    revenue: { date: string; amount: number }[];
    engagement: {
      dau: number; // Daily Active Users
      mau: number; // Monthly Active Users
      retention: number;
    };
  }> {
    try {
      const response = await apiClient.get('/admin/analytics', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  /**
   * Export data
   */
  async exportData(
    type: 'users' | 'transactions' | 'donations',
    format: 'csv' | 'xlsx' | 'json',
    filters?: Record<string, any>
  ): Promise<Blob> {
    try {
      const response = await apiClient.post(
        '/admin/export',
        { type, format, filters },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  },
};

export default adminService;
