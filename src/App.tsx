@@ .. @@
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
+import { Provider } from 'react-redux';
+import { PersistGate } from 'redux-persist/integration/react';
+import { store, persistor } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';
import { ThemeEditor } from './components/admin/ThemeEditor';
+import { Dashboard } from './components/dashboard/Dashboard';
import './index.css';

-const Dashboard: React.FC = () => {
-  return (
-    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
-      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
-        <div className="flex justify-between items-center mb-8">
-          <div>
-            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
-              Serrano Tex IMS
-            </h1>
-            <p className="text-gray-600 dark:text-gray-400 mt-1">
-              Advanced Inventory Management System
-            </p>
-          </div>
-          <ThemeToggle />
-        </div>
-
-        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
-          {[
-            { title: 'Total Products', value: '2,847', change: '+12%', color: 'bg-blue-500' },
-            { title: 'Low Stock Items', value: '23', change: '-5%', color: 'bg-yellow-500' },
-            { title: 'Total Sales', value: '$45,678', change: '+18%', color: 'bg-green-500' },
-            { title: 'Active Orders', value: '156', change: '+8%', color: 'bg-purple-500' },
-          ].map((stat, index) => (
-            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
-              <div className="flex items-center justify-between">
-                <div>
-                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
-                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
-                </div>
-                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
-                  <div className="w-6 h-6 bg-white rounded opacity-80"></div>
-                </div>
-              </div>
-              <div className="mt-4">
-                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
-                  {stat.change}
-                </span>
-                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
-              </div>
-            </div>
-          ))}
-        </div>
-
-        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
-          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
-            Welcome to Serrano Tex IMS
-          </h2>
-          <p className="text-gray-600 dark:text-gray-400 mb-4">
-            This is the advanced theme management system implementation. The theme system includes:
-          </p>
-          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
-            <li>Dynamic light/dark mode switching with system preference detection</li>
-            <li>Comprehensive color palette management</li>
-            <li>Advanced typography system</li>
-            <li>Component styling framework</li>
-            <li>Real-time theme preview and editing</li>
-            <li>Theme export/import functionality</li>
-            <li>Accessibility compliance features</li>
-          </ul>
-          <div className="mt-6">
-            <a 
-              href="/theme-editor" 
-              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
-            >
-              Open Theme Editor
-            </a>
-          </div>
-        </div>
-      </div>
-    </div>
-  );
-};
+const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
+  return (
+    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
+      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm">
+        <div>
+          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
+            Serrano Tex IMS
+          </h1>
+        </div>
+        <ThemeToggle />
+      </div>
+      {children}
+    </div>
+  );
+};

function App() {
  return (
-    <ThemeProvider>
-      <Router>
-        <Routes>
-          <Route path="/" element={<Dashboard />} />
-          <Route path="/theme-editor" element={<ThemeEditor />} />
-          <Route path="*" element={<Navigate to="/" replace />} />
-        </Routes>
-      </Router>
-    </ThemeProvider>
+    <Provider store={store}>
+      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
+        <ThemeProvider>
+          <Router>
+            <MainLayout>
+              <Routes>
+                <Route path="/" element={<Dashboard />} />
+                <Route path="/theme-editor" element={<ThemeEditor />} />
+                <Route path="*" element={<Navigate to="/" replace />} />
+              </Routes>
+            </MainLayout>
+          </Router>
+        </ThemeProvider>
+      </PersistGate>
+    </Provider>
  );
}

export default App;