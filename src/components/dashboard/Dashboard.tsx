import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchDashboardMetrics } from '../../store/slices/dashboardSlice';
import { KPICard } from './KPICard';
import { SalesChart } from './SalesChart';
import { CategoryChart } from './CategoryChart';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { metrics, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  // Mock recent activities data
  const recentActivities = [
    {
      id: '1',
      type: 'sale' as const,
      title: 'New Sale Order',
      description: 'Order #SO-2024-001 created by John Doe',
      timestamp: new Date().toISOString(),
      amount: 1250
    },
    {
      id: '2',
      type: 'inventory' as const,
      title: 'Stock Updated',
      description: 'Cotton Fabric - Blue restocked (+500 yards)',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'customer' as const,
      title: 'New Customer',
      description: 'ABC Textiles registered as new customer',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '4',
      type: 'product' as const,
      title: 'Product Added',
      description: 'Silk Fabric - Premium Gold added to catalog',
      timestamp: new Date(Date.now() - 10800000).toISOString()
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchDashboardMetrics())}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Products"
            value={metrics?.totalProducts || 0}
            change="+12%"
            trend="up"
            icon={<Package className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <KPICard
            title="Low Stock Items"
            value={metrics?.lowStockItems || 0}
            change="-5%"
            trend="down"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="bg-yellow-500"
          />
          <KPICard
            title="Total Sales"
            value={`$${metrics?.totalSales?.toLocaleString() || 0}`}
            change="+18%"
            trend="up"
            icon={<DollarSign className="w-6 h-6" />}
            color="bg-green-500"
          />
          <KPICard
            title="Active Orders"
            value={metrics?.activeOrders || 0}
            change="+8%"
            trend="up"
            icon={<ShoppingBag className="w-6 h-6" />}
            color="bg-purple-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart data={metrics?.salesTrend || []} />
          <CategoryChart data={metrics?.categoryPerformance || []} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={recentActivities} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};