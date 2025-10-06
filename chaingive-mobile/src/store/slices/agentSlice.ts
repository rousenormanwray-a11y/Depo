import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent, VerificationRequest } from '../../types';
import { agentAPI } from '../../api/agent';

interface AgentState {
  agent: Agent | null;
  verificationRequests: VerificationRequest[];
  pendingRequests: VerificationRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agent: null,
  verificationRequests: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAgentData = createAsyncThunk(
  'agent/fetchData',
  async (userId: string) => {
    const [dashboardRes, verificationsRes] = await Promise.all([
      agentAPI.getDashboard(),
      agentAPI.getPendingVerifications(),
    ]);
    
    const dashboard = dashboardRes.data;
    const verifications = verificationsRes.data;
    
    return {
      agent: dashboard.agent as Agent,
      verificationRequests: verifications.all || [],
      pendingRequests: verifications.pending || [],
    };
  }
);

export const processVerificationRequest = createAsyncThunk(
  'agent/processVerification',
  async ({ requestId, status, notes }: { 
    requestId: string; 
    status: 'approved' | 'rejected'; 
    notes?: string;
  }) => {
    const res = await agentAPI.processVerification({ requestId, status, notes });
    return res.data;
  }
);

export const logCashDeposit = createAsyncThunk(
  'agent/logCashDeposit',
  async (depositData: {
    userId: string;
    amount: number;
    phoneNumber: string;
    notes?: string;
  }) => {
    const res = await agentAPI.logCashDeposit(depositData);
    return res.data;
  }
);

export const updateAgentLocation = createAsyncThunk(
  'agent/updateLocation',
  async (location: { state: string; city: string; address: string }) => {
    const res = await agentAPI.updateLocation(location);
    return res.data;
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
        state.verificationRequests = action.payload.verificationRequests;
        state.pendingRequests = action.payload.pendingRequests;
      })
      .addCase(fetchAgentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch agent data';
      })
      
      // Process verification request
      .addCase(processVerificationRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(processVerificationRequest.fulfilled, (state, action) => {
        state.loading = false;
        const { requestId, status, notes } = action.payload;
        
        // Update the request in both arrays
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
        
        // Update agent stats
        if (state.agent && status === 'approved') {
          state.agent.totalVerifications += 1;
          state.agent.commissionEarned += 500; // ₦500 per verification
        }
      })
      .addCase(processVerificationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process verification';
      })
      
      // Log cash deposit
      .addCase(logCashDeposit.pending, (state) => {
        state.loading = true;
      })
      .addCase(logCashDeposit.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update agent stats
        if (state.agent) {
          state.agent.totalDeposits += 1;
          state.agent.commissionEarned += action.payload.commission;
        }
      })
      .addCase(logCashDeposit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to log cash deposit';
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