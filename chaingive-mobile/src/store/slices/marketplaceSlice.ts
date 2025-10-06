import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceItem, Redemption } from '../../types';
import { marketplaceAPI } from '../../api/marketplace';

// Mock marketplace data
const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    vendorId: 'vendor-1',
    name: 'MTN Airtime ₦100',
    description: 'MTN airtime recharge for ₦100',
    category: 'airtime',
    price: 50, // 50 Charity Coins
    originalPrice: 100,
    image: 'https://example.com/mtn-airtime.png',
    inStock: true,
    rating: 4.8,
    reviewCount: 245,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    vendorId: 'vendor-1',
    name: 'Airtel Data 1GB',
    description: '1GB data bundle for Airtel',
    category: 'data',
    price: 75,
    originalPrice: 350,
    image: 'https://example.com/airtel-data.png',
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    vendorId: 'vendor-2',
    name: 'Netflix Gift Card ₦2,500',
    description: 'Netflix gift card worth ₦2,500',
    category: 'vouchers',
    price: 1250,
    originalPrice: 2500,
    image: 'https://example.com/netflix-voucher.png',
    inStock: true,
    rating: 4.9,
    reviewCount: 67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    vendorId: 'vendor-3',
    name: 'Grocery Delivery',
    description: 'Free grocery delivery service',
    category: 'services',
    price: 25,
    image: 'https://example.com/grocery-delivery.png',
    inStock: true,
    rating: 4.4,
    reviewCount: 123,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRedemptions: Redemption[] = [
  {
    id: 'redemption-1',
    userId: '1',
    itemId: '1',
    quantity: 1,
    totalCoins: 50,
    status: 'completed',
    deliveryInfo: {
      phoneNumber: '+2348012345678',
    },
    voucherCode: 'MTN-ABC123',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

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
    try {
      const state = getState() as { marketplace: typeof initialState };
      const category = state.marketplace.selectedCategory || undefined;
      const q = state.marketplace.searchQuery || undefined;
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const res = await marketplaceAPI.getListings({ limit, category, q, page });
      const data: any = res.data;
      return (data?.items || data || mockMarketplaceItems) as MarketplaceItem[];
    } catch (_err) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockMarketplaceItems;
    }
  }
);

export const fetchRedemptions = createAsyncThunk(
  'marketplace/fetchRedemptions',
  async (userId: string) => {
    try {
      const res = await marketplaceAPI.getRedemptions();
      const data: any = res.data;
      return (data?.items || data || mockRedemptions) as Redemption[];
    } catch (_err) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockRedemptions;
    }
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
    try {
      const res = await marketplaceAPI.redeem({
        listingId: redemptionData.itemId,
        quantity: redemptionData.quantity,
        deliveryInfo: redemptionData.deliveryInfo,
      });
      return res.data as Redemption;
    } catch (_err) {
      // Mock fallback
      await new Promise(resolve => setTimeout(resolve, 2000));
      const item = mockMarketplaceItems.find(item => item.id === redemptionData.itemId);
      if (!item) {
        throw new Error('Item not found');
      }
      const totalCoins = item.price * redemptionData.quantity;
      const newRedemption: Redemption = {
        id: 'redemption-' + Date.now(),
        userId: '1',
        itemId: redemptionData.itemId,
        quantity: redemptionData.quantity,
        totalCoins,
        status: 'processing',
        deliveryInfo: redemptionData.deliveryInfo,
        voucherCode:
          item.category === 'airtime' || item.category === 'data'
            ? `${item.name.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newRedemption;
    }
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