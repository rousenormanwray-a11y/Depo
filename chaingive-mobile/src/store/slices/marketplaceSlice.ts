import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceItem, Redemption } from '../../types';
import { marketplaceAPI } from '../../api/marketplace';
import { analytics } from '../../services/analyticsService';

interface MarketplaceState {
  items: MarketplaceItem[];
  filteredItems: MarketplaceItem[];
  redemptions: Redemption[];
  selectedCategory: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: MarketplaceState = {
  items: [],
  filteredItems: [],
  redemptions: [],
  selectedCategory: null,
  searchQuery: '',
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Async thunks
export const fetchMarketplaceItems = createAsyncThunk(
  'marketplace/fetchItems',
  async (
    params: { page?: number; limit?: number } | void,
    { getState }
  ) => {
    const state = getState() as { marketplace: typeof initialState };
    const category = state.marketplace.selectedCategory || undefined;
    const q = state.marketplace.searchQuery || undefined;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    
    const res = await marketplaceAPI.getListings({ limit, category, q, page });
    const data = res.data;
    
    return (data?.items || data || []) as MarketplaceItem[];
  }
);

export const fetchRedemptions = createAsyncThunk(
  'marketplace/fetchRedemptions',
  async (userId: string) => {
    const res = await marketplaceAPI.getRedemptions();
    const data = res.data;
    
    return (data?.items || data || []) as Redemption[];
  }
);

export const redeemItem = createAsyncThunk(
  'marketplace/redeemItem',
  async (redemptionData: {
    itemId: string;
    quantity: number;
    deliveryInfo: {
      phoneNumber?: string;
      email?: string;
      address?: string;
    };
  }) => {
    const res = await marketplaceAPI.redeem({
      listingId: redemptionData.itemId,
      quantity: redemptionData.quantity,
      deliveryInfo: redemptionData.deliveryInfo,
    });
    
    analytics.track('redeem_initiated', { 
      itemId: redemptionData.itemId, 
      quantity: redemptionData.quantity 
    });
    
    return res.data as Redemption;
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.page = 1;
      state.filteredItems = filterItems(state.items, action.payload, state.searchQuery);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
      state.filteredItems = filterItems(state.items, state.selectedCategory, action.payload);
    },
    clearFilters: (state) => {
      state.selectedCategory = null;
      state.searchQuery = '';
      state.filteredItems = state.items;
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
        const fetchedItems = action.payload;
        const page = (action.meta.arg as any)?.page ?? 1;
        const limit = (action.meta.arg as any)?.limit ?? 20;
        if (page > 1) {
          state.items = [...state.items, ...fetchedItems];
        } else {
          state.items = fetchedItems;
        }
        state.filteredItems = filterItems(state.items, state.selectedCategory, state.searchQuery);
        state.page = page;
        state.hasMore = fetchedItems.length >= limit;
      })
      .addCase(fetchMarketplaceItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace items';
      })
      
      // Fetch redemptions
      .addCase(fetchRedemptions.fulfilled, (state, action) => {
        state.redemptions = action.payload;
      })
      
      // Redeem item
      .addCase(redeemItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemItem.fulfilled, (state, action) => {
        state.loading = false;
        state.redemptions.unshift(action.payload);
        try {
          analytics.track('redeem_success', { redemptionId: action.payload.id, itemId: action.payload.itemId, quantity: action.payload.quantity });
        } catch {}
      })
      .addCase(redeemItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to redeem item';
        try {
          analytics.track('redeem_failure', { error: state.error });
        } catch {}
      });
  },
});

// Helper function to filter items
const filterItems = (
  items: MarketplaceItem[], 
  category: string | null, 
  searchQuery: string
): MarketplaceItem[] => {
  let filtered = items;
  
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }
  
  return filtered;
};

export const { 
  clearError, 
  setSelectedCategory, 
  setSearchQuery, 
  clearFilters 
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;