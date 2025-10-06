import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent, VerificationRequest } from '../../types';
import { agentService, PendingCoinPurchase } from '../../services/agentService';

interface AgentState {
  agent: any | null;
  verificationRequests: VerificationRequest[];
  pendingRequests: VerificationRequest[];
  pendingCoinRequests: PendingCoinPurchase[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agent: null,
  verificationRequests: [],
  pendingRequests: [],
  pendingCoinRequests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAgentData = createAsyncThunk(
  'agent/fetchData',
  async (userId: string) => {
    const dashboard = await agentService.getDashboard();
    const coinRequests = await agentService.getPendingCoinRequests();
    
    return {
      agent: dashboard,
      pendingCoinRequests: coinRequests.purchases,
    };
  }
);

export const fetchPendingCoinRequests = createAsyncThunk(
  'agent/fetchCoinRequests',
  async () => {
    const response = await agentService.getPendingCoinRequests();
    return response.purchases;
  }
);

export const confirmCoinPayment = createAsyncThunk(
  'agent/confirmPayment',
  async (data: { purchaseId: string; paymentReceived: boolean; notes?: string }) => {
    const response = await agentService.confirmPaymentAndRelease(data);
    return response;
  }
);

export const rejectCoinRequest = createAsyncThunk(
  'agent/rejectRequest',
  async ({ purchaseId, reason }: { purchaseId: string; reason: string }) => {
    const response = await agentService.rejectCoinPurchase(purchaseId, reason);
    return { purchaseId, ...response };
  }
);

export const processVerificationRequest = createAsyncThunk(
  'agent/processVerification',
  async ({ requestId, status, notes }: { 
    requestId: string; 
    status: 'approved' | 'rejected'; 
    notes?: string;
  }) => {
    // TODO: Implement verifyUser API call when endpoint is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { requestId, status, notes };
  }
);

export const updateAgentLocation = createAsyncThunk(
  'agent/updateLocation',
  async (location: { state: string; city: string; address: string }) => {
    // TODO: Implement update location API when endpoint is ready
    await new Promise(resolve => setTimeout(resolve, 800));
    return location;
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateAgentStatus: (state, action: PayloadAction<boolean>) => {
      if (state.agent) {
        state.agent.isActive = action.payload;
      }
    },
    addVerificationRequest: (state, action: PayloadAction<VerificationRequest>) => {
      state.verificationRequests.unshift(action.payload);
      if (action.payload.status === 'pending') {
        state.pendingRequests.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch agent data
      .addCase(fetchAgentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentData.fulfilled, (state, action) => {
        state.loading = false;
        state.agent = action.payload.agent;
        state.pendingCoinRequests = action.payload.pendingCoinRequests;
      })
      .addCase(fetchAgentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agent data';
      })
      
      // Fetch pending coin requests
      .addCase(fetchPendingCoinRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingCoinRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCoinRequests = action.payload;
      })
      .addCase(fetchPendingCoinRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch coin requests';
      })
      
      // Confirm coin payment
      .addCase(confirmCoinPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmCoinPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from pending
        state.pendingCoinRequests = state.pendingCoinRequests.filter(
          req => req.id !== action.payload.purchase.id
        );
        // Update agent stats
        if (state.agent) {
          state.agent.stats = state.agent.stats || {};
          state.agent.stats.totalCommissions = 
            (state.agent.stats.totalCommissions || 0) + action.payload.commission;
        }
      })
      .addCase(confirmCoinPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to confirm payment';
      })
      
      // Reject coin request
      .addCase(rejectCoinRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectCoinRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCoinRequests = state.pendingCoinRequests.filter(
          req => req.id !== action.payload.purchaseId
        );
      })
      .addCase(rejectCoinRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject request';
      })
      
      // Process verification request
      .addCase(processVerificationRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(processVerificationRequest.fulfilled, (state, action) => {
        state.loading = false;
        const { requestId, status, notes } = action.payload;
        
        const updateRequest = (req: VerificationRequest) => {
          if (req.id === requestId) {
            req.status = status;
            req.notes = notes;
            req.updatedAt = new Date().toISOString();
          }
          return req;
        };
        
        state.verificationRequests = state.verificationRequests.map(updateRequest);
        state.pendingRequests = state.pendingRequests.filter(req => req.id !== requestId);
        
        if (state.agent && status === 'approved') {
          state.agent.totalVerifications = (state.agent.totalVerifications || 0) + 1;
        }
      })
      .addCase(processVerificationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process verification';
      })
      
      // Update agent location
      .addCase(updateAgentLocation.fulfilled, (state, action) => {
        if (state.agent) {
          state.agent.location = action.payload;
          state.agent.updatedAt = new Date().toISOString();
        }
      });
  },
});

export const { clearError, updateAgentStatus, addVerificationRequest } = agentSlice.actions;
export default agentSlice.reducer;
