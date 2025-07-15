import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';
import inventorySlice from './slices/inventorySlice';
import productsSlice from './slices/productsSlice';
import dashboardSlice from './slices/dashboardSlice';

// Persist configuration
const persistConfig = {
  key: 'serrano-tex-ims',
  storage,
  whitelist: ['auth', 'theme'], // Only persist auth and theme
  version: 1,
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  theme: themeSlice,
  inventory: inventorySlice,
  products: productsSlice,
  dashboard: dashboardSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;