import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { donationsAPI } from '../../api/donations';

interface DonationState {
  isProcessing: boolean;
  error: string | null;
}

const initialState: DonationState = {
  isProcessing: false,
  error: null,
};

export const giveDonation = createAsyncThunk(
  'donations/give',
  async (payload: {
    amount: number;
    recipientPreference: 'algorithm' | 'manual';
    recipientId?: string;
    location?: string;
    faith?: string;
  }) => {
    try {
      const res = await donationsAPI.give(payload);
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Failed to initiate donation'));
    }
  }
);

export const confirmReceipt = createAsyncThunk(
  'donations/confirmReceipt',
  async (payload: { transactionId: string; confirm: boolean }) => {
    try {
      const res = await donationsAPI.confirmReceipt(payload);
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Failed to confirm receipt'));
    }
  }
);

const donationSlice = createSlice({
  name: 'donation',
  initialState,
  reducers: {
    clearDonationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(giveDonation.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(giveDonation.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(giveDonation.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to initiate donation';
      })
      .addCase(confirmReceipt.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(confirmReceipt.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(confirmReceipt.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to confirm receipt';
      });
  },
});

export const { clearDonationError } = donationSlice.actions;
export default donationSlice.reducer;
