import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Download, Upload, Save, RotateCcw } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { Theme, lightTheme, darkTheme } from '../../config/theme';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="flex items-center space-x-2">
      <div 
        className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border-0 cursor-pointer"
      />
    </div>
  </div>
);

export const ThemeEditor: React.FC = () => {
  const { theme, themeMode, isDark } = useThemeContext();
  const [editingTheme, setEditingTheme] = useState<Theme>(theme);
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'components'>('colors');

  const handleColorChange = (section: string, key: string, value: string) => {
    setEditingTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [section]: typeof prev.colors[section as keyof typeof prev.colors] === 'object'
          ? { ...prev.colors[section as keyof typeof prev.colors], [key]: value }
          : value
      }
    }));
  };

  const handleReset = () => {
    setEditingTheme(isDark ? darkTheme : lightTheme);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(editingTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `serrano-tex-theme-${themeMode}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string);
          setEditingTheme(importedTheme);
        } catch (error) {
          console.error('Error importing theme:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Palette className="w-6 h-6 text-white" />
              <h1 className="text-xl font-bold text-white">Advanced Theme Editor</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <nav className="p-4 space-y-2">
              {[
                { id: 'colors', label: 'Colors', icon: Palette },
                { id: 'typography', label: 'Typography', icon: Save },
                { id: 'components', label: 'Components', icon: Save }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as any)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activeSection === id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeSection === 'colors' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Color Palette</h2>
                
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Primary Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Main"
                      value={editingTheme.colors.primary.main}
                      onChange={(value) => handleColorChange('primary', 'main', value)}
                    />
                    <ColorPicker
                      label="Light"
                      value={editingTheme.colors.primary.light}
                      onChange={(value) => handleColorChange('primary', 'light', value)}
                    />
                    <ColorPicker
                      label="Dark"
                      value={editingTheme.colors.primary.dark}
                      onChange={(value) => handleColorChange('primary', 'dark', value)}
                    />
                    <ColorPicker
                      label="Accent"
                      value={editingTheme.colors.primary.accent}
                      onChange={(value) => handleColorChange('primary', 'accent', value)}
                    />
                  </div>
                </div>

                {/* Status Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Status Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Success"
                      value={editingTheme.colors.status.success}
                      onChange={(value) => handleColorChange('status', 'success', value)}
                    />
                    <ColorPicker
                      label="Warning"
                      value={editingTheme.colors.status.warning}
                      onChange={(value) => handleColorChange('status', 'warning', value)}
                    />
                    <ColorPicker
                      label="Error"
                      value={editingTheme.colors.status.error}
                      onChange={(value) => handleColorChange('status', 'error', value)}
                    />
                    <ColorPicker
                      label="Info"
                      value={editingTheme.colors.status.info}
                      onChange={(value) => handleColorChange('status', 'info', value)}
                    />
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Live Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: editingTheme.colors.primary.main }}
                    >
                      Primary
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: editingTheme.colors.status.success }}
                    >
                      Success
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: editingTheme.colors.status.warning }}
                    >
                      Warning
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: editingTheme.colors.status.error }}
                    >
                      Error
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'typography' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Typography Settings</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Typography settings will be available in the next update. Currently showing preview of font hierarchy.
                  </p>
                </div>
                
                {/* Font Preview */}
                <div className="space-y-4">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">Heading 1</div>
                  <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">Heading 2</div>
                  <div className="text-3xl font-semibold text-gray-700 dark:text-gray-200">Heading 3</div>
                  <div className="text-xl text-gray-600 dark:text-gray-300">Body Large</div>
                  <div className="text-base text-gray-600 dark:text-gray-300">Body Regular</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Body Small</div>
                </div>
              </motion.div>
            )}

            {activeSection === 'components' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Component Styles</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200">
                    Component style editor will be available in the next update. Currently showing component previews.
                  </p>
                </div>

                {/* Component Previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Buttons</h3>
                    <div className="space-y-2">
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        Primary Button
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Secondary Button
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Cards</h3>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white">Sample Card</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">This is a preview of card styling</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};