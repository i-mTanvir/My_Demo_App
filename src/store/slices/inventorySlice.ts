import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';

// Types
interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  reorder_point: number;
  max_stock: number;
  last_counted: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    sku: string;
    price: number;
  };
  location?: {
    name: string;
    code: string;
  };
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  filters: {
    location: string | null;
    category: string | null;
    lowStock: boolean;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  selectedItems: string[];
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    location: null,
    category: null,
    lowStock: false,
    search: '',
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
  },
  selectedItems: [],
};

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    lowStock?: boolean;
  } = {}) => {
    const { page = 1, limit = 50, search, location, lowStock } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku, price),
        location:locations(name, code)
      `, { count: 'exact' })
      .range(from, to);

    if (search) {
      query = query.or(`product.name.ilike.%${search}%,product.sku.ilike.%${search}%`);
    }

    if (location) {
      query = query.eq('location_id', location);
    }

    if (lowStock) {
      query = query.lt('quantity', 'reorder_point');
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      items: data || [],
      total: count || 0,
      page,
      limit,
    };
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const bulkUpdateInventory = createAsyncThunk(
  'inventory/bulkUpdate',
  async (updates: Array<{ id: string; updates: Partial<InventoryItem> }>) => {
    const promises = updates.map(({ id, updates }) =>
      supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );

    const results = await Promise.all(promises);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} items`);
    }

    return results.map(result => result.data);
  }
);

// Inventory slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<InventoryState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<InventoryState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload;
    },
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(bulkUpdateInventory.fulfilled, (state, action) => {
        action.payload.forEach(updatedItem => {
          const index = state.items.findIndex(item => item.id === updatedItem.id);
          if (index > -1) {
            state.items[index] = { ...state.items[index], ...updatedItem };
          }
        });
        state.selectedItems = [];
      });
  },
});

export const {
  setFilters,
  setPagination,
  setSelectedItems,
  toggleItemSelection,
  clearSelection,
  clearError,
} = inventorySlice.actions;

export default inventorySlice.reducer;