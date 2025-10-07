import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import checklistReducer from './slices/checklistSlice';
import agentReducer from './slices/agentSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import walletReducer from './slices/walletSlice';
import donationReducer from './slices/donationSlice';
import coinPurchaseReducer from './slices/coinPurchaseSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import gamificationReducer from './slices/gamificationSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  checklist: checklistReducer,
  agent: agentReducer,
  marketplace: marketplaceReducer,
  wallet: walletReducer,
  donation: donationReducer,
  coinPurchase: coinPurchaseReducer,
  leaderboard: leaderboardReducer,
  gamification: gamificationReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;