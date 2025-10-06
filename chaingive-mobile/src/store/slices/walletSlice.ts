import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletAPI } from '../../api/wallet';
import { Transaction } from '../../types';

interface WalletState {
  isProcessing: boolean;
  error: string | null;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  page: number;
  hasMore: boolean;
  selectedTransaction: Transaction | null;
}

const initialState: WalletState = {
  isProcessing: false,
  error: null,
  transactions: [],
  isLoadingTransactions: false,
  page: 1,
  hasMore: true,
  selectedTransaction: null,
};

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (params?: { page?: number; limit?: number }) => {
    try {
      const res = await walletAPI.getTransactions(params ?? { page: 1, limit: 50 });
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Failed to fetch transactions'));
    }
  }
);

export const depositFunds = createAsyncThunk(
  'wallet/depositFunds',
  async (payload: { amount: number; method: string }) => {
    try {
      const res = await walletAPI.deposit({ amount: payload.amount, method: payload.method });
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Deposit failed'));
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'wallet/withdrawFunds',
  async (payload: { amount: number; accountNumber: string; bankCode: string }) => {
    try {
      const res = await walletAPI.withdraw({
        amount: payload.amount,
        accountNumber: payload.accountNumber,
        bankCode: payload.bankCode,
      });
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Withdraw failed'));
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'wallet/fetchTransactionById',
  async (id: string) => {
    const res = await walletAPI.getTransaction(id);
    return res.data as Transaction;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoadingTransactions = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoadingTransactions = false;
        const data: any = action.payload;
        const items: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];
        const page = (action.meta.arg as any)?.page ?? 1;
        const limit = (action.meta.arg as any)?.limit ?? 50;
        if (page > 1) {
          state.transactions = [...state.transactions, ...(items as Transaction[])];
        } else {
          state.transactions = items as Transaction[];
        }
        state.page = page;
        state.hasMore = items.length >= limit;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoadingTransactions = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(depositFunds.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(depositFunds.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Deposit failed';
      })
      .addCase(withdrawFunds.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(withdrawFunds.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Withdraw failed';
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.selectedTransaction = action.payload;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
