import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';

// Types
interface DashboardMetrics {
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
  activeOrders: number;
  revenueGrowth: number;
  inventoryValue: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    sales: number;
    profit: number;
    percentage: number;
  }>;
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refreshInterval: number;
  widgets: {
    kpiCards: boolean;
    salesChart: boolean;
    categoryChart: boolean;
    recentOrders: boolean;
    lowStockAlerts: boolean;
  };
}

const initialState: DashboardState = {
  metrics: null,
  loading: false,
  error: null,
  lastUpdated: null,
  refreshInterval: 30000, // 30 seconds
  widgets: {
    kpiCards: true,
    salesChart: true,
    categoryChart: true,
    recentOrders: true,
    lowStockAlerts: true,
  },
};

// Async thunks
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async () => {
    // Fetch total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Fetch low stock items
    const { count: lowStockItems } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .lt('quantity', 'reorder_point');

    // Mock data for now - will be replaced with real queries
    const metrics: DashboardMetrics = {
      totalProducts: totalProducts || 0,
      lowStockItems: lowStockItems || 0,
      totalSales: 45678,
      activeOrders: 156,
      revenueGrowth: 18.5,
      inventoryValue: 234567,
      topSellingProducts: [
        { id: '1', name: 'Cotton Fabric', sales: 150, revenue: 15000 },
        { id: '2', name: 'Silk Fabric', sales: 120, revenue: 24000 },
        { id: '3', name: 'Wool Fabric', sales: 100, revenue: 18000 },
      ],
      salesTrend: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 10000) + 5000,
      })),
      categoryPerformance: [
        { category: 'Cotton', sales: 450, profit: 9000, percentage: 35 },
        { category: 'Silk', sales: 320, profit: 12800, percentage: 25 },
        { category: 'Wool', sales: 280, profit: 8400, percentage: 22 },
        { category: 'Synthetic', sales: 230, profit: 4600, percentage: 18 },
      ],
    };

    return metrics;
  }
);

export const refreshDashboard = createAsyncThunk(
  'dashboard/refresh',
  async (_, { dispatch }) => {
    return dispatch(fetchDashboardMetrics());
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    toggleWidget: (state, action: PayloadAction<keyof DashboardState['widgets']>) => {
      state.widgets[action.payload] = !state.widgets[action.payload];
    },
    setWidgetVisibility: (state, action: PayloadAction<{ widget: keyof DashboardState['widgets']; visible: boolean }>) => {
      state.widgets[action.payload.widget] = action.payload.visible;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLastRefresh: (state) => {
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard metrics';
      });
  },
});

export const {
  setRefreshInterval,
  toggleWidget,
  setWidgetVisibility,
  clearError,
  updateLastRefresh,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;