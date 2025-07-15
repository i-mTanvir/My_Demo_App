import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, ShoppingCart, Users, FileText, Settings } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

export const QuickActions: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'Create new product',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Add product')
    },
    {
      id: 'manage-inventory',
      title: 'Inventory',
      description: 'Manage stock levels',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Manage inventory')
    },
    {
      id: 'new-sale',
      title: 'New Sale',
      description: 'Create sales order',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('New sale')
    },
    {
      id: 'add-customer',
      title: 'Add Customer',
      description: 'Register new customer',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Add customer')
    },
    {
      id: 'generate-report',
      title: 'Reports',
      description: 'View analytics',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => console.log('Generate report')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => console.log('Settings')
    }
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            className={`
              ${action.color} text-white p-4 rounded-lg transition-all duration-200
              flex flex-col items-center text-center space-y-2
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            `}
            onClick={action.onClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-2 bg-white/20 rounded-full">
              {action.icon}
            </div>
            <div>
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs opacity-90">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};