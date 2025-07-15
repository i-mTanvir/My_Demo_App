import { supabase, realtimeClient } from '../../config/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Types
interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

interface ChangeHandler<T = any> {
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

// Realtime service class
export class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private isConnected = false;

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Initialize realtime connection
  async initialize(): Promise<void> {
    try {
      // Connect to realtime
      realtimeClient.connect();
      
      // Listen for connection events
      realtimeClient.onOpen(() => {
        this.isConnected = true;
        console.log('Realtime connection established');
      });

      realtimeClient.onClose(() => {
        this.isConnected = false;
        console.log('Realtime connection closed');
      });

      realtimeClient.onError((error) => {
        console.error('Realtime connection error:', error);
      });

    } catch (error) {
      console.error('Failed to initialize realtime service:', error);
    }
  }

  // Subscribe to table changes
  subscribeToTable<T = any>(
    table: string,
    handlers: ChangeHandler<T>,
    filter?: string
  ): string {
    const subscriptionId = `${table}_${Date.now()}`;
    
    try {
      let channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter,
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                handlers.onInsert?.(payload);
                break;
              case 'UPDATE':
                handlers.onUpdate?.(payload);
                break;
              case 'DELETE':
                handlers.onDelete?.(payload);
                break;
            }
          }
        );

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`);
        }
      });

      const subscription: RealtimeSubscription = {
        channel,
        unsubscribe: () => {
          channel.unsubscribe();
          this.subscriptions.delete(subscriptionId);
        },
      };

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;

    } catch (error) {
      console.error(`Failed to subscribe to ${table}:`, error);
      return '';
    }
  }

  // Subscribe to inventory changes
  subscribeToInventory(handlers: ChangeHandler): string {
    return this.subscribeToTable('inventory', handlers);
  }

  // Subscribe to product changes
  subscribeToProducts(handlers: ChangeHandler): string {
    return this.subscribeToTable('products', handlers);
  }

  // Subscribe to sales changes
  subscribeToSales(handlers: ChangeHandler): string {
    return this.subscribeToTable('sales', handlers);
  }

  // Subscribe to low stock alerts
  subscribeToLowStock(handlers: ChangeHandler): string {
    return this.subscribeToTable(
      'inventory',
      handlers,
      'quantity.lt.reorder_point'
    );
  }

  // Subscribe to user presence
  subscribeToPresence(
    channelName: string,
    onJoin?: (key: string, currentPresences: any, newPresences: any) => void,
    onLeave?: (key: string, currentPresences: any, leftPresences: any) => void
  ): string {
    const subscriptionId = `presence_${channelName}_${Date.now()}`;
    
    try {
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: subscriptionId,
          },
        },
      });

      if (onJoin) {
        channel.on('presence', { event: 'join' }, onJoin);
      }

      if (onLeave) {
        channel.on('presence', { event: 'leave' }, onLeave);
      }

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to presence channel: ${channelName}`);
          
          // Track current user presence
          const user = await supabase.auth.getUser();
          if (user.data.user) {
            await channel.track({
              user_id: user.data.user.id,
              email: user.data.user.email,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

      const subscription: RealtimeSubscription = {
        channel,
        unsubscribe: () => {
          channel.unsubscribe();
          this.subscriptions.delete(subscriptionId);
        },
      };

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;

    } catch (error) {
      console.error(`Failed to subscribe to presence channel ${channelName}:`, error);
      return '';
    }
  }

  // Broadcast message to channel
  async broadcast(channelName: string, event: string, payload: any): Promise<void> {
    try {
      const channel = supabase.channel(channelName);
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    } catch (error) {
      console.error(`Failed to broadcast to ${channelName}:`, error);
    }
  }

  // Unsubscribe from specific subscription
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      console.log(`Unsubscribed from ${subscriptionId}`);
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription, id) => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from ${id}`);
    });
    this.subscriptions.clear();
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Disconnect realtime client
  disconnect(): void {
    this.unsubscribeAll();
    realtimeClient.disconnect();
    this.isConnected = false;
  }
}

// Export singleton instance
export const realtimeService = RealtimeService.getInstance();