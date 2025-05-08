"use client";

import React, { useState } from 'react';
import { Monitor, Moon, Sun, Globe, Bell, BellOff } from 'lucide-react';

interface ParametresApplicationProps {
  isLoading: boolean;
}

const ParametresApplication: React.FC<ParametresApplicationProps> = ({ isLoading }) => {
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'fr',
    notifications: true,
    emailNotifications: true,
    desktopNotifications: true,
    autoSave: true
  });

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    // Ici, vous pourriez implémenter la logique pour changer le thème
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, language: e.target.value }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--zalama-card)] rounded-lg shadow p-6 mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--zalama-card)] rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-text)]">Paramètres de l&apos;application</h2>
      
      <div className="space-y-6">
        {/* Thème */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Thème</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                settings.theme === 'light'
                  ? 'border-[var(--zalama-primary)] bg-[var(--zalama-primary-light)] text-[var(--zalama-primary)]'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun className="h-6 w-6 mb-2 text-[var(--zalama-text)]" />
              <span className="text-sm text-[var(--zalama-text)]">Clair</span>
            </button>
            
            <button
              type="button"
              className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                settings.theme === 'dark'
                  ? 'border-[var(--zalama-primary)] bg-[var(--zalama-primary-light)] text-[var(--zalama-primary)]'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon className="h-6 w-6 mb-2 text-[var(--zalama-text)]" />
              <span className="text-sm text-[var(--zalama-text)]">Sombre</span>
            </button>
            
            <button
              type="button"
              className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                settings.theme === 'system'
                  ? 'border-[var(--zalama-primary)] bg-[var(--zalama-primary-light)] text-[var(--zalama-primary)]'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleThemeChange('system')}
            >
              <Monitor className="h-6 w-6 mb-2 text-[var(--zalama-text)]" />
              <span className="text-sm text-[var(--zalama-text)]">Système</span>
            </button>
          </div>
        </div>
        
        {/* Langue */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Langue</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="language"
              name="language"
              className="pl-10 block w-full py-2 px-3 border border-[var(--zalama-border)] bg-[var(--zalama-bg-light)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--zalama-primary)] focus:border-[var(--zalama-primary)] sm:text-sm text-[var(--zalama-text)]"
              value={settings.language}
              onChange={handleLanguageChange}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        
        {/* Notifications */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {settings.notifications ? (
                  <Bell className="h-5 w-5 text-gray-400 mr-3" />
                ) : (
                  <BellOff className="h-5 w-5 text-gray-400 mr-3" />
                )}
                <span className="text-sm text-[var(--zalama-text)]">Activer les notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications"
                  className="sr-only peer"
                  checked={settings.notifications}
                  onChange={handleToggleChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--zalama-primary-light)] dark:peer-focus:ring-[var(--zalama-primary-dark)] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--zalama-primary)]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between pl-8">
              <span className="text-sm text-[var(--zalama-text)]">Notifications par email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={handleToggleChange}
                  disabled={!settings.notifications}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--zalama-primary-light)] dark:peer-focus:ring-[var(--zalama-primary-dark)] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--zalama-primary)] ${!settings.notifications ? 'opacity-50' : ''}`}></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between pl-8">
              <span className="text-sm text-[var(--zalama-text)]">Notifications de bureau</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="desktopNotifications"
                  className="sr-only peer"
                  checked={settings.desktopNotifications}
                  onChange={handleToggleChange}
                  disabled={!settings.notifications}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--zalama-primary-light)] dark:peer-focus:ring-[var(--zalama-primary-dark)] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--zalama-primary)] ${!settings.notifications ? 'opacity-50' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Autres paramètres */}
        <div>
          <h3 className="text-lg font-medium text-[var(--zalama-text)] mb-3">Autres paramètres</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--zalama-text)]">Enregistrement automatique</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="autoSave"
                  className="sr-only peer"
                  checked={settings.autoSave}
                  onChange={handleToggleChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--zalama-primary-light)] dark:peer-focus:ring-[var(--zalama-primary-dark)] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--zalama-primary)]"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--zalama-primary)] hover:bg-[var(--zalama-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--zalama-primary)]"
          >
            Enregistrer les paramètres
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParametresApplication;
