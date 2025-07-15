import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { realtimeService } from '../services/supabase/realtimeService';

// Generic hook for Supabase queries
export const useSupabaseQuery = <T>(
  query: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await query();
        
        if (result.error) {
          setError(result.error.message);
        } else {
          setData(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await query();
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Hook for real-time subscriptions
export const useRealtimeSubscription = <T>(
  table: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void,
  filter?: string
) => {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const id = realtimeService.subscribeToTable(
      table,
      {
        onInsert,
        onUpdate,
        onDelete,
      },
      filter
    );

    setSubscriptionId(id);

    return () => {
      if (id) {
        realtimeService.unsubscribe(id);
      }
    };
  }, [table, filter]);

  return subscriptionId;
};

// Hook for inventory data with real-time updates
export const useInventoryData = (filters?: {
  location?: string;
  lowStock?: boolean;
  search?: string;
}) => {
  const query = async () => {
    let queryBuilder = supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku, price),
        location:locations(name, code)
      `);

    if (filters?.location) {
      queryBuilder = queryBuilder.eq('location_id', filters.location);
    }

    if (filters?.lowStock) {
      queryBuilder = queryBuilder.lt('quantity', 'reorder_point');
    }

    if (filters?.search) {
      queryBuilder = queryBuilder.or(
        `product.name.ilike.%${filters.search}%,product.sku.ilike.%${filters.search}%`
      );
    }

    return queryBuilder;
  };

  const { data, loading, error, refetch } = useSupabaseQuery(
    query,
    [filters?.location, filters?.lowStock, filters?.search]
  );

  // Subscribe to real-time updates
  useRealtimeSubscription(
    'inventory',
    () => refetch(), // Refetch on insert
    () => refetch(), // Refetch on update
    () => refetch()  // Refetch on delete
  );

  return { data, loading, error, refetch };
};

// Hook for product data with real-time updates
export const useProductsData = (filters?: {
  category?: string;
  search?: string;
  inStock?: boolean;
}) => {
  const query = async () => {
    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        category:categories(name, code),
        inventory:inventory(quantity, reserved_quantity)
      `)
      .eq('is_active', true);

    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category_id', filters.category);
    }

    if (filters?.search) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.inStock !== undefined) {
      if (filters.inStock) {
        queryBuilder = queryBuilder.gt('inventory.quantity', 0);
      } else {
        queryBuilder = queryBuilder.eq('inventory.quantity', 0);
      }
    }

    return queryBuilder;
  };

  const { data, loading, error, refetch } = useSupabaseQuery(
    query,
    [filters?.category, filters?.search, filters?.inStock]
  );

  // Subscribe to real-time updates
  useRealtimeSubscription(
    'products',
    () => refetch(),
    () => refetch(),
    () => refetch()
  );

  return { data, loading, error, refetch };
};

// Hook for dashboard metrics
export const useDashboardMetrics = () => {
  const query = async () => {
    // Fetch multiple metrics in parallel
    const [
      productsResult,
      lowStockResult,
      salesResult,
      ordersResult
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('inventory').select('*', { count: 'exact', head: true }).lt('quantity', 'reorder_point'),
      supabase.from('sales').select('total', { count: 'exact' }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    const totalSales = salesResult.data?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;

    return {
      data: {
        totalProducts: productsResult.count || 0,
        lowStockItems: lowStockResult.count || 0,
        totalSales,
        activeOrders: ordersResult.count || 0,
      },
      error: null
    };
  };

  const { data, loading, error, refetch } = useSupabaseQuery(query, []);

  // Subscribe to relevant table changes
  useRealtimeSubscription('products', () => refetch());
  useRealtimeSubscription('inventory', () => refetch());
  useRealtimeSubscription('sales', () => refetch());
  useRealtimeSubscription('orders', () => refetch());

  return { data, loading, error, refetch };
};

// Hook for user presence
export const usePresence = (channelName: string) => {
  const [presences, setPresences] = useState<any[]>([]);

  useEffect(() => {
    const subscriptionId = realtimeService.subscribeToPresence(
      channelName,
      (key, currentPresences, newPresences) => {
        setPresences(Object.values(currentPresences));
      },
      (key, currentPresences, leftPresences) => {
        setPresences(Object.values(currentPresences));
      }
    );

    return () => {
      if (subscriptionId) {
        realtimeService.unsubscribe(subscriptionId);
      }
    };
  }, [channelName]);

  return presences;
};