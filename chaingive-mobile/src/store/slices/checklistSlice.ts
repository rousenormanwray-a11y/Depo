import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChecklistItem, UserProgress } from '../../types';

// Mock data for development
const mockChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    title: 'Complete Profile Setup',
    description: 'Add your basic information and profile picture',
    completed: false,
    priority: 'high',
    category: 'setup',
    order: 1,
    requiredFor: 'Basic app functionality',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Verify Phone Number',
    description: 'Confirm your phone number with OTP verification',
    completed: false,
    priority: 'high',
    category: 'verification',
    order: 2,
    requiredFor: 'Account security',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Add Bank Account',
    description: 'Link your bank account for deposits and withdrawals',
    completed: false,
    priority: 'high',
    category: 'setup',
    order: 3,
    requiredFor: 'Money transactions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Complete KYC Verification',
    description: 'Upload your ID and complete identity verification',
    completed: false,
    priority: 'medium',
    category: 'verification',
    order: 4,
    requiredFor: 'Higher transaction limits',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Make Your First Donation',
    description: 'Participate in your first donation cycle',
    completed: false,
    priority: 'medium',
    category: 'donation',
    order: 5,
    requiredFor: 'Earning Charity Coins',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Explore Marketplace',
    description: 'Browse and redeem items with Charity Coins',
    completed: false,
    priority: 'low',
    category: 'marketplace',
    order: 6,
    requiredFor: 'Using rewards',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface ChecklistState {
  items: ChecklistItem[];
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChecklistState = {
  items: [],
  userProgress: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchChecklistItems = createAsyncThunk(
  'checklist/fetchItems',
  async (userId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const completedItems = mockChecklistItems.filter(item => item.completed).map(item => item.id);
    const userProgress: UserProgress = {
      userId,
      completedItems,
      currentStep: completedItems.length + 1,
      totalSteps: mockChecklistItems.length,
      completionPercentage: Math.round((completedItems.length / mockChecklistItems.length) * 100),
      updatedAt: new Date().toISOString(),
    };
    
    return {
      items: mockChecklistItems,
      userProgress,
    };
  }
);

export const toggleChecklistItem = createAsyncThunk(
  'checklist/toggleItem',
  async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { itemId, completed };
  }
);

export const updateUserProgress = createAsyncThunk(
  'checklist/updateProgress',
  async (userId: string, { getState }) => {
    const state = getState() as { checklist: ChecklistState };
    const completedItems = state.checklist.items
      .filter(item => item.completed)
      .map(item => item.id);
    
    const userProgress: UserProgress = {
      userId,
      completedItems,
      currentStep: completedItems.length + 1,
      totalSteps: state.checklist.items.length,
      completionPercentage: Math.round((completedItems.length / state.checklist.items.length) * 100),
      updatedAt: new Date().toISOString(),
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return userProgress;
  }
);

const checklistSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetChecklist: (state) => {
      state.items = [];
      state.userProgress = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch checklist items
      .addCase(fetchChecklistItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChecklistItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.userProgress = action.payload.userProgress;
      })
      .addCase(fetchChecklistItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch checklist items';
      })
      
      // Toggle checklist item
      .addCase(toggleChecklistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleChecklistItem.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, completed } = action.payload;
        const item = state.items.find(item => item.id === itemId);
        if (item) {
          item.completed = completed;
          item.updatedAt = new Date().toISOString();
        }
      })
      .addCase(toggleChecklistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update checklist item';
      })
      
      // Update user progress
      .addCase(updateUserProgress.fulfilled, (state, action) => {
        state.userProgress = action.payload;
      });
  },
});

export const { clearError, resetChecklist } = checklistSlice.actions;
export default checklistSlice.reducer;