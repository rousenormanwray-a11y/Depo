import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceItem, Redemption } from '../../types';
import { marketplaceService } from '../../services/marketplaceService';

interface MarketplaceState {
  items: MarketplaceItem[];
  filteredItems: MarketplaceItem[];
  redemptions: Redemption[];
  selectedCategory: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: MarketplaceState = {
  items: [],
  filteredItems: [],
  redemptions: [],
  selectedCategory: null,
  searchQuery: '',
  loading: false,
  error: null,
};

// Async thunks
export const fetchMarketplaceItems = createAsyncThunk(
  'marketplace/fetchItems',
  async (category?: string) => {
    const response = await marketplaceService.getListings(category);
    return response.listings;
  }
);

export const fetchRedemptions = createAsyncThunk(
  'marketplace/fetchRedemptions',
  async () => {
    const response = await marketplaceService.getRedemptions();
    return response.redemptions;
  }
);

export const redeemItem = createAsyncThunk(
  'marketplace/redeemItem',
  async (data: {
    itemId: string;
    quantity?: number;
    deliveryInfo?: any;
  }) => {
    const response = await marketplaceService.redeemItem({
      listingId: data.itemId,
      quantity: data.quantity,
      deliveryInfo: data.deliveryInfo,
    });
    return response.redemption;
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = action.payload
        ? state.items.filter((item) => item.category === action.payload)
        : state.items;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      const query = action.payload.toLowerCase();
      state.filteredItems = state.items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch marketplace items
      .addCase(fetchMarketplaceItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload as any[];
        state.filteredItems = state.selectedCategory
          ? action.payload.filter((item: any) => item.category === state.selectedCategory)
          : action.payload as any[];
      })
      .addCase(fetchMarketplaceItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace items';
      })
      
      // Fetch redemptions
      .addCase(fetchRedemptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRedemptions.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions = action.payload as any[];
      })
      .addCase(fetchRedemptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch redemptions';
      })
      
      // Redeem item
      .addCase(redeemItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemItem.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions.unshift(action.payload as any);
      })
      .addCase(redeemItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to redeem item';
      });
  },
});

export const { setCategory, setSearchQuery, clearError } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
