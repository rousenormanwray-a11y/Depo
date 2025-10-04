import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Agent, VerificationRequest } from '../../types';

// Mock data for agent dashboard
const mockAgent: Agent = {
  id: 'agent-1',
  userId: '1',
  agentCode: 'CG001',
  location: {
    state: 'Lagos',
    city: 'Ikeja',
    address: '123 Allen Avenue, Ikeja, Lagos',
  },
  rating: 4.8,
  totalVerifications: 45,
  totalDeposits: 120,
  commissionEarned: 25000,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockVerificationRequests: VerificationRequest[] = [
  {
    id: 'req-1',
    userId: 'user-1',
    agentId: 'agent-1',
    type: 'tier2',
    status: 'pending',
    documents: {
      selfie: 'https://example.com/selfie1.jpg',
      idCard: 'https://example.com/id1.jpg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'req-2',
    userId: 'user-2',
    agentId: 'agent-1',
    type: 'tier3',
    status: 'pending',
    documents: {
      selfie: 'https://example.com/selfie2.jpg',
      idCard: 'https://example.com/id2.jpg',
      utilityBill: 'https://example.com/bill2.jpg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      agent: mockAgent,
      verificationRequests: mockVerificationRequests,
      pendingRequests: mockVerificationRequests.filter(req => req.status === 'pending'),
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { requestId, status, notes };
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const commission = depositData.amount * 0.02; // 2% commission
    
    return {
      depositId: 'deposit-' + Date.now(),
      ...depositData,
      commission,
      timestamp: new Date().toISOString(),
    };
  }
);

export const updateAgentLocation = createAsyncThunk(
  'agent/updateLocation',
  async (location: { state: string; city: string; address: string }) => {
    // Simulate API call
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