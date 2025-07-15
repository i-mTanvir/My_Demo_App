import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  cost: number;
  sku: string;
  barcode: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  category?: {
    name: string;
    code: string;
  };
  inventory?: {
    quantity: number;
    reserved_quantity: number;
  };
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    search: string;
    priceRange: [number, number] | null;
    inStock: boolean | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  selectedProducts: string[];
  sortBy: 'name' | 'price' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    search: '',
    priceRange: null,
    inStock: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  selectedProducts: [],
  sortBy: 'name',
  sortOrder: 'asc',
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priceRange?: [number, number];
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      priceRange,
      inStock,
      sortBy = 'name',
      sortOrder = 'asc'
    } = params;
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name, code),
        inventory:inventory(quantity, reserved_quantity)
      `, { count: 'exact' })
      .eq('is_active', true)
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (priceRange) {
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
    }

    if (inStock !== null) {
      if (inStock) {
        query = query.gt('inventory.quantity', 0);
      } else {
        query = query.eq('inventory.quantity', 0);
      }
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      products: data || [],
      total: count || 0,
      page,
      limit,
    };
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

export const bulkUpdateProducts = createAsyncThunk(
  'products/bulkUpdate',
  async (updates: Array<{ id: string; updates: Partial<Product> }>) => {
    const promises = updates.map(({ id, updates }) =>
      supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    );

    const results = await Promise.all(promises);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} products`);
    }

    return results.map(result => result.data);
  }
);

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<ProductsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSorting: (state, action: PayloadAction<{ sortBy: ProductsState['sortBy']; sortOrder: ProductsState['sortOrder'] }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setSelectedProducts: (state, action: PayloadAction<string[]>) => {
      state.selectedProducts = action.payload;
    },
    toggleProductSelection: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.selectedProducts.indexOf(productId);
      if (index > -1) {
        state.selectedProducts.splice(index, 1);
      } else {
        state.selectedProducts.push(productId);
      }
    },
    clearSelection: (state) => {
      state.selectedProducts = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index > -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        action.payload.forEach(updatedProduct => {
          const index = state.products.findIndex(product => product.id === updatedProduct.id);
          if (index > -1) {
            state.products[index] = updatedProduct;
          }
        });
        state.selectedProducts = [];
      });
  },
});

export const {
  setFilters,
  setPagination,
  setSorting,
  setSelectedProducts,
  toggleProductSelection,
  clearSelection,
  clearError,
} = productsSlice.actions;

export default productsSlice.reducer;